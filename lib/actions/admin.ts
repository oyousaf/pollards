"use server";

import { createHash, timingSafeEqual } from "node:crypto";

import { redirect } from "next/navigation";

import type { ActionResult } from "@/types";

import { env } from "../env";
import { clientIp, createRateLimiter } from "../rate-limit";
import { createAdminSession, destroyAdminSession } from "../session";
import { PasskeySchema } from "../validation";

// A 4-digit passcode has only 10,000 combinations, so failures are limited per IP
// *and* globally (stops brute force spread across many IPs).
const perIp = createRateLimiter({ limit: 5, windowMs: 15 * 60_000 });
const global = createRateLimiter({ limit: 25, windowMs: 60 * 60_000 });
const GLOBAL_KEY = "all";

const digest = (value: string) => createHash("sha256").update(value).digest();

export async function adminLogin(input: { passkey: string }): Promise<ActionResult> {
  const parsed = PasskeySchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };

  const ip = await clientIp();
  if (perIp.isLimited(ip) || global.isLimited(GLOBAL_KEY)) {
    return { ok: false, error: "Too many attempts. Please wait a few minutes and try again." };
  }

  if (!timingSafeEqual(digest(parsed.data.passkey), digest(env().ADMIN_PASSKEY))) {
    perIp.record(ip);
    global.record(GLOBAL_KEY);
    return { ok: false, error: "That passcode isn't right. Please try again." };
  }

  perIp.reset(ip);
  await createAdminSession();
  redirect("/admin");
}

export async function adminLogout() {
  await destroyAdminSession();
  redirect("/");
}
