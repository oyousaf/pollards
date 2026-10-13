import { readFile } from "node:fs/promises";

import { PGlite } from "@electric-sql/pglite";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

// Real Postgres (PGlite, in-process) behind the app's `query` helper, so the SQL is exercised.
const pglite = new PGlite();

vi.mock("@/lib/db", () => ({
  query: async (text: string, params: unknown[] = []) => {
    const result = await pglite.query(text, params);
    return { rows: result.rows, rowCount: result.affectedRows ?? result.rows.length };
  },
}));

vi.stubEnv("DATABASE_URL", "postgres://unused");
vi.stubEnv("ADMIN_PASSKEY", "1234");
vi.stubEnv("SESSION_SECRET", "unit-test-secret-unit-test-secret-0000");
vi.stubEnv("MAIL_OUTBOX_DIR", "unused");

const { checkLoginCode, issueLoginCode } = await import("@/lib/login-codes");

const EMAIL = "jane@example.com";

beforeAll(async () => {
  await pglite.exec(await readFile("db/migrations/001_initial.sql", "utf8"));
});

beforeEach(async () => {
  await pglite.exec("TRUNCATE login_codes");
});

describe("login codes", () => {
  it("issues a 6-digit code and stores only its hash", async () => {
    const code = await issueLoginCode(EMAIL);
    expect(code).toMatch(/^\d{6}$/);
    const { rows } = await pglite.query<{ code_hash: string }>("SELECT code_hash FROM login_codes");
    expect(rows).toHaveLength(1);
    expect(rows[0].code_hash).not.toContain(code);
  });

  it("accepts the right code exactly once", async () => {
    const code = await issueLoginCode(EMAIL);
    expect(await checkLoginCode(EMAIL, code)).toBe("valid");
    expect(await checkLoginCode(EMAIL, code)).toBe("expired");
  });

  it("is tied to the email it was sent to", async () => {
    const code = await issueLoginCode(EMAIL);
    expect(await checkLoginCode("someone@else.com", code)).toBe("expired");
  });

  it("locks after five wrong attempts, even if the right code follows", async () => {
    const code = await issueLoginCode(EMAIL);
    const wrong = code === "000000" ? "111111" : "000000";
    for (let i = 0; i < 4; i++) expect(await checkLoginCode(EMAIL, wrong)).toBe("invalid");
    expect(await checkLoginCode(EMAIL, wrong)).toBe("expired");
    expect(await checkLoginCode(EMAIL, code)).toBe("expired");
  });

  it("invalidates the previous code when a new one is issued", async () => {
    const first = await issueLoginCode(EMAIL);
    const second = await issueLoginCode(EMAIL);
    if (first !== second) expect(await checkLoginCode(EMAIL, first)).toBe("invalid");
    expect(await checkLoginCode(EMAIL, second)).toBe("valid");
  });

  it("rejects an expired code", async () => {
    const code = await issueLoginCode(EMAIL);
    await pglite.exec("UPDATE login_codes SET expires_at = now() - interval '1 minute'");
    expect(await checkLoginCode(EMAIL, code)).toBe("expired");
  });
});
