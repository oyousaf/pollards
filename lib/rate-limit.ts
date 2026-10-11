/**
 * Sliding-window rate limiter. In-memory, so limits are per server instance —
 * fine for a single VPS process; use Redis/Upstash if you run several instances.
 */
export function createRateLimiter({
  limit,
  windowMs,
  now = Date.now,
}: {
  limit: number;
  windowMs: number;
  now?: () => number;
}) {
  const hits = new Map<string, number[]>();

  const recent = (key: string) => {
    const cutoff = now() - windowMs;
    const list = (hits.get(key) ?? []).filter((t) => t > cutoff);
    if (list.length) hits.set(key, list);
    else hits.delete(key);
    return list;
  };

  return {
    isLimited: (key: string) => recent(key).length >= limit,
    record: (key: string) => {
      hits.set(key, [...recent(key), now()]);
    },
    reset: (key: string) => {
      hits.delete(key);
    },
  };
}

export async function clientIp() {
  const { headers } = await import("next/headers");
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
}
