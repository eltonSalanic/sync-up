import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AvailabilityForm from "./AvailabilityForm";

export default async function AvailabilityPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const supabase = await createClient();

  // Must be signed in (anon or full user)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/create/anon-user?eventId=${eventId}`);
  }

  // Fetch event + its days in one go
  const { data: event, error } = await supabase
    .from("events")
    .select("id, name, event_days(id, start_time, end_time)")
    .eq("id", eventId)
    .single();

  if (error || !event) {
    notFound();
  }

  const eventDays = (event.event_days ?? []).sort(
    (a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
  );

  if (!eventDays.length) {
    return (
      <div className="w-full flex-1 flex flex-col items-center justify-center p-8">
        <p className="text-muted-foreground">This event has no scheduled days yet.</p>
      </div>
    );
  }

  // Fetch the guest's timezone from their profile
  const { data: userRow } = await supabase
    .from("users")
    .select("timezone")
    .eq("id", user.id)
    .single();

  const timezone = userRow?.timezone ?? "UTC";

  return (
    <div className="w-full flex-1 flex flex-col items-center p-6 pb-16 max-w-5xl mx-auto">
      <AvailabilityForm
        eventId={eventId}
        eventName={event.name}
        eventDays={eventDays}
        timezone={timezone}
      />
    </div>
  );
}
