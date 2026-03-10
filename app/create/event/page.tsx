import EventDetailsForm from "./EventDetailsForm";
import { createClient } from "@/lib/supabase/server";

export default async function CreateEventPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();


  return (
    <div className="">
      <p>Add in your event details here</p>
      <EventDetailsForm />
    </div>
  );
}
