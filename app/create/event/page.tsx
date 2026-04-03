import EventDetailsForm from "./EventDetailsForm";
import { createClient } from "@/lib/supabase/server";

export default async function CreateEventPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-secondary-foreground text-center">Create Event</h1>
      <EventDetailsForm />
    </div>
  );
}
