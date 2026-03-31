import { UsersWithAvailability } from "../types";
import { toCol } from "./utils";
import GridLines from "./GridLines";

interface UserRowProps {
  user: UsersWithAvailability[number];
  totalCols: number;
  totalHours: number;
  activeMidnight: number;
}

export default function UserRow({
  user,
  totalCols,
  totalHours,
  activeMidnight,
}: UserRowProps) {
  return (
    <div
      className="relative border-t border-b-0 border-border bg-card"
      style={{ height: "150px" }}
    >
      {/* TODO: Use only span */}
      {/* Sticky name badge — stays pinned to the left edge while scrolling */}
      <div className="sticky left-0 z-10 w-0 h-full flex items-start pt-2 pl-2 pointer-events-none">
        <span className="pointer-events-auto inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold font-main bg-background/80 backdrop-blur-sm border border-border shadow-sm text-foreground whitespace-nowrap select-none">
          {user.first_name} {user.last_name}
        </span>
      </div>

      {/* Hour and 30-min guide lines */}
      <GridLines totalHours={totalHours} />
      {/* Availability slots on grid for this user */}
      <div
        className="absolute inset-0 grid"
        style={{
          gridTemplateColumns: `repeat(${totalCols}, 1fr)`,
        }}
      >
        {user.timeSlot.map((slot) => (
          <div
            className="bg-chart-3/90 border-l-6 rounded-sm border-chart-2"
            key={slot.id}
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
