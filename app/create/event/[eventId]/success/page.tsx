import CopyLinkClient from "./CopyLinkClient";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

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
        <h1 className="text-3xl font-bold tracking-tight">
          Event Created Successfully! 🎉
        </h1>
        <p className="text-muted-foreground text-lg">
          Your event is ready. Share the link below with others so they can
          easily join and add their availability.
        </p>
      </div>

      <CopyLinkClient eventId={eventId} />

      <div className="flex flex-col items-center mt-4 w-full border-t border-border pt-8">
        <h2 className="text-xl font-semibold mb-2">
          Ready to see your results?
        </h2>
        <p className="text-muted-foreground text-center mb-6">
          You can check this dashboard at any time to see when your friends are
          available. Bookmark it so you don&apos;t lose it!
        </p>
        <Button asChild size="lg" className="w-full sm:w-auto">
          <Link href={`/event/${eventId}/dashboard`}>
            Go to Event Dashboard
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
