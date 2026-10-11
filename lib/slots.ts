import { BOOKING_WINDOW_DAYS, OpeningHours, SLOT_MINUTES } from "@/constants";

import { PRACTICE_TIME_ZONE } from "./utils";

// All slot maths happens in practice-local time (Europe/London), so bookings are correct
// across BST/GMT changes and regardless of the visitor's device time zone.

const partsFmt = new Intl.DateTimeFormat("en-GB", {
  timeZone: PRACTICE_TIME_ZONE,
  year: "numeric",
  month: "numeric",
  day: "numeric",
  hour: "numeric",
  minute: "numeric",
  weekday: "short",
  hourCycle: "h23",
});

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function londonParts(date: Date) {
  const parts = Object.fromEntries(partsFmt.formatToParts(date).map((p) => [p.type, p.value]));
  return {
    year: Number(parts.year),
    month: Number(parts.month) - 1,
    day: Number(parts.day),
    hour: Number(parts.hour),
    minute: Number(parts.minute),
    weekday: WEEKDAYS.indexOf(parts.weekday),
  };
}

/** Converts a London wall-clock time into the correct UTC instant. */
export function fromLondonTime(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number
) {
  const target = Date.UTC(year, month, day, hour, minute);
  let guess = target;
  for (let i = 0; i < 2; i++) {
    const p = londonParts(new Date(guess));
    const asUtc = Date.UTC(p.year, p.month, p.day, p.hour, p.minute);
    guess += target - asUtc;
  }
  return new Date(guess);
}

export function isClosedDay(day: Date) {
  return OpeningHours[day.getDay()] === null;
}

export function bookingWindow(now = new Date()) {
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const end = new Date(start);
  end.setDate(end.getDate() + BOOKING_WINDOW_DAYS);
  return { start, end };
}

/** Available slots for a calendar day (the day's Y/M/D as picked in the calendar). */
export function slotsForDay(day: Date, now = new Date()) {
  const hours = OpeningHours[day.getDay()];
  if (!hours) return [];

  const slots: Date[] = [];
  for (let m = hours.open * 60; m + SLOT_MINUTES <= hours.close * 60; m += SLOT_MINUTES) {
    const slot = fromLondonTime(
      day.getFullYear(),
      day.getMonth(),
      day.getDate(),
      Math.floor(m / 60),
      m % 60
    );
    // Require at least an hour's notice.
    if (slot.getTime() > now.getTime() + 60 * 60 * 1000) slots.push(slot);
  }
  return slots;
}

/** Server-side guard: the instant must be a real, future slot within opening hours. */
export function isBookableSlot(date: Date, now = new Date()) {
  if (Number.isNaN(date.getTime())) return false;
  const p = londonParts(date);
  const hours = OpeningHours[p.weekday];
  if (!hours) return false;

  const minutes = p.hour * 60 + p.minute;
  const withinHours = minutes >= hours.open * 60 && minutes + SLOT_MINUTES <= hours.close * 60;
  const onGrid = minutes % SLOT_MINUTES === 0;
  const maxAhead = now.getTime() + (BOOKING_WINDOW_DAYS + 1) * 864e5;

  return withinHours && onGrid && date.getTime() > now.getTime() && date.getTime() < maxAhead;
}
