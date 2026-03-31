import { EventSlots } from "../types";
import { toCol } from "./utils";
import GridLines from "./GridLines";

interface EventSlotsRowProps {
  activeDayEventSlots: EventSlots;
  totalCols: number;
  totalHours: number;
  activeMidnight: number;
}

export default function EventSlotsRow({
  activeDayEventSlots,
  totalCols,
  totalHours,
  activeMidnight,
}: EventSlotsRowProps) {
  return (
    // Event's Time Slots Row
    <div
      className="relative border border-b-0 border-border bg-card"
      style={{ height: "20px" }}
    >
      {/* TODO: Split this into its own component */}
      {/* Sticky "Event" label */}
      <div className="sticky left-0 z-10 w-0 pl-2 h-full flex items-center pointer-events-none">
        <span className="pointer-events-auto inline-flex items-center gap-1 rounded-md px-2 text-xs font-bold font-main bg-background text-foreground whitespace-nowrap select-none">
          Event Time Slots
        </span>
      </div>

      {/* Hour and 30-min guide lines */}
      <GridLines totalHours={totalHours} />

      {/* Event slot bars */}
      <div
        className="absolute inset-0 grid"
        style={{ gridTemplateColumns: `repeat(${totalCols}, 1fr)` }}
      >
        {activeDayEventSlots.map((slot) => (
          <div
            key={slot.id}
            className="bg-primary border-l-4 border-chart-5/90 rounded-sm"
            style={{
              gridColumnStart: toCol(slot.start_time, activeMidnight),
              gridColumnEnd: toCol(slot.end_time, activeMidnight),
              gridRow: 1,
            }}
          />
        ))}
      </div>
    </div>
  );
}
