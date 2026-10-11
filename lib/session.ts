import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";

import { env } from "./env";
import { ADMIN_COOKIE, OTP_COOKIE, PATIENT_COOKIE, signToken, verifyToken } from "./tokens";

const ADMIN_TTL_SECONDS = 60 * 60 * 8;
const PATIENT_TTL_SECONDS = 60 * 60 * 24 * 7;

const cookieOptions = (maxAge: number) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge,
});

// ---------- Admin ----------

export async function createAdminSession() {
  const token = await signToken({ role: "admin" }, env().SESSION_SECRET, ADMIN_TTL_SECONDS);
  (await cookies()).set(ADMIN_COOKIE, token, cookieOptions(ADMIN_TTL_SECONDS));
}

export async function destroyAdminSession() {
  (await cookies()).delete(ADMIN_COOKIE);
}

export const isAdmin = cache(async () => {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  const payload = await verifyToken(token, env().SESSION_SECRET);
  return payload?.role === "admin";
});

/** Authorisation gate for admin pages and server actions. */
export async function requireAdmin() {
  if (!(await isAdmin())) redirect("/admin/login");
}

// ---------- Patient ----------

export async function createPatientSession(userId: string) {
  const token = await signToken({ sub: userId }, env().SESSION_SECRET, PATIENT_TTL_SECONDS);
  (await cookies()).set(PATIENT_COOKIE, token, cookieOptions(PATIENT_TTL_SECONDS));
}

export const getPatientUserId = cache(async () => {
  const token = (await cookies()).get(PATIENT_COOKIE)?.value;
  const payload = await verifyToken(token, env().SESSION_SECRET);
  return typeof payload?.sub === "string" ? payload.sub : null;
});

/** Ensures the visitor owns the patient record in the URL (prevents ID-guessing). */
export async function requirePatient(userId: string) {
  const sessionUserId = await getPatientUserId();
  if (!sessionUserId || sessionUserId !== userId) redirect("/");
  return sessionUserId;
}

// ---------- Email OTP challenge ----------

const OTP_TTL_SECONDS = 15 * 60; // matches Appwrite's email token lifetime

export type OtpChallenge = { userId: string; email: string; name: string; phone: string };

/** Remembers who we sent a code to, so the verify step can't be pointed at another user. */
export async function createOtpChallenge(challenge: OtpChallenge) {
  const token = await signToken(
    { sub: challenge.userId, email: challenge.email, name: challenge.name, phone: challenge.phone },
    env().SESSION_SECRET,
    OTP_TTL_SECONDS
  );
  (await cookies()).set(OTP_COOKIE, token, cookieOptions(OTP_TTL_SECONDS));
}

export async function getOtpChallenge(): Promise<OtpChallenge | null> {
  const token = (await cookies()).get(OTP_COOKIE)?.value;
  const p = await verifyToken(token, env().SESSION_SECRET);
  if (!p || typeof p.sub !== "string") return null;
  return { userId: p.sub, email: String(p.email), name: String(p.name), phone: String(p.phone) };
}

export async function clearOtpChallenge() {
  (await cookies()).delete(OTP_COOKIE);
}
