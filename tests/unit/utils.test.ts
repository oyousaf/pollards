import { describe, expect, it } from "vitest";

import { formatDateTime, initials, maskEmail } from "@/lib/utils";

describe("formatDateTime", () => {
  it("formats in UK time regardless of the server's time zone", () => {
    const { timeOnly, dateOnly } = formatDateTime("2026-07-15T08:00:00Z");
    expect(timeOnly).toBe("09:00"); // BST
    expect(dateOnly).toBe("Wednesday, 15 July 2026");
  });
});

describe("maskEmail", () => {
  it("keeps the first two characters and the domain", () => {
    expect(maskEmail("jane.smith@gmail.com")).toBe("ja•••@gmail.com");
  });

  it("handles very short local parts", () => {
    expect(maskEmail("j@x.com")).toBe("j•••@x.com");
  });
});

describe("initials", () => {
  it("ignores quotes and takes two letters", () => {
    expect(initials(`Iqbal "Ike" K. Ahmed`)).toBe("II");
  });
});
