import { z } from "zod";


export const CreateEventSchema = z.object({
  name: z.string().min(1, "Event name is required"),
  description: z.string().min(1, "Description is required"),
  maxPeople: z.number().min(1, "Must be at least 1 person"),
  availableDatesWithTimes: z.array(
    z
      .object({
        date: z.date(),
        startTime: z.iso.time(),
        endTime: z.iso.time(),
      })
      .refine((val) => val.endTime > val.startTime, {
        message: "End time must be after start time",
        path: ["endTime"],
      }),
  ),
});

export type CreateEventDTO = z.infer<typeof CreateEventSchema>;
