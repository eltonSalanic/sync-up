"use client";

import { useState, useMemo } from "react";
import { UsersWithAvailability, EventSlots } from "./types";
import { format } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";

/*
  -- 5 Min Grids --
  12 grids per hour * N hours per active day = N*12 columns total.
  N is always at least 24. If any event slot on the active day crosses midnight,
  N extends to cover the full duration (e.g. a slot ending at 2 AM → N = 26).
*/

interface AvailabilityDisplayCalendarProps {
  usersWithAvailability: UsersWithAvailability;
  eventSlots: EventSlots;
}

// Number of 5-min slots per hour. If you change: update 60/min increment
const SLOTS_PER_HOUR = 12;

// Pixels per 5-min column — keeps horizontal scroll feel consistent across days
const PX_PER_COL = 7.64;

/** Wraps hours past 24 back to AM/PM labels (e.g. hour 25 → "1 AM") */
function formatHour(hour: number): string {
  const h = hour % 24;
  if (h === 0) return "12 AM";
  if (h === 12) return "12 PM";
  return h < 12 ? `${h} AM` : `${h - 12} PM`;
}

/** Returns the local date as a YYYY-MM-DD string */
function toDateKey(date: Date): string {
  return (
    `${date.getFullYear()}-` +
    `${String(date.getMonth() + 1).padStart(2, "0")}-` +
    `${String(date.getDate()).padStart(2, "0")}`
  );
}

