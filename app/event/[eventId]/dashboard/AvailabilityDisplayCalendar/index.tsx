"use client";

import { useState, useMemo } from "react";
import { UsersWithAvailability, EventSlots } from "../types";
import DayNavigation from "./DayNavigation";
import EventSlotsRow from "./EventSlotsRow";
import UserRow from "./UserRow";
import TimelineRow from "./TimelineRow";
import { SLOTS_PER_HOUR, PX_PER_COL, toDateKey } from "./utils";

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
      <DayNavigation
        activeDay={activeDay}
        activeDayIndex={activeDayIndex}
        totalDays={uniqueDays.length}
        onPrev={() => setActiveDayIndex((i) => i - 1)}
        onNext={() => setActiveDayIndex((i) => i + 1)}
      />

      {/* Wrapper: overflow-x-auto enables horizontal scrolling */}
      <div className="w-full overflow-x-auto pb-2">
        {/* Inner container: min-width forces the timeline to be scrollable */}
        <div style={{ minWidth: `${Math.round(totalCols * PX_PER_COL)}px` }}>
          <EventSlotsRow
            activeDayEventSlots={activeDayEventSlots}
            totalCols={totalCols}
            totalHours={totalHours}
            activeMidnight={activeMidnight}
          />

          {/* User rows */}
          {usersForActiveDay.map((user) => (
            <UserRow
              key={user.id}
              user={user}
              totalCols={totalCols}
              totalHours={totalHours}
              activeMidnight={activeMidnight}
            />
          ))}

          {/* Closing border for the last row */}
          <div className="border-b border-l border-r border-border rounded-b-none" />

          <TimelineRow totalHours={totalHours} />
        </div>
      </div>
    </div>
  );
}
