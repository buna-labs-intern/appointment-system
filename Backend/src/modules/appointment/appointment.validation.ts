import { z } from "zod";

export const createAppointmentSchema = z.object({
  body: z.object({
    doctorId: z.union([z.string(), z.number()]).transform(String),
    patientId: z.union([z.string(), z.number()]).transform(String),
    serviceId: z.union([z.string(), z.number()]).transform(String),
    date: z.string().min(1, "Appointment date is required"),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
    reason: z.string().optional().nullable(),
    notes: z.string().optional().nullable(),
    status: z.enum(["SCHEDULED", "CHECKED_IN", "COMPLETED", "CANCELLED", "NO_SHOW"]).optional(),
  }),
});

export const updateAppointmentSchema = z.object({
  body: z.object({
    doctorId: z.union([z.string(), z.number()]).transform(String).optional(),
    patientId: z.union([z.string(), z.number()]).transform(String).optional(),
    serviceId: z.union([z.string(), z.number()]).transform(String).optional(),
    date: z.string().optional(),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
    reason: z.string().optional().nullable(),
    notes: z.string().optional().nullable(),
    status: z.enum(["SCHEDULED", "CHECKED_IN", "COMPLETED", "CANCELLED", "NO_SHOW"]).optional(),
  }),
});

export const appointmentStatusSchema = z.object({
  body: z.object({
    status: z.enum([
      "SCHEDULED",
      "CHECKED_IN",
      "COMPLETED",
      "CANCELLED",
      "NO_SHOW",
    ]),
  }),
});
