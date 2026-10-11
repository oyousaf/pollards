import "server-only";

import { z } from "zod";

const schema = z.object({
  APPWRITE_ENDPOINT: z.url(),
  APPWRITE_PROJECT_ID: z.string().min(1),
  APPWRITE_API_KEY: z.string().min(1),
  APPWRITE_DATABASE_ID: z.string().min(1),
  APPWRITE_PATIENT_TABLE_ID: z.string().min(1),
  APPWRITE_APPOINTMENT_TABLE_ID: z.string().min(1),
  APPWRITE_BUCKET_ID: z.string().min(1),
  ADMIN_PASSKEY: z.string().regex(/^\d{4}$/, "ADMIN_PASSKEY must be exactly 4 digits"),
  SESSION_SECRET: z.string().min(32, "SESSION_SECRET must be at least 32 characters"),
});

export type Env = z.infer<typeof schema>;

let cached: Env | undefined;

/**
 * Validated server environment. Resolved lazily so `next build` works without secrets,
 * but any request touching the backend fails fast with a clear message.
 * Legacy variable names from the original deployment are still accepted.
 */
export function env(): Env {
  if (cached) return cached;

  const e = process.env;
  const parsed = schema.safeParse({
    APPWRITE_ENDPOINT: e.APPWRITE_ENDPOINT ?? e.NEXT_PUBLIC_ENDPOINT,
    APPWRITE_PROJECT_ID: e.APPWRITE_PROJECT_ID ?? e.PROJECT_ID,
    APPWRITE_API_KEY: e.APPWRITE_API_KEY ?? e.API_KEY,
    APPWRITE_DATABASE_ID: e.APPWRITE_DATABASE_ID ?? e.DATABASE_ID,
    APPWRITE_PATIENT_TABLE_ID: e.APPWRITE_PATIENT_TABLE_ID ?? e.PATIENT_COLLECTION_ID,
    APPWRITE_APPOINTMENT_TABLE_ID: e.APPWRITE_APPOINTMENT_TABLE_ID ?? e.APPOINTMENT_COLLECTION_ID,
    APPWRITE_BUCKET_ID: e.APPWRITE_BUCKET_ID ?? e.NEXT_PUBLIC_BUCKET_ID,
    ADMIN_PASSKEY: e.ADMIN_PASSKEY,
    SESSION_SECRET: e.SESSION_SECRET,
  });

  if (!parsed.success) {
    throw new Error(
      `Invalid server environment:\n${z.prettifyError(parsed.error)}\nSee .env.example.`
    );
  }

  cached = parsed.data;
  return cached;
}
