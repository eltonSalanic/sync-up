import z from "zod";

export const pinDto = z.object({
  pin: z.string().length(4, "PIN must be 4 digits"),
  eventId: z.string("Event ID is required"),
});
