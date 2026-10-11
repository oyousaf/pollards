import { describe, expect, it } from "vitest";

import { createRateLimiter } from "@/lib/rate-limit";

function setup() {
  let now = 0;
  const limiter = createRateLimiter({ limit: 3, windowMs: 1000, now: () => now });
  return { limiter, advance: (ms: number) => (now += ms) };
}

describe("createRateLimiter", () => {
  it("limits after the configured number of hits, per key", () => {
    const { limiter } = setup();
    for (let i = 0; i < 3; i++) {
      expect(limiter.isLimited("ip")).toBe(false);
      limiter.record("ip");
    }
    expect(limiter.isLimited("ip")).toBe(true);
    expect(limiter.isLimited("other-ip")).toBe(false);
  });

  it("frees up as hits slide out of the window", () => {
    const { limiter, advance } = setup();
    limiter.record("ip");
    advance(600);
    limiter.record("ip");
    limiter.record("ip");
    expect(limiter.isLimited("ip")).toBe(true);
    advance(500); // the first hit is now older than the 1000ms window
    expect(limiter.isLimited("ip")).toBe(false);
  });

  it("reset clears a key", () => {
    const { limiter } = setup();
    for (let i = 0; i < 3; i++) limiter.record("ip");
    limiter.reset("ip");
    expect(limiter.isLimited("ip")).toBe(false);
  });
});
