import { describe, expect, it } from "vitest";

import { slotKey, takenSlotKeys, type BookedSlot } from "@/lib/availability";

const booked: BookedSlot[] = [
  { id: "a", physician: "Keith Barton", schedule: "2026-10-20T09:00:00.000+00:00" },
  { id: "b", physician: "Keith Barton", schedule: "2026-10-20T09:30:00.000Z" },
  { id: "c", physician: "Julia A. Haller", schedule: "2026-10-20T09:00:00.000Z" },
];

describe("slotKey", () => {
  it("treats equivalent ISO formats as the same slot", () => {
    expect(slotKey("2026-10-20T09:00:00.000+00:00")).toBe(slotKey(new Date("2026-10-20T09:00Z")));
  });
});

describe("takenSlotKeys", () => {
  it("only includes the chosen clinician's bookings", () => {
    const taken = takenSlotKeys(booked, "Keith Barton");
    expect(taken.size).toBe(2);
    expect(taken.has(slotKey("2026-10-20T09:00:00Z"))).toBe(true);
  });

  it("ignores the appointment being rescheduled", () => {
    const taken = takenSlotKeys(booked, "Keith Barton", "a");
    expect(taken.has(slotKey("2026-10-20T09:00:00Z"))).toBe(false);
    expect(taken.size).toBe(1);
  });

  it("is empty when no clinician is chosen", () => {
    expect(takenSlotKeys(booked, undefined).size).toBe(0);
  });
});
