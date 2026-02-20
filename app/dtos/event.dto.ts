import { z } from "zod";


export const CreateEventSchema = z.object({
  name: z.string().min(1, "Event name is required"),
  description: z.string().min(1, "Description is required"),
  maxPeople: z.number().min(1, "Must be at least 1 person"),
  date: z.date().min(new Date(0), "Please select a date"),
});

export type CreateEvent = z.infer<typeof CreateEventSchema>;
