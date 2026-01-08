import { z } from "zod";
import { Timezones } from "@/app/types/enums";

//Anonymous Users
export const anonUserSchema = z.object({
  fName: z.string().min(1, "First name is required"),
  lName: z.string().min(1, "Last name is required"),
  timezone: z.enum(Timezones, "Must be a valid timezone"),
});

export type AnonUser = z.infer<typeof anonUserSchema>;