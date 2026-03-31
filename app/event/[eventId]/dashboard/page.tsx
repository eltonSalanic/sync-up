import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import AvailabilityDisplayCalendar from "./AvailabilityDisplayCalendar";
import ConsensusWindowPanel from "./ConsensusWindow";
import { Calendar, Clock } from "lucide-react";

export default async function EventDashboardPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const supabase = createClient();

  // 1. Fetch Event Info
  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("id, name, description")
    .eq("id", eventId)
    .single();

  if (eventError || !event) {
    notFound();
  }

  // 2. Fetch Event Slots
  const { data: eventSlots, error: eventSlotsError } = await supabase
    .from("event_days")
    .select("id, start_time, end_time")
    .eq("event_id", eventId);

  if (eventSlotsError) {
    console.error("Error fetching event slots:", eventSlotsError);
  }

  // 3. Fetch Availability Results
  const { data: usersWithAvailability, error: availabilityError } =
    await supabase
      .from("users")
      .select(
        `
      id,
      first_name,
      last_name,
      timeSlot:user_event_availability!inner(
        id,
        start_time,
        end_time
      )
    `,
      )
      .eq("user_event_availability.event_id", eventId);

  if (availabilityError) {
    console.error("Error fetching availability results:", availabilityError);
    return null;
  }

  const respondentCount = usersWithAvailability?.length ?? 0;

  return (
    <div className="w-full flex-1 flex flex-col gap-8 p-8 max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col gap-1">
        <p className="text-xs font-semibold font-main uppercase tracking-widest text-muted-foreground">
          Dashboard
        </p>
        <h1 className="text-2xl font-bold font-main text-foreground tracking-tight">
          {event.name}
        </h1>
        <p className="text-sm text-muted-foreground font-main">
          {respondentCount}{" "}
          {respondentCount === 1 ? "person has" : "people have"} responded
        </p>
      </div>

      {/* Availability Calendar Section */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Calendar className="size-4 text-primary" />
          <h2 className="text-sm font-semibold font-main text-foreground">
            Availability
          </h2>
        </div>
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <AvailabilityDisplayCalendar
            usersWithAvailability={usersWithAvailability}
            eventSlots={eventSlots ?? []}
          />
        </div>
      </section>

      {/* Best Times Section */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Clock className="size-4 text-primary" />
          <h2 className="text-sm font-semibold font-main text-foreground">
            Best Times
          </h2>
        </div>
        <ConsensusWindowPanel
          eventSlots={eventSlots ?? []}
          usersWithAvailability={usersWithAvailability ?? []}
        />
      </section>
    </div>
  );
}
