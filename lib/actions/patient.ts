"use server";

import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";

import { redirect } from "next/navigation";

import { ACCEPTED_ID_DOCUMENT_TYPES, MAX_ID_DOCUMENT_BYTES } from "@/constants";
import type { ActionResult } from "@/types";

import { query } from "../db";
import { env } from "../env";
import { CODE_TTL_MINUTES, checkLoginCode, issueLoginCode } from "../login-codes";
import { sendEmail } from "../notify";
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
const TOO_MANY = "Too many attempts. Please wait a few minutes and try again.";
const EXPIRED = "Your code has expired. Please start again.";

// ---------- Step 1: email one-time code ----------

const sendPerEmail = createRateLimiter({ limit: 3, windowMs: 10 * 60_000 });
const sendPerIp = createRateLimiter({ limit: 10, windowMs: 10 * 60_000 });

async function emailCode(email: string) {
  const code = await issueLoginCode(email);
  await sendEmail({
    to: email,
    subject: `${code} is your Pollards sign-in code`,
    text: `Your Pollards sign-in code is ${code}\n\nIt expires in ${CODE_TTL_MINUTES} minutes. If you didn't ask for it, you can ignore this email.`,
  });
}

/** Emails a 6-digit code. The patient record is only created once the code is verified. */
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
    await emailCode(email);
    await createOtpChallenge({ email, name, phone });
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
  if (!challenge) return { ok: false, error: EXPIRED };
  if (sendPerEmail.isLimited(challenge.email)) return { ok: false, error: TOO_MANY };
  sendPerEmail.record(challenge.email);

  try {
    await emailCode(challenge.email);
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
  if (!challenge) return { ok: false, error: EXPIRED };

  let patient: { id: string; registered: boolean };
  try {
    const result = await checkLoginCode(challenge.email, parsed.data.code);
    if (result === "invalid") {
      return { ok: false, error: "That code isn't right. Please try again." };
    }
    if (result === "expired") {
      return { ok: false, error: "That code has expired or been used. Please request a new one." };
    }
    patient = await upsertPatient(challenge);
  } catch (error) {
    console.error("verifyCode failed", error);
    return { ok: false, error: GENERIC_ERROR };
  }

  await clearOtpChallenge();
  await createPatientSession(patient.id);
  redirect(
    patient.registered
      ? `/patients/${patient.id}/new-appointment`
      : `/patients/${patient.id}/register`
  );
}

/** New emails get a record; returning patients keep their stored details. */
async function upsertPatient({ email, name, phone }: OtpChallenge) {
  const { rows } = await query<{ id: string; registered: boolean }>(
    `INSERT INTO patients (email, name, phone) VALUES ($1, $2, $3)
     ON CONFLICT (email) DO UPDATE SET updated_at = now()
     RETURNING id, registered_at IS NOT NULL AS registered`,
    [email, name, phone]
  );
  return rows[0];
}

// ---------- Step 2: registration ----------

const EXTENSIONS: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "application/pdf": ".pdf",
};

/** Stores an ID document under UPLOAD_DIR/<patientId>/ and returns its relative path. */
async function storeIdDocument(patientId: string, file: File) {
  const relative = join(patientId, `${randomUUID()}${EXTENSIONS[file.type]}`);
  const dir = resolve(env().UPLOAD_DIR, patientId);
  await mkdir(dir, { recursive: true, mode: 0o700 });
  await writeFile(resolve(env().UPLOAD_DIR, relative), Buffer.from(await file.arrayBuffer()), {
    mode: 0o600,
  });
  return relative;
}

export async function registerPatient(formData: FormData): Promise<ActionResult> {
  const patientId = await getPatientUserId();
  if (!patientId) return { ok: false, error: "Your session has expired. Please start again." };

  let raw: Record<string, unknown>;
  try {
    raw = JSON.parse(String(formData.get("data") ?? "{}"));
  } catch {
    return { ok: false, error: "Invalid submission." };
  }
  const parsed = PatientSchema.safeParse({ ...raw, birthDate: new Date(String(raw.birthDate)) });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };

  const file = formData.get("identificationDocument");
  const hasFile = file instanceof File && file.size > 0;
  if (hasFile) {
    if (file.size > MAX_ID_DOCUMENT_BYTES) {
      return { ok: false, error: "ID document must be 4 MB or smaller." };
    }
    if (!(file.type in ACCEPTED_ID_DOCUMENT_TYPES)) {
      return { ok: false, error: "ID document must be a JPG, PNG, WebP or PDF." };
    }
  }

  const p = parsed.data;
  try {
    const document = hasFile ? await storeIdDocument(patientId, file) : null;
    // Email is deliberately not updated: it's the address the sign-in code verified.
    // `registered_at IS NULL` makes registration a one-time step.
    await query(
      `UPDATE patients SET
         name = $2, phone = $3, birth_date = $4, gender = $5, address = $6,
         occupation = $7, emergency_contact_name = $8, emergency_contact_number = $9,
         primary_physician = $10, insurance_provider = $11, insurance_policy_number = $12,
         allergies = $13, current_medication = $14, family_medical_history = $15,
         past_medical_history = $16, identification_type = $17, identification_number = $18,
         identification_document = $19, treatment_consent = $20, disclosure_consent = $21,
         privacy_consent = $22, registered_at = now(), updated_at = now()
       WHERE id = $1 AND registered_at IS NULL`,
      [
        patientId,
        p.name,
        p.phone,
        p.birthDate.toISOString().slice(0, 10),
        p.gender,
        p.address,
        p.occupation,
        p.emergencyContactName,
        p.emergencyContactNumber,
        p.primaryPhysician,
        p.insuranceProvider,
        p.insurancePolicyNumber,
        p.allergies || null,
        p.currentMedication || null,
        p.familyMedicalHistory || null,
        p.pastMedicalHistory || null,
        p.identificationType || null,
        p.identificationNumber || null,
        document,
        p.treatmentConsent,
        p.disclosureConsent,
        p.privacyConsent,
      ]
    );
  } catch (error) {
    console.error("registerPatient failed", error);
    return { ok: false, error: GENERIC_ERROR };
  }

  redirect(`/patients/${patientId}/new-appointment`);
}
