import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AnonUserForm from "./AnonUserForm";

export default async function CreateAnonUserPage({
  searchParams,
}: {
  searchParams: Promise<{ eventId?: string }>;
}) {
  const { eventId } = await searchParams;

  // Guest joining via share link
  if (eventId) {
    console.log("Event ID: ", eventId);
    const supabase = await createClient();
    const { data: event, error } = await supabase
      .from("events")
      .select("id, name")
      .eq("id", eventId)
      .single();

    if (error || !event) {
      console.log("Cannot find event with id: ", eventId);
      return <p>Cannot find event with id: {eventId}</p>;
    }

    return (
      <div className="w-full flex-1 flex flex-col items-center justify-center p-8 gap-6 max-w-xl mx-auto">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">You&apos;re Invited! 🎉</h1>
          <p className="text-muted-foreground text-lg">
            Enter your details to join{" "}
            <span className="font-semibold text-foreground">{event.name}</span>.
          </p>
        </div>
        <AnonUserForm eventId={eventId} eventName={event.name} />
      </div>
    );
  }

  // Host creating their account
  return (
    <div className="w-full flex-1 flex flex-col items-center justify-center p-8 gap-6 max-w-xl mx-auto">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Get Started</h1>
        <p className="text-muted-foreground text-lg">
          Add your name and timezone — you&apos;ll be the host of the event.
        </p>
      </div>
      <AnonUserForm />
    </div>
  );
}
