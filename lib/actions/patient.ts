"use server";

import { AppwriteException, ID } from "node-appwrite";
import { InputFile } from "node-appwrite/file";
import { redirect } from "next/navigation";

import { ACCEPTED_ID_DOCUMENT_TYPES, MAX_ID_DOCUMENT_BYTES } from "@/constants";
import type { ActionResult } from "@/types";

import { appwrite } from "../appwrite";
import { findPatient } from "../data";
import { env } from "../env";
import { clientIp, createRateLimiter } from "../rate-limit";
import {
  clearOtpChallenge,
  createOtpChallenge,
  createPatientSession,
  getOtpChallenge,
  getPatientUserId,
  type OtpChallenge,
} from "../session";
import { maskEmail } from "../utils";
import { OtpSchema, PatientSchema, UserSchema, type UserInput } from "../validation";

const GENERIC_ERROR = "Something went wrong on our side. Please try again in a moment.";

// ---------- Step 1: email one-time code ----------

const sendPerEmail = createRateLimiter({ limit: 3, windowMs: 10 * 60_000 });
const sendPerIp = createRateLimiter({ limit: 10, windowMs: 10 * 60_000 });
const verifyPerUser = createRateLimiter({ limit: 5, windowMs: 15 * 60_000 });

const TOO_MANY = "Too many attempts. Please wait a few minutes and try again.";

async function sendCode(userId: string, email: string) {
  // For an existing email Appwrite ignores the userId we pass and returns the real one.
  const token = await appwrite().account.createEmailToken({ userId, email });
  return token.userId;
}

/** Sends a 6-digit code to the patient's email. New emails get an account automatically. */
export async function startBooking(input: UserInput): Promise<ActionResult<{ email: string }>> {
  const parsed = UserSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const { name, email, phone } = parsed.data;

  const ip = await clientIp();
  if (sendPerEmail.isLimited(email) || sendPerIp.isLimited(ip))
    return { ok: false, error: TOO_MANY };
  sendPerEmail.record(email);
  sendPerIp.record(ip);

  try {
    const userId = await sendCode(ID.unique(), email);
    await createOtpChallenge({ userId, email, name, phone });
    return { ok: true, data: { email: maskEmail(email) } };
  } catch (error) {
    console.error("startBooking: sending code failed", error);
    return {
      ok: false,
      error: "We couldn't send a code to that email. Please check it and try again.",
    };
  }
}

export async function resendCode(): Promise<ActionResult> {
  const challenge = await getOtpChallenge();
  if (!challenge) return { ok: false, error: "Your code has expired. Please start again." };
  if (sendPerEmail.isLimited(challenge.email)) return { ok: false, error: TOO_MANY };
  sendPerEmail.record(challenge.email);

  try {
    await sendCode(challenge.userId, challenge.email);
    return { ok: true };
  } catch (error) {
    console.error("resendCode failed", error);
    return { ok: false, error: GENERIC_ERROR };
  }
}

/** Verifies the code, signs the patient in, then routes to registration or booking. */
export async function verifyCode(input: { code: string }): Promise<ActionResult> {
  const parsed = OtpSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };

  const challenge = await getOtpChallenge();
  if (!challenge) return { ok: false, error: "Your code has expired. Please start again." };
  const { userId } = challenge;
  if (verifyPerUser.isLimited(userId)) return { ok: false, error: TOO_MANY };

  const { account, users } = appwrite();
  try {
    // Appwrite validates the code by exchanging it for a session. We only need the proof,
    // so the Appwrite session is removed and our own httpOnly cookie is used instead.
    const session = await account.createSession({ userId, secret: parsed.data.code });
    await users.deleteSession({ userId, sessionId: session.$id }).catch(() => {});
  } catch (error) {
    verifyPerUser.record(userId);
    if (error instanceof AppwriteException && [400, 401, 404].includes(error.code)) {
      return { ok: false, error: "That code isn't right or has expired. Please try again." };
    }
    console.error("verifyCode failed", error);
    return { ok: false, error: GENERIC_ERROR };
  }

  verifyPerUser.reset(userId);
  await completeProfile(challenge);
  await clearOtpChallenge();
  await createPatientSession(userId);

  const patient = await findPatient(userId);
  redirect(patient ? `/patients/${userId}/new-appointment` : `/patients/${userId}/register`);
}

/** New accounts are created by the email token with no name/phone — fill them in. */
async function completeProfile({ userId, name, phone }: OtpChallenge) {
  const { users } = appwrite();
  try {
    const user = await users.get({ userId });
    if (!user.name) await users.updateName({ userId, name });
    // Phone powers SMS confirmations. It must be unique in Appwrite, so a clash is non-fatal.
    if (!user.phone) await users.updatePhone({ userId, number: phone });
  } catch (error) {
    console.warn("completeProfile: could not update name/phone", error);
  }
}

/** Step 2: full patient registration, with an optional ID document upload. */
export async function registerPatient(formData: FormData): Promise<ActionResult> {
  const userId = await getPatientUserId();
  if (!userId) return { ok: false, error: "Your session has expired. Please start again." };

  let raw: Record<string, unknown>;
  try {
    raw = JSON.parse(String(formData.get("data") ?? "{}"));
  } catch {
    return { ok: false, error: "Invalid submission." };
  }
  const parsed = PatientSchema.safeParse({ ...raw, birthDate: new Date(String(raw.birthDate)) });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };

  const file = formData.get("identificationDocument");
  if (file instanceof File && file.size > 0) {
    if (file.size > MAX_ID_DOCUMENT_BYTES) {
      return { ok: false, error: "ID document must be 5 MB or smaller." };
    }
    if (!(file.type in ACCEPTED_ID_DOCUMENT_TYPES)) {
      return { ok: false, error: "ID document must be a JPG, PNG, WebP or PDF." };
    }
  }

  if (await findPatient(userId)) redirect(`/patients/${userId}/new-appointment`);

  const {
    APPWRITE_DATABASE_ID,
    APPWRITE_PATIENT_TABLE_ID,
    APPWRITE_BUCKET_ID,
    APPWRITE_ENDPOINT,
    APPWRITE_PROJECT_ID,
  } = env();
  const { storage, tables } = appwrite();

  try {
    let fileId: string | null = null;
    if (file instanceof File && file.size > 0) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const uploaded = await storage.createFile({
        bucketId: APPWRITE_BUCKET_ID,
        fileId: ID.unique(),
        file: InputFile.fromBuffer(buffer, file.name),
      });
      fileId = uploaded.$id;
    }

    // Consent flags other than privacy are validated but not stored (no columns for them).
    const { treatmentConsent: _t, disclosureConsent: _d, ...patient } = parsed.data;

    await tables.createRow({
      databaseId: APPWRITE_DATABASE_ID,
      tableId: APPWRITE_PATIENT_TABLE_ID,
      rowId: ID.unique(),
      data: {
        ...patient,
        userId,
        birthDate: patient.birthDate.toISOString(),
        identificationDocumentId: fileId,
        identificationDocumentUrl: fileId
          ? `${APPWRITE_ENDPOINT}/storage/buckets/${APPWRITE_BUCKET_ID}/files/${fileId}/view?project=${APPWRITE_PROJECT_ID}`
          : null,
      },
    });
  } catch (error) {
    console.error("registerPatient failed", error);
    return { ok: false, error: GENERIC_ERROR };
  }

  redirect(`/patients/${userId}/new-appointment`);
}
