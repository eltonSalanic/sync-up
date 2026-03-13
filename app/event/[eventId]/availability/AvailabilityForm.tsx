"use client";

import { useState } from "react";
import { useNextCalendarApp, ScheduleXCalendar } from "@schedule-x/react";
import { createViewWeek, createViewDay } from "@schedule-x/calendar";
import { createEventsServicePlugin } from "@schedule-x/events-service";
import "temporal-polyfill/global";
import "@schedule-x/theme-default/dist/index.css";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  submitAvailability,
  AvailabilitySlot,
} from "@/app/actions/availability";
import { useRouter } from "next/navigation";

// ─── Types ────────────────────────────────────────────────────────────────────
interface EventDay {
  id: number;
  start_time: string; // ISO UTC
  end_time: string; // ISO UTC
}

interface AvailabilityFormProps {
  eventId: string;
  eventName: string;
  eventDays: EventDay[];
  /** Guest's IANA timezone e.g. "America/New_York" */
  timezone: string;
}

interface DaySlot {
  startTime: string;
  endTime: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Convert ISO UTC timestamp → Temporal.ZonedDateTime in the given IANA timezone */
function toZDT(isoString: string, timezone: string): Temporal.ZonedDateTime {
  return Temporal.Instant.from(isoString).toZonedDateTimeISO(timezone);
}

/** Get Temporal.PlainDate in the given timezone for Schedule-X selectedDate */
function toPlainDate(isoString: string, timezone: string): Temporal.PlainDate {
  return Temporal.Instant.from(isoString)
    .toZonedDateTimeISO(timezone)
    .toPlainDate();
}

/** Get the local hour (0-23) for an ISO UTC timestamp in the given timezone */
function getLocalHour(isoString: string, timezone: string): number {
  const raw = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hour: "2-digit",
    hour12: false,
  }).format(new Date(isoString));
  const h = parseInt(raw, 10);
  // Intl may return 24 for midnight — normalise
  return h === 24 ? 0 : h;
}

function formatDayHeading(isoString: string, timezone: string): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: timezone,
  }).format(new Date(isoString));
}

function formatTimeRange(start: string, end: string, timezone: string): string {
  const fmt = (iso: string) =>
    new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: timezone,
    }).format(new Date(iso));
  return `${fmt(start)} – ${fmt(end)}`;
}

