import "temporal-polyfill/global";

/**
 * Converts a local calendar date + "HH:MM" time string + IANA timezone → UTC ISO string.
 *
 * Use this before storing any time entered by a user in their local timezone.
 * Handles DST transitions via the 'compatible' disambiguation strategy
 * (rolls forward on gaps, uses the first occurrence on folds).
 */
export function localToUTC(date: Date, time: string, timezone: string): string {
  const [hoursStr, minutesStr] = time.split(":");
  const plainDateTime = Temporal.PlainDateTime.from({
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
    hour: Number(hoursStr),
    minute: Number(minutesStr),
    second: 0,
    millisecond: 0,
  });
  return plainDateTime
    .toZonedDateTime(timezone, { disambiguation: "compatible" })
    .toInstant()
    .toString();
}

/**
 * Converts a UTC ISO string → "YYYY-MM-DD" date key in the given IANA timezone.
 *
 * Use this to group UTC timestamps by calendar day as seen in a specific timezone.
 */
export function utcToDateKey(utcISO: string, timezone: string): string {
  const zdt = Temporal.Instant.from(utcISO).toZonedDateTimeISO(timezone);
  return (
    `${zdt.year}-` +
    `${String(zdt.month).padStart(2, "0")}-` +
    `${String(zdt.day).padStart(2, "0")}`
  );
}

/**
 * Returns the Unix epoch milliseconds for midnight (00:00:00)
 * of a "YYYY-MM-DD" date key in the given IANA timezone.
 *
 * Use this as the anchor offset for timeline grid column calculations.
 */
export function dateKeyToMidnightMs(dateKey: string, timezone: string): number {
  const [year, month, day] = dateKey.split("-").map(Number);
  const plainDateTime = Temporal.PlainDateTime.from({
    year,
    month,
    day,
    hour: 0,
    minute: 0,
    second: 0,
  });
  return Number(
    plainDateTime
      .toZonedDateTime(timezone, { disambiguation: "compatible" })
      .toInstant().epochMilliseconds,
  );
}

/**
 * Formats a UTC ISO string for display in the given IANA timezone.
 */
export function formatInTimezone(
  utcISO: string,
  timezone: string,
  options: Intl.DateTimeFormatOptions = {},
): string {
  return new Intl.DateTimeFormat("en-US", {
    ...options,
    timeZone: timezone,
  }).format(new Date(utcISO));
}
