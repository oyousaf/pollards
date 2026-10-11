import { jwtVerify, SignJWT, type JWTPayload } from "jose";

// Edge-safe token helpers shared by `proxy.ts` and server code.

export const ADMIN_COOKIE = "pollards_admin";
export const PATIENT_COOKIE = "pollards_patient";
export const OTP_COOKIE = "pollards_otp";

const key = (secret: string) => new TextEncoder().encode(secret);

export async function signToken(payload: JWTPayload, secret: string, ttlSeconds: number) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${ttlSeconds}s`)
    .sign(key(secret));
}

export async function verifyToken(token: string | undefined, secret: string) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, key(secret), {
      algorithms: ["HS256"],
    });
    return payload;
  } catch {
    return null;
  }
}
