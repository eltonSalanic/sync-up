import EventDetailsForm from "./EventDetailsForm";

export default async function CreateEventPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="text-center space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Create Event</h1>
        <p className="text-muted-foreground text-lg">
          Fill in your event details below.
        </p>
      </div>
      <EventDetailsForm />
    </div>
  );
}
