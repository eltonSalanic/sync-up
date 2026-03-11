import CopyLinkClient from "./CopyLinkClient";

export default async function EventSuccessPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const resolvedParams = await params;
  const eventId = resolvedParams.eventId;
  return (
    <div className="w-full flex-1 flex flex-col items-center justify-center p-8 gap-6 max-w-xl mx-auto">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">Event Created Successfully! 🎉</h1>
        <p className="text-muted-foreground text-lg">
          Your event is ready. Share the link below with others so they can easily
          join and add their availability.
        </p>
      </div>

      <CopyLinkClient eventId={eventId} />
    </div>
  );
}
