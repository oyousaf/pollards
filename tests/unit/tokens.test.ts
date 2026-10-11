import { describe, expect, it } from "vitest";

import { signToken, verifyToken } from "@/lib/tokens";

const SECRET = "test-secret-test-secret-test-secret-123";

describe("session tokens", () => {
  it("round-trips a payload", async () => {
    const token = await signToken({ role: "admin" }, SECRET, 60);
    expect(await verifyToken(token, SECRET)).toMatchObject({ role: "admin" });
  });

  it("rejects a token signed with another secret", async () => {
    const token = await signToken({ role: "admin" }, "another-secret-another-secret-123456", 60);
    expect(await verifyToken(token, SECRET)).toBeNull();
  });

  it("rejects a tampered payload", async () => {
    const token = await signToken({ sub: "user-1" }, SECRET, 60);
    const [header, , signature] = token.split(".");
    const forged = Buffer.from(JSON.stringify({ sub: "user-2" })).toString("base64url");
    expect(await verifyToken(`${header}.${forged}.${signature}`, SECRET)).toBeNull();
  });

  it("rejects an expired token", async () => {
    const token = await signToken({ role: "admin" }, SECRET, -1);
    expect(await verifyToken(token, SECRET)).toBeNull();
  });

  it("handles a missing token", async () => {
    expect(await verifyToken(undefined, SECRET)).toBeNull();
  });
});
