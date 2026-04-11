import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import AnonUserForm from "./AnonUserForm";
import { Metadata } from "next";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}): Promise<Metadata> {
  const supabaseAdmin = createAdminClient();
  const eventId = (await searchParams).eventId as string;
  const data = await supabaseAdmin
    .from("events")
    .select("name")
    .eq("id", eventId);
  const eventName = data.data?.[0]?.name || "an event";

  return {
    title: `You have been invited to ${eventName}. Join to enter your availability!`,
  };
}

export default async function CreateAnonUserPage({
  searchParams,
}: {
  searchParams: Promise<{ eventId?: string }>;
}) {
  const { eventId } = await searchParams;

  // Guest joining via share link
  if (eventId) {
    const supabase = await createClient();
    const { data: event, error } = await supabase
      .from("events")
      .select("id, name, maxMembers, event_users(id)")
      .eq("id", eventId)
      .single();

    if (error || !event) {
      notFound();
    }

    const memberCount = event.event_users?.length ?? 0;
    const isFull = event.maxMembers !== null && memberCount >= event.maxMembers;

    // Will still allow overflow of users if an extra user joined at the same time as the final user. Not to important as
    // admin can always delete user
    if (isFull) {
      return (
        <div className="w-full flex-1 flex flex-col items-center justify-center p-8 gap-4 max-w-xl mx-auto text-center">
          <h1 className="text-3xl font-bold tracking-tight">Event Full</h1>
          <p className="text-muted-foreground text-lg">
            <span className="font-semibold text-foreground">{event.name}</span>{" "}
            has reached its maximum number of members.
          </p>
        </div>
      );
    }

    return (
      <div className="w-full flex-1 flex flex-col items-center justify-center p-8 gap-6 max-w-xl mx-auto">
        <div className="text-center space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">
            You&apos;re Invited!
          </h1>
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
      <div className="text-center space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Get Started</h1>
        <p className="text-muted-foreground text-lg">
          Add your name and timezone — results will display in your local time.
        </p>
      </div>
      <AnonUserForm />
    </div>
  );
}
