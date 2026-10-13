import "server-only";

import { z } from "zod";

const optional = z
  .string()
  .trim()
  .optional()
  .transform((v) => v || undefined);

const schema = z
  .object({
    DATABASE_URL: z.string().regex(/^postgres(ql)?:\/\//, "DATABASE_URL must be a postgres:// URL"),
    DATABASE_SSL: optional,
    DATABASE_POOL_MAX: z.coerce.number().int().positive().default(10),

    ADMIN_PASSKEY: z.string().regex(/^\d{4}$/, "ADMIN_PASSKEY must be exactly 4 digits"),
    SESSION_SECRET: z.string().min(32, "SESSION_SECRET must be at least 32 characters"),

    // Email (sign-in codes + appointment updates). Resend in production.
    RESEND_API_KEY: optional,
    EMAIL_FROM: z.string().default("Pollards Opticians <bookings@pollards.info>"),
    // Dev/test only: write outgoing email/SMS as JSON files here instead of sending.
    MAIL_OUTBOX_DIR: optional,

    // Optional SMS via Twilio. Leave unset to notify by email only.
    TWILIO_ACCOUNT_SID: optional,
    TWILIO_AUTH_TOKEN: optional,
    TWILIO_FROM: optional,

    // ID documents are written here — outside /public, never served directly.
    UPLOAD_DIR: z.string().default("./storage/uploads"),
  })
  .refine((e) => e.RESEND_API_KEY || e.MAIL_OUTBOX_DIR, {
    message:
      "Set RESEND_API_KEY (or MAIL_OUTBOX_DIR for local testing) so sign-in codes can be sent",
    path: ["RESEND_API_KEY"],
  });

export type Env = z.infer<typeof schema>;

let cached: Env | undefined;

/**
 * Validated server environment. Resolved lazily so `next build` works without secrets,
 * but any request touching the backend fails fast with a clear message.
 */
export function env(): Env {
  if (cached) return cached;

  const parsed = schema.safeParse(process.env);
  if (!parsed.success) {
    throw new Error(
      `Invalid server environment:\n${z.prettifyError(parsed.error)}\nSee .env.example.`
    );
  }

  cached = parsed.data;
  return cached;
}

export const smsEnabled = () => {
  const e = env();
  return Boolean(e.TWILIO_ACCOUNT_SID && e.TWILIO_AUTH_TOKEN && e.TWILIO_FROM);
};
