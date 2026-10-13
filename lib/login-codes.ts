import "server-only";

import { createHmac, randomInt, timingSafeEqual } from "node:crypto";

import { query } from "./db";
import { env } from "./env";

export const CODE_TTL_MINUTES = 15;
const MAX_ATTEMPTS = 5;

/** Keyed hash: a leaked database row can't be brute-forced without SESSION_SECRET. */
const hashCode = (email: string, code: string) =>
  createHmac("sha256", env().SESSION_SECRET).update(`${email}:${code}`).digest("hex");

/** Issues a fresh 6-digit code for an email. Earlier codes for that email stop working. */
export async function issueLoginCode(email: string) {
  const code = randomInt(0, 1_000_000).toString().padStart(6, "0");

  await query(
    "UPDATE login_codes SET consumed_at = now() WHERE email = $1 AND consumed_at IS NULL",
    [email]
  );
  await query(
    `INSERT INTO login_codes (email, code_hash, expires_at)
     VALUES ($1, $2, now() + make_interval(mins => $3))`,
    [email, hashCode(email, code), CODE_TTL_MINUTES]
  );
  // Housekeeping: old codes are useless, so don't keep them around.
  await query("DELETE FROM login_codes WHERE expires_at < now() - interval '1 day'");

  return code;
}

export type CodeCheck = "valid" | "invalid" | "expired";

/** Checks a code, counting failed attempts. A code works once and locks after 5 misses. */
export async function checkLoginCode(email: string, code: string): Promise<CodeCheck> {
  const { rows } = await query<{ id: string; code_hash: string; attempts: number }>(
    `SELECT id, code_hash, attempts FROM login_codes
     WHERE email = $1 AND consumed_at IS NULL AND expires_at > now()
     ORDER BY created_at DESC LIMIT 1`,
    [email]
  );
  const row = rows[0];
  if (!row || row.attempts >= MAX_ATTEMPTS) return "expired";

  const expected = Buffer.from(row.code_hash, "hex");
  const actual = Buffer.from(hashCode(email, code), "hex");
  if (!timingSafeEqual(expected, actual)) {
    await query("UPDATE login_codes SET attempts = attempts + 1 WHERE id = $1", [row.id]);
    return row.attempts + 1 >= MAX_ATTEMPTS ? "expired" : "invalid";
  }

  // Conditional update makes the code single-use even under concurrent submits.
  const { rowCount } = await query(
    "UPDATE login_codes SET consumed_at = now() WHERE id = $1 AND consumed_at IS NULL",
    [row.id]
  );
  return rowCount === 1 ? "valid" : "expired";
}
