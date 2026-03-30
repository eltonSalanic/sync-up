"use client";

import { useState, useMemo } from "react";
import { EventSlots, UsersWithAvailability } from "../types";
import DurationSlider from "./DurationSlider";
import WindowList from "./WindowList";
import { findConsensusWindows, slotDurationMins } from "./utils";

interface ConsensusWindowPanelProps {
  eventSlots: EventSlots;
  usersWithAvailability: UsersWithAvailability;
}

export default function ConsensusWindowPanel({
  eventSlots,
  usersWithAvailability,
}: ConsensusWindowPanelProps) {
  // Derive slider bounds from event slot durations
  const { defaultDuration, maxDuration } = useMemo(() => {
    if (eventSlots.length === 0) return { defaultDuration: 30, maxDuration: 60 };

    const durations = eventSlots.map(slotDurationMins);
    const smallest = Math.min(...durations);
    const largest = Math.max(...durations);

    return {
      // Default = smallest event slot duration, rounded to nearest 10
      defaultDuration: Math.max(10, Math.round(smallest / 10) * 10),
      // Max = largest event slot duration, floored to 10-min step
      maxDuration: Math.max(10, Math.floor(largest / 10) * 10),
    };
  }, [eventSlots]);

  const [minDuration, setMinDuration] = useState(defaultDuration);

  const consensusWindows = useMemo(
    () => findConsensusWindows(eventSlots, usersWithAvailability, minDuration),
    [eventSlots, usersWithAvailability, minDuration],
  );

  if (eventSlots.length === 0) return null;

  return (
    <div className="space-y-4 rounded-lg border border-border bg-card p-4">
      {/* Header */}
      <div className="space-y-0.5">
        <h3 className="text-sm font-semibold font-main text-foreground">
          Overlapping Availability
        </h3>
        <p className="text-xs text-muted-foreground font-main">
          Windows where everyone who responded is free simultaneously
        </p>
      </div>

      <DurationSlider
        minDuration={minDuration}
        maxDuration={maxDuration}
        onChange={setMinDuration}
      />

      <WindowList windows={consensusWindows} minDuration={minDuration} />
    </div>
  );
}
