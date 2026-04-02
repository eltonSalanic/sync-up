import { utcToDateKey, dateKeyToMidnightMs } from "@/lib/time";

// Number of 5-min slots per hour. If you change: update 60/min increment
export const SLOTS_PER_HOUR = 12;

// Pixels per 5-min column — keeps horizontal scroll feel consistent across days
export const PX_PER_COL = 7.64;

/** Wraps hours past 24 back to AM/PM labels (e.g. hour 25 → "1 AM") */
export function formatHour(hour: number): string {
  const h = hour % 24;
  if (h === 0) return "12 AM";
  if (h === 12) return "12 PM";
  return h < 12 ? `${h} AM` : `${h - 12} PM`;
}

/**
 * Returns a "YYYY-MM-DD" key for a UTC ISO string, as seen in the given timezone.
 * Replaces the old local-Date version.
 */
export function toDateKey(utcISO: string, timezone: string): string {
  return utcToDateKey(utcISO, timezone);
}

/**
 * Returns the epoch milliseconds of midnight (00:00:00) for a "YYYY-MM-DD" date key
 * in the given timezone. Use as the grid origin for column calculations.
 */
export function getMidnightMs(dateKey: string, timezone: string): number {
  return dateKeyToMidnightMs(dateKey, timezone);
}

/**
 * Converts a timestamp string to its grid column index,
 * offset from the start (midnight) of the active day.
 */
export function toCol(timeStr: string, activeMidnight: number): number {
  return (
    Math.round(
      (new Date(timeStr).getTime() - activeMidnight) / (5 * 60 * 1000),
    ) + 1
  );
}
