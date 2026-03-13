import "temporal-polyfill/global";

/** Convert ISO UTC timestamp → Temporal.ZonedDateTime in the given IANA timezone */
export function toZDT(isoString: string, timezone: string): Temporal.ZonedDateTime {
  return Temporal.Instant.from(isoString).toZonedDateTimeISO(timezone);
}

/** Get Temporal.PlainDate in the given timezone for Schedule-X selectedDate */
export function toPlainDate(isoString: string, timezone: string): Temporal.PlainDate {
  return Temporal.Instant.from(isoString)
    .toZonedDateTimeISO(timezone)
    .toPlainDate();
}

export function formatDayHeading(isoString: string, timezone: string): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: timezone,
  }).format(new Date(isoString));
}

export function formatTimeRange(start: string, end: string, timezone: string): string {
  const fmt = (iso: string) =>
    new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: timezone,
    }).format(new Date(iso));
  return `${fmt(start)} – ${fmt(end)}`;
}

export function generateTimeOptions(
  startIso: string,
  endIso: string,
  timezone: string,
): { label: string; iso: string }[] {
  const options: { label: string; iso: string }[] = [];
  const formatter = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: timezone,
  });
  let cursor = new Date(startIso);
  const end = new Date(endIso);
  while (cursor <= end) {
    options.push({
      label: formatter.format(cursor),
      iso: cursor.toISOString(),
    });
    cursor = new Date(cursor.getTime() + 30 * 60 * 1000);
  }
  return options;
}
