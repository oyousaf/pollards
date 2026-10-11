// Pure helpers for slot availability, shared by server (conflict checks) and client (greying out).

/** A non-cancelled booking occupying a clinician's slot. Contains no patient data. */
export type BookedSlot = { id: string; physician: string; schedule: string };

/** Minute-precision key so ISO strings from different sources compare reliably. */
export const slotKey = (value: Date | string) => Math.floor(new Date(value).getTime() / 60_000);

/** Slot keys already taken for a clinician, optionally ignoring one appointment (when rescheduling it). */
export function takenSlotKeys(
  booked: readonly BookedSlot[],
  physician: string | undefined,
  excludeId?: string
): ReadonlySet<number> {
  if (!physician) return new Set();
  return new Set(
    booked
      .filter((b) => b.physician === physician && b.id !== excludeId)
      .map((b) => slotKey(b.schedule))
  );
}
