import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import PinForm from "./PinForm";
import RemoveUserButton from "./RemoveUserButton";
import AvailabilityDisplayCalendar from "./AvailabilityDisplayCalendar";
import ConsensusWindowPanel from "./ConsensusWindow";
import { Card, CardContent } from "@/components/ui/card";
import {
  Calendar,
  Clock,
  Info,
  Users,
  CircleAlert,
  CheckCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default async function EventDashboardPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const supabaseAdmin = createAdminClient();

  // 1. Fetch Event Info (with PIN to check access) + admin's timezone
  const { data: event, error: eventError } = await supabaseAdmin
    .from("events")
    .select(
      "id, name, description, pin, creator:users!events_creator_user_id_fkey(timezone)",
    )
    .eq("id", eventId)
    .single();

  if (eventError || !event) {
    notFound();
  }

  // Check PIN access
  const cookieStore = await cookies();
  const cookiePin = cookieStore.get(`dashboard_access_${eventId}`)?.value;
  const hasAccess = !event.pin || event.pin === cookiePin; // Check if event has pin, or if cookie matches pin

  if (!hasAccess) {
    return <PinForm eventId={eventId} eventName={event.name} />;
  }

  // 2. Fetch Event Slots
  const { data: eventSlots, error: eventSlotsError } = await supabaseAdmin
    .from("event_days")
    .select("id, start_time, end_time")
    .eq("event_id", eventId);

  if (eventSlotsError) {
    console.error("Error fetching event slots:", eventSlotsError);
  }

  // 3. Fetch Availability Results (only users who submitted slots)
  const { data: usersWithAvailability, error: availabilityError } =
    await supabaseAdmin
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

  // 4. Fetch all members using admin client
  const { data: allEventUsers } = await supabaseAdmin
    .from("event_users")
    .select(
      `
      id,
      user_id,
      user:users (
        id,
        first_name,
        last_name
      )
    `,
    )
    .eq("event_id", eventId);

  const creator = Array.isArray(event.creator)
    ? event.creator[0]
    : event.creator;
  const adminTimezone: string = creator?.timezone ?? "UTC";

  const submittedCount = usersWithAvailability?.length ?? 0;
  const joinedCount = allEventUsers?.length ?? submittedCount;
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
                Since Are You Free doesn&apos;t require an account, anyone who
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
            adminTimezone={adminTimezone}
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
          adminTimezone={adminTimezone}
        />
      </section>

      {/* Guest List Section */}
      <section className="flex flex-col gap-3 mt-4">
        <div className="flex items-center gap-2">
          <Users className="size-4 text-primary" />
          <h2 className="text-sm font-semibold font-main text-foreground">
            Attendees
          </h2>
        </div>
        <Card className="shadow-none py-0 border-border overflow-hidden">
          <CardContent className="p-0">
            <ul className="divide-y divide-border">
              {allEventUsers?.map((eu) => {
                const userObj = Array.isArray(eu.user) ? eu.user[0] : eu.user;
                if (!userObj) return null;
                const hasSubmitted = usersWithAvailability?.some(
                  (u) => u.id === userObj.id,
                );

                return (
                  <li
                    key={eu.id}
                    className="flex items-center justify-between p-4 flex-col sm:flex-row gap-4 transition-colors hover:bg-muted/30"
                  >
                    <div className="flex flex-col text-left">
                      <span className="font-medium font-main text-foreground">
                        {userObj.first_name} {userObj.last_name}
                      </span>
                      {hasSubmitted ? (
                        <Badge className="bg-chart-4">
                          <CheckCircle />
                          Added availability
                        </Badge>
                      ) : (
                        <Badge className="bg-destructive/80">
                          <CircleAlert /> Has not added availability
                        </Badge>
                      )}
                    </div>
                    <RemoveUserButton
                      eventId={eventId}
                      eventUserId={eu.id}
                      userName={`${userObj.first_name} ${userObj.last_name}`}
                    />
                  </li>
                );
              })}
              {(!allEventUsers || allEventUsers.length === 0) && (
                <li className="p-8 text-center text-sm font-main text-muted-foreground">
                  No guests have joined yet.
                </li>
              )}
            </ul>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
