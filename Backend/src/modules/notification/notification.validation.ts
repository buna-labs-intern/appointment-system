import { z } from "zod";

export const createNotificationSchema = z.object({
  body: z.object({
    title: z.string().min(1, "Notification title is required"),
    message: z.string().min(1, "Notification message is required"),
    type: z.enum(["appointment", "patient", "system", "alert"]).optional().default("system"),
  }),
});
