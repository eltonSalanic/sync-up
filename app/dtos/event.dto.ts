import { z } from "zod";


export const CreateEventSchema = z.object({
  name: z.string().min(1, "Event name is required"),
  description: z.string().min(1, "Description is required"),
  maxPeople: z.number().min(1, "Must be at least 1 person"),
  // You can infer date through the timestamp
  availableDatesWithTimes: z.array(z.object({
    date: z.date(),
    startTime: z.iso.datetime(),
    endTime: z.iso.datetime(),
  })),
});

export type CreateEvent = z.infer<typeof CreateEventSchema>;
