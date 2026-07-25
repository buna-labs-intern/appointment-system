import { z } from "zod";

export const createAppointmentSchema = z.object({
    body: z.object({
        doctorId: z.string("Doctor ID is required"),

        patientId: z.string("Patient ID is required"),

        serviceId: z.string("Service ID is required"),

        date: z.string("Appointment date is required"),
    }),
});

export const updateAppointmentSchema = z.object({
    body: z.object({
        doctorId: z.string().optional(),
        patientId: z.string().optional(),
        serviceId: z.string().optional(),
        date: z.string().optional(),
        status: z.string().optional(),
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