function generateTimeOptions(
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

export default function AvailabilityForm({
  eventId,
  eventName,
  eventDays,
  timezone,
}: AvailabilityFormProps) {
  const router = useRouter();
  const [selections, setSelections] = useState<Record<number, DaySlot[]>>(
    Object.fromEntries(
      eventDays.map((d) => [d.id, [{ startTime: "", endTime: "" }]]),
    ),
  );
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Schedule-X setup ────────────────────────────────────────────────────
  const eventsService = useState(() => createEventsServicePlugin())[0];

  // Compute ±4-hour window around the earliest start / latest end across all days
  let minHour = 24;
  let maxHour = 0;

  for (const day of eventDays) {
    const zdtStart = toZDT(day.start_time, timezone);
    const zdtEnd = toZDT(day.end_time, timezone);

    if (!zdtStart.toPlainDate().equals(zdtEnd.toPlainDate())) {
      minHour = 0;
      maxHour = 24;
    } else {
      minHour = Math.min(minHour, zdtStart.hour);
      maxHour = Math.max(maxHour, zdtEnd.hour + (zdtEnd.minute > 0 ? 1 : 0));
    }
  }

  const boundaryStart = Math.max(0, minHour - 4);
  const boundaryEnd = Math.min(24, maxHour + 5);
  const pad = (n: number) => String(n).padStart(2, "0");
  const dayBoundaries = {
    start: `${pad(boundaryStart)}:00`,
    end: `${pad(boundaryEnd)}:00`,
  };

  const calendar = useNextCalendarApp({
    views: [createViewWeek(), createViewDay()],
    defaultView: createViewWeek().name,
    selectedDate: toPlainDate(eventDays[0].start_time, timezone),
    timezone,
    dayBoundaries,
    weekOptions: { gridHeight: (boundaryEnd - boundaryStart) * 64 },
    calendars: {
      eventSlot: {
        colorName: "eventSlot",
        lightColors: {
          main: "#16a34a",
          container: "#dcfce7",
          onContainer: "#14532d",
        },
        darkColors: {
          main: "#4ade80",
          container: "#166534",
          onContainer: "#dcfce7",
        },
      },
    },
    //split dates if they cross midnight to show them seperately in the calendar
    events: eventDays.flatMap((day) => {
      const zdtStart = toZDT(day.start_time, timezone);
      const zdtEnd = toZDT(day.end_time, timezone);

      // Check if it crosses midnight in the local timezone
      if (!zdtStart.toPlainDate().equals(zdtEnd.toPlainDate())) {
        // Create an end time for the first day at 23:59
        const endOfFirstDay = zdtStart.withPlainTime("23:59");
        // Create a start time for the second day at 00:00
        const startOfSecondDay = zdtEnd.withPlainTime("00:00");

        return [
          {
            id: `${day.id}-part1`,
            title: eventName,
            start: zdtStart,
            end: endOfFirstDay,
            calendarId: "eventSlot",
          },
          {
            id: `${day.id}-part2`,
            title: eventName,
            start: startOfSecondDay,
            end: zdtEnd,
            calendarId: "eventSlot",
          },
        ];
      }

      return [
        {
          id: String(day.id),
          title: eventName,
          start: zdtStart,
          end: zdtEnd,
          calendarId: "eventSlot",
        },
      ];
    }),
    plugins: [eventsService],
  });

  // ── Selection handlers ───────────────────────────────────────────────────
  const addSlot = (dayId: number) => {
    setSelections((prev) => ({
      ...prev,
      [dayId]: [...prev[dayId], { startTime: "", endTime: "" }],
    }));
  };

  const removeSlot = (dayId: number, index: number) => {
    setSelections((prev) => ({
      ...prev,
      [dayId]: prev[dayId].filter((_, i) => i !== index),
    }));
  };

  const updateSlot = (
    dayId: number,
    index: number,
    field: "startTime" | "endTime",
    value: string,
  ) => {
    setSelections((prev) => {
      const updated = [...prev[dayId]];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, [dayId]: updated };
    });
  };

  const handleSubmit = async () => {
    setServerError(null);
    const slots: AvailabilitySlot[] = [];

    for (const day of eventDays) {
      for (const slot of selections[day.id]) {
        if (slot.startTime && slot.endTime) {
          if (slot.endTime <= slot.startTime) {
            setServerError(
              `End time must be after start time for ${formatDayHeading(day.start_time, timezone)}.`,
            );
            return;
          }
          slots.push({
            eventDayId: day.id,
            startTime: slot.startTime,
            endTime: slot.endTime,
          });
        }
      }
    }

    if (!slots.length) {
      setServerError("Please select at least one available time window.");
      return;
    }

    setIsSubmitting(true);
    const result = await submitAvailability(eventId, slots);
    setIsSubmitting(false);

    if (!result?.success) {
      setServerError(result?.error ?? "Something went wrong.");
    } else {
      router.push("/");
    }
  };

  return (
    <div className="w-full space-y-8">
      {/* ── Header ── */}
      <div className="text-center space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Your Availability</h1>
        <p className="text-muted-foreground text-lg">
          For <span className="font-semibold text-foreground">{eventName}</span>{" "}
          — select the times you&apos;re free on each day.
        </p>
        <p className="text-sm text-muted-foreground">
          Times shown in your timezone: {timezone}
        </p>
      </div>

      {/* ── Schedule-X Calendar ── */}
      <div className="rounded-xl overflow-hidden border border-border shadow-sm">
        <ScheduleXCalendar calendarApp={calendar} />
      </div>

      {/* ── Availability selectors ── */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">When are you free?</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {eventDays.map((day) => {
            const timeOptions = generateTimeOptions(
              day.start_time,
              day.end_time,
              timezone,
            );
            return (
              <Card key={day.id} className="flex flex-col">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">
                    {formatDayHeading(day.start_time, timezone)}
                  </CardTitle>
                  <CardDescription>
                    Event window:{" "}
                    {formatTimeRange(day.start_time, day.end_time, timezone)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-3 flex-1">
                  {selections[day.id].map((slot, i) => (
                    <div
                      key={i}
                      className="flex flex-col gap-2 border border-border rounded-md p-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          Window {i + 1}
                        </span>
                        {selections[day.id].length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeSlot(day.id, i)}
                            className="text-xs text-red-500 hover:text-red-700 transition-colors"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-xs text-muted-foreground">
                            From
                          </label>
                          <Select
                            value={slot.startTime}
                            onValueChange={(v) =>
                              updateSlot(day.id, i, "startTime", v)
                            }
                          >
                            <SelectTrigger className="h-8 text-sm">
                              <SelectValue placeholder="Start" />
                            </SelectTrigger>
                            <SelectContent>
                              {timeOptions.slice(0, -1).map((opt) => (
                                <SelectItem key={opt.iso} value={opt.iso}>
                                  {opt.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs text-muted-foreground">
                            To
                          </label>
                          <Select
                            value={slot.endTime}
                            onValueChange={(v) =>
                              updateSlot(day.id, i, "endTime", v)
                            }
                          >
                            <SelectTrigger className="h-8 text-sm">
                              <SelectValue placeholder="End" />
                            </SelectTrigger>
                            <SelectContent>
                              {timeOptions.slice(1).map((opt) => (
                                <SelectItem key={opt.iso} value={opt.iso}>
                                  {opt.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addSlot(day.id)}
                    className="mt-1 text-sm text-primary hover:underline text-left transition-colors"
                  >
                    + Add another window
                  </button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
      {serverError && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded text-sm">
          {serverError}
        </div>
      )}

      <div className="flex justify-center pt-2">
        <Button
          size="lg"
          disabled={isSubmitting}
          onClick={handleSubmit}
          className="min-w-48"
        >
          {isSubmitting ? "Saving..." : "Submit Availability"}
        </Button>
      </div>
    </div>
  );
}
