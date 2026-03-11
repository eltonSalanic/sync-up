"use client";

import { useState } from "react";
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
import { submitAvailability, AvailabilitySlot } from "@/app/actions/availability";

interface EventDay {
  id: number;
  start_time: string;
  end_time: string;
}

interface AvailabilityFormProps {
  eventId: string;
  eventName: string;
  eventDays: EventDay[];
  /** Guest's IANA timezone string e.g. "America/New_York" */
  timezone: string;
}

interface DaySlot {
  startTime: string;
  endTime: string;
}

/** Generate 30-minute time options between two ISO timestamps */
function generateTimeOptions(
  startIso: string,
  endIso: string,
  timezone: string
): { label: string; iso: string }[] {
  const options: { label: string; iso: string }[] = [];
  const start = new Date(startIso);
  const end = new Date(endIso);
  const formatter = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: timezone,
  });

  let cursor = new Date(start);
  while (cursor <= end) {
    options.push({ label: formatter.format(cursor), iso: cursor.toISOString() });
    cursor = new Date(cursor.getTime() + 30 * 60 * 1000);
  }
  return options;
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

export default function AvailabilityForm({
  eventId,
  eventName,
  eventDays,
  timezone,
}: AvailabilityFormProps) {
  // Map of eventDayId → list of { startTime, endTime } windows selected for that day
  const [selections, setSelections] = useState<Record<number, DaySlot[]>>(
    Object.fromEntries(eventDays.map((d) => [d.id, [{ startTime: "", endTime: "" }]]))
  );
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    value: string
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
            setServerError(`End time must be after start time for ${formatDayHeading(day.start_time, timezone)}.`);
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
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="text-center space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Your Availability</h1>
        <p className="text-muted-foreground text-lg">
          For{" "}
          <span className="font-semibold text-foreground">{eventName}</span>
          {" "}— select the times you&apos;re free on each day.
        </p>
        <p className="text-sm text-muted-foreground">Times shown in your timezone: {timezone}</p>
      </div>

      {serverError && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
          {serverError}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {eventDays.map((day) => {
          const timeOptions = generateTimeOptions(day.start_time, day.end_time, timezone);
          return (
            <Card key={day.id} className="flex flex-col">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">
                  {formatDayHeading(day.start_time, timezone)}
                </CardTitle>
                <CardDescription>
                  Event window: {formatTimeRange(day.start_time, day.end_time, timezone)}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3 flex-1">
                {selections[day.id].map((slot, i) => (
                  <div key={i} className="flex flex-col gap-2 border border-border rounded-md p-3">
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
                        <label className="text-xs text-muted-foreground">From</label>
                        <Select
                          value={slot.startTime}
                          onValueChange={(v) => updateSlot(day.id, i, "startTime", v)}
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
                        <label className="text-xs text-muted-foreground">To</label>
                        <Select
                          value={slot.endTime}
                          onValueChange={(v) => updateSlot(day.id, i, "endTime", v)}
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
