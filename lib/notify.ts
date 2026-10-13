import "server-only";

import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

import { Resend } from "resend";

import { env, smsEnabled } from "./env";

type Email = { to: string; subject: string; text: string };

let resend: Resend | undefined;

/** Dev/test transport: drop the message into MAIL_OUTBOX_DIR for inspection. */
async function writeOutbox(kind: "email" | "sms", message: object) {
  const dir = env().MAIL_OUTBOX_DIR!;
  await mkdir(dir, { recursive: true });
  const file = join(dir, `${Date.now()}-${kind}-${randomUUID()}.json`);
  await writeFile(file, JSON.stringify({ kind, ...message }, null, 2));
}

const escapeHtml = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

export async function sendEmail({ to, subject, text }: Email) {
  const { RESEND_API_KEY, EMAIL_FROM, MAIL_OUTBOX_DIR } = env();

  if (!RESEND_API_KEY && MAIL_OUTBOX_DIR) return writeOutbox("email", { to, subject, text });

  resend ??= new Resend(RESEND_API_KEY);
  const html = text
    .split("\n\n")
    .map(
      (p) =>
        `<p style="font:15px/1.6 system-ui,sans-serif;color:#241a2b">${escapeHtml(p).replace(/\n/g, "<br>")}</p>`
    )
    .join("");
  const { error } = await resend.emails.send({ from: EMAIL_FROM, to, subject, text, html });
  if (error) throw new Error(`Email send failed: ${error.message}`);
}

/** Sends an SMS via Twilio's REST API. Returns false when SMS isn't configured. */
async function sendSms(to: string, body: string) {
  const e = env();
  if (!smsEnabled()) {
    if (e.MAIL_OUTBOX_DIR) await writeOutbox("sms", { to, body });
    return false;
  }

  const auth = Buffer.from(`${e.TWILIO_ACCOUNT_SID}:${e.TWILIO_AUTH_TOKEN}`).toString("base64");
  const res = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${e.TWILIO_ACCOUNT_SID}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ To: to, From: e.TWILIO_FROM!, Body: body }),
    }
  );
  if (!res.ok) throw new Error(`SMS send failed: ${res.status} ${await res.text()}`);
  return true;
}

/**
 * Tells a patient about an appointment change by email, plus SMS when configured.
 * Never throws — a failed notification must not undo a saved booking change.
 */
export async function notifyPatient(
  patient: { email: string; phone: string; name: string },
  subject: string,
  message: string
) {
  const firstName = patient.name.split(" ")[0];
  const results = await Promise.allSettled([
    sendEmail({
      to: patient.email,
      subject,
      text: `Hi ${firstName},\n\n${message}\n\nPollards`,
    }),
    sendSms(patient.phone, `Pollards: ${message}`),
  ]);
  for (const r of results) if (r.status === "rejected") console.error("notifyPatient:", r.reason);
  return results[0].status === "fulfilled";
}
