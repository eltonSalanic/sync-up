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

/** Returns the local date as a YYYY-MM-DD string */
export function toDateKey(date: Date): string {
  return (
    `${date.getFullYear()}-` +
    `${String(date.getMonth() + 1).padStart(2, "0")}-` +
    `${String(date.getDate()).padStart(2, "0")}`
  );
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
