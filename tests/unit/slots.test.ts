import { describe, expect, it } from "vitest";

import { fromLondonTime, isBookableSlot, londonParts, slotsForDay } from "@/lib/slots";

// Fixed "now": Monday 12 Oct 2026, 08:00 UTC (09:00 BST).
const NOW = new Date("2026-10-12T08:00:00Z");
const hm = (d: Date) => {
  const p = londonParts(d);
  return `${String(p.hour).padStart(2, "0")}:${String(p.minute).padStart(2, "0")}`;
};

describe("fromLondonTime", () => {
  it("applies BST (UTC+1) in summer", () => {
    expect(fromLondonTime(2026, 6, 15, 9, 0).toISOString()).toBe("2026-07-15T08:00:00.000Z");
  });

  it("applies GMT (UTC+0) in winter", () => {
    expect(fromLondonTime(2026, 11, 15, 9, 0).toISOString()).toBe("2026-12-15T09:00:00.000Z");
  });

  it("round-trips through londonParts on the day the clocks change", () => {
    const parts = londonParts(fromLondonTime(2026, 9, 25, 14, 30));
    expect(parts).toMatchObject({ year: 2026, month: 9, day: 25, hour: 14, minute: 30 });
  });
});

describe("slotsForDay", () => {
  it("has no slots on Sundays", () => {
    expect(slotsForDay(new Date(2026, 9, 18), NOW)).toEqual([]);
  });

  it("returns 30-minute slots within weekday opening hours", () => {
    const slots = slotsForDay(new Date(2026, 9, 13), NOW); // Tuesday
    expect(hm(slots[0])).toBe("09:00");
    expect(hm(slots.at(-1)!)).toBe("17:00"); // last slot ends at the 17:30 close
    expect(slots).toHaveLength(17);
  });

  it("uses shorter Saturday hours", () => {
    expect(hm(slotsForDay(new Date(2026, 9, 17), NOW).at(-1)!)).toBe("12:30");
  });

  it("requires at least an hour's notice today", () => {
    // now is 09:00 London, so 10:00 is exactly an hour away and excluded
    expect(hm(slotsForDay(new Date(2026, 9, 12), NOW)[0])).toBe("10:30");
  });
});

describe("isBookableSlot", () => {
  const at = (iso: string) => isBookableSlot(new Date(iso), NOW);

  it("accepts an on-grid slot within hours", () => {
    expect(at("2026-10-13T09:30:00Z")).toBe(true); // Tue 10:30 BST
  });

  it.each([
    ["in the past", "2026-10-09T09:00:00Z"],
    ["on a Sunday", "2026-10-18T10:00:00Z"],
    ["before opening", "2026-10-13T07:30:00Z"],
    ["ending after closing", "2026-10-13T16:30:00Z"],
    ["off the 30-minute grid", "2026-10-13T09:15:00Z"],
    ["beyond the booking window", "2027-03-01T10:00:00Z"],
    ["an invalid date", "not-a-date"],
  ])("rejects a slot %s", (_label, iso) => {
    expect(at(iso)).toBe(false);
  });
});