export default function AvailabilityDisplayCalendar({
  usersWithAvailability,
  eventSlots,
}: AvailabilityDisplayCalendarProps) {
  const firstUser = usersWithAvailability[1];
  const timeSlots = firstUser?.timeSlot ?? [];
  /* TODO: Remove this console log */
  console.log("Individual Local Times");
  timeSlots.forEach((slot, i) => {
    console.log(
      `Slot ${i}: `,
      new Date(slot.start_time).getHours() +
        ":" +
        new Date(slot.start_time).getMinutes(),
      new Date(slot.end_time).getHours() +
        ":" +
        new Date(slot.end_time).getMinutes(),
    );
  });

  // Gets all unique days for navigation to cycle through
  const uniqueDays = useMemo(() => {
    const dates = new Set(
      eventSlots.map((slot) => toDateKey(new Date(slot.start_time))),
    );
    return [...dates].sort();
  }, [eventSlots]);

  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const activeDay = uniqueDays[activeDayIndex]; // e.g. "2026-03-28"

  // Midnight (start of day) of the active day in local time (ms)
  const activeMidnight = useMemo(() => {
    if (!activeDay) return 0;
    const [year, month, day] = activeDay.split("-").map(Number);
    return new Date(year, month - 1, day).getTime();
  }, [activeDay]);

  // Get events that start on the active day
  const activeDayEventSlots = useMemo(
    () =>
      eventSlots.filter(
        (slot) => toDateKey(new Date(slot.start_time)) === activeDay,
      ),
    [eventSlots, activeDay],
  );

  // Total hours to display for the active day
  // Always at least 24. Extends past 24 if any event slot crosses midnight.
  const totalHours = useMemo(() => {
    if (activeDayEventSlots.length === 0) return 24;
    const maxEndMs = Math.max(
      ...activeDayEventSlots.map((s) => new Date(s.end_time).getTime()),
    );
    return Math.max(
      24,
      Math.ceil((maxEndMs - activeMidnight) / (60 * 60 * 1000)),
    );
  }, [activeDayEventSlots, activeMidnight]);

  const totalCols = totalHours * SLOTS_PER_HOUR;
  // Array of hours to display for the active da
  const hours = Array.from({ length: totalHours }, (_, i) => i);

  // Converts a timestamp to its grid column (offset from active day midnight)
  function toCol(timeStr: string): number {
    return (
      Math.round(
        (new Date(timeStr).getTime() - activeMidnight) / (5 * 60 * 1000),
      ) + 1
    );
  }

  // Get users with their availability filtered to the active day
  const usersForActiveDay = useMemo(
    () =>
      usersWithAvailability.map((user) => ({
        ...user,
        timeSlot: user.timeSlot.filter(
          (slot) => toDateKey(new Date(slot.start_time)) === activeDay,
        ),
      })),
    [usersWithAvailability, activeDay],
  );

  if (uniqueDays.length === 0) return null;

  return (
    <div className="space-y-3">
      {/* Day Navigation */}
      <div className="flex items-center justify-between px-1">
        <button
          className="inline-flex items-center justify-center rounded-md p-1.5 transition-colors hover:bg-muted text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed"
          onClick={() => setActiveDayIndex((i) => i - 1)}
          disabled={activeDayIndex === 0}
          aria-label="Previous day"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <span className="text-sm font-semibold font-main text-foreground">
          {format(new Date(activeDay + "T00:00:00"), "EEEE, MMMM d, yyyy")}
        </span>

        <button
          className="inline-flex items-center justify-center rounded-md p-1.5 transition-colors hover:bg-muted text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed"
          onClick={() => setActiveDayIndex((i) => i + 1)}
          disabled={activeDayIndex === uniqueDays.length - 1}
          aria-label="Next day"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Wrapper: overflow-x-auto enables horizontal scrolling */}
      <div className="w-full overflow-x-auto">
        {/* Inner container: min-width forces the timeline to be scrollable */}
        <div style={{ minWidth: `${Math.round(totalCols * PX_PER_COL)}px` }}>
          {/* ── Event's Time Slots Row ── */}
          <div
            className="relative border border-b-0 border-border bg-card"
            style={{ height: "50px" }}
          >
            {/* TODO: Split this into its own component */}
            {/* Sticky "Event" label */}
            <div className="sticky left-0 z-10 w-0 h-full flex items-start pt-2 pl-2 pointer-events-none">
              <span className="pointer-events-auto inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold font-main bg-background/80 backdrop-blur-sm border border-border shadow-sm text-muted-foreground whitespace-nowrap select-none">
                Event
              </span>
            </div>

            {/* Event slot bars */}
            <div
              className="absolute inset-0 grid"
              style={{ gridTemplateColumns: `repeat(${totalCols}, 1fr)` }}
            >
              {activeDayEventSlots.map((slot) => (
                <div
                  key={slot.id}
                  className="bg-primary/30 border-l border-primary"
                  style={{
                    gridColumnStart: toCol(slot.start_time),
                    gridColumnEnd: toCol(slot.end_time),
                    gridRow: 1,
                  }}
                />
              ))}
            </div>
          </div>

          {/* ── User rows ── */}
          {usersForActiveDay.map((user) => (
            <div
              key={user.id}
              className="relative border border-b-0 border-border bg-muted"
              style={{ height: "150px" }}
            >
              {/* TODO: Use only span */}
              {/* Sticky name badge — stays pinned to the left edge while scrolling */}
              <div className="sticky left-0 z-10 w-0 h-full flex items-start pt-2 pl-2 pointer-events-none">
                <span className="pointer-events-auto inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold font-main bg-background/80 backdrop-blur-sm border border-border shadow-sm text-foreground whitespace-nowrap select-none">
                  {user.first_name} {user.last_name}
                </span>
              </div>

              {/* Availability slots on grid for this user */}
              <div
                className="absolute inset-0 grid"
                style={{
                  gridTemplateColumns: `repeat(${totalCols}, 1fr)`,
                }}
              >
                {user.timeSlot.map((slot) => (
                  <div
                    className="bg-red-500"
                    key={slot.id}
                    style={{
                      gridColumnStart: toCol(slot.start_time),
                      gridColumnEnd: toCol(slot.end_time),
                      gridRow: 1,
                    }}
                  />
                ))}
              </div>
            </div>
          ))}

          {/* Closing border for the last row */}
          <div className="border-b border-l border-r border-border rounded-b-none" />

          {/* Times Row (24-column grid) */}
          <div
            className="h-8 grid border border-border rounded-b-md bg-card"
            style={{ gridTemplateColumns: `repeat(${totalHours}, 1fr)` }}
          >
            {hours.map((hour) => (
              <div
                key={`time-cell-${hour}`}
                className="relative border-l border-transparent"
              >
                {/* Hour Label - centered on the left edge of its cell */}
                <span
                  className="absolute top-1/2 left-0 select-none text-[0.625rem] font-medium text-muted-foreground whitespace-nowrap leading-none px-[2px]"
                  style={{
                    // Align the first item to the left, center all others exactly over the grid line
                    transform:
                      hour === 0
                        ? "translate(0%, -50%)"
                        : "translate(-50%, -50%)",
                    fontFamily: "var(--font-accent)",
                  }}
                >
                  {formatHour(hour)}
                </span>

                {/* Hour tick - aligned to the left edge of the cell */}
                <div className="absolute top-0 left-0 w-px h-[4px] bg-border" />

                {/* Half-hour sub-tick - centered perfectly inside this 1-hour cell */}
                <div className="absolute top-0 left-1/2 w-px h-[3px] bg-border opacity-60" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
