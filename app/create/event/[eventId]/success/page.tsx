import CopyLinkClient from "./CopyLinkClient";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Link2, TriangleAlert } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function EventSuccessPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const inviteUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/create/anon-user?eventId=${eventId}`;
  const dashboardUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/event/${eventId}/dashboard`;

  return (
    <div className="w-full flex-1 flex flex-col items-center justify-center p-8 gap-8 max-w-xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Event Created! 🎉</h1>
        <p className="text-muted-foreground">
          You&apos;re all set. Save both links below before you leave.
        </p>
      </div>

      <div className="flex flex-col gap-4 w-full">
        {/* Step 1 — Invite link */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Link2 className="size-4 text-primary" />
            Step 1 — Share this invite link with your group
          </div>
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="text-base">Invite Link</CardTitle>
            </CardHeader>
            <CardContent>
              <CopyLinkClient url={inviteUrl} />
            </CardContent>
          </Card>
        </div>

        {/* Step 2 — Dashboard link */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-amber-600 dark:text-amber-400">
            <TriangleAlert className="size-4" />
            Step 2 — Save your results link — you cannot recover this
          </div>
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="text-base">Your Results Link</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <CopyLinkClient url={dashboardUrl} />
              <p className="text-sm text-muted-foreground leading-relaxed">
                This is the only way to view your event results. Since there are
                no accounts, there is no way to recover this link if you lose
                it.
              </p>
            </CardContent>
          </Card>
        </div>
        <p className="text-md text-center">
          Once your group has joined, you can use the link above to view the
          event dashboard and see everyone&apos;s availability!
        </p>
      </div>

      {/* Dashboard Button */}
      <Button asChild size="lg" className="w-full sm:w-auto">
        <Link href={`/event/${eventId}/dashboard`}>
          Or go to Dashboard now
          <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </Button>
    </div>
  );
}
