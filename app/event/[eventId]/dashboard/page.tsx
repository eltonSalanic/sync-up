import { notFound } from "next/navigation";
import {
  createClient,
  QueryResult,
  QueryData,
  QueryError,
} from "@supabase/supabase-js";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Database } from "@/database.types";
import AvailabilityDisplayCalendar from "./AvailabilityDisplayCalendar";

export default async function EventDashboardPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );

  // 1. Fetch Event Info
  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("id, name, description")
    .eq("id", eventId)
    .single();

  if (eventError || !event) {
    notFound();
  }

  // 2. Fetch Availability Results
  // data: allAvailabilitySlots, error: availabilityErro
  const availabilityWithUsersQuery = supabase
    .from("users")
    .select(
      `
      id,
      first_name,
      last_name,
      timeSlot:user_event_availability!inner(
        start_time,
        end_time
      )
    `,
    )
    .eq("user_event_availability.event_id", eventId);

  type AvailabilityWithUsers = QueryData<typeof availabilityWithUsersQuery>;
  const { data, error: availabilityError } = await availabilityWithUsersQuery;
  const availabilitySlotsWithUsers: AvailabilityWithUsers | null = data;

  if (availabilityError) {
    console.error("Error fetching availability results:", availabilityError);
    return null;
  }

  console.log("Slots", availabilitySlotsWithUsers);

  /*// Extract unique users who have responded
  const uniqueResponders = new Map<string, string>();
  
  if (availabilityResults) {
    availabilityResults.forEach((row) => {
      // Supabase join returns an array or object depending on relation, users is 1:many from this perspective
      const user = row.users as unknown as { first_name: string; last_name: string } | null;
      if (user) {
        uniqueResponders.set(row.user_id, `${user.first_name} ${user.last_name}`);
      }
    });
  }*/

  return (
    <div className="w-full h-full flex-1 flex flex-col p-8 max-w-4xl mx-auto space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">
          {event.name} - Dashboard
        </h1>
        <p className="text-muted-foreground">{event.description}</p>
      </div>
      <AvailabilityDisplayCalendar />
      {/* Heatmap Placeholder */}
      {/*
        <Card>
          <CardHeader>
            <CardTitle>Availability Heatmap</CardTitle>
            <CardDescription>Best times to meet</CardDescription>
          </CardHeader>
          <CardContent className="h-48 flex items-center justify-center border-2 border-dashed border-border rounded-md bg-muted/20">
            <p className="text-muted-foreground text-sm">Heatmap calendar coming soon...</p>
          </CardContent>
        </Card>*/}
    </div>
  );
}
