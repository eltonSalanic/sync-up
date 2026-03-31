import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { createAdminClient } from "@/lib/supabase/admin";
import AvailabilityDisplayCalendar from "./AvailabilityDisplayCalendar";
import ConsensusWindowPanel from "./ConsensusWindow";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Clock, Info } from "lucide-react";

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

  // 3. Fetch Availability Results (only users who submitted slots)
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

  // 4. Fetch total member count using admin client (safe since PIN approach will be used)
  const supabaseAdmin = createAdminClient();
  const { count: totalJoined } = await supabaseAdmin
    .from("event_users")
    .select("id", { count: "exact", head: true })
    .eq("event_id", eventId);

  const submittedCount = usersWithAvailability?.length ?? 0;
  const joinedCount = totalJoined ?? submittedCount;
  const ghostCount = joinedCount - submittedCount;

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
          {joinedCount} {joinedCount === 1 ? "person" : "people"} joined
          {" · "}
          {submittedCount} {submittedCount === 1 ? "has" : "have"} added
          availability
        </p>
      </div>

      {/* Ghost user warning */}
      {ghostCount > 0 && (
        <Card className="border-amber-500/30 bg-amber-500/10 shadow-none py-4 gap-0">
          <CardContent className="flex gap-3 px-4 py-0">
            <Info className="size-4 text-amber-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-semibold font-main text-foreground">
                {ghostCount} {ghostCount === 1 ? "person" : "people"} joined
                without adding availability
              </p>
              <p className="text-xs text-muted-foreground font-main leading-relaxed">
                Since this app doesn&apos;t require an account, anyone who
                closed the tab after joining won&apos;t be able to come back and
                add their times. If this was accidental, they can re-join using
                the event link. Otherwise, you can remove them from the event to
                keep results accurate.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

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
