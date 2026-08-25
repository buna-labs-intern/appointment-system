import { z } from "zod";

const sessionEnum = z.enum(["MORNING", "AFTERNOON"]);

export const createShiftSchema = z.object({
  body: z.object({
    receptionistId: z.string().min(1, "Receptionist is required"),
    date: z.string().min(1, "Date is required"),
    session: sessionEnum,
    location: z.string().trim().min(1, "Location is required").max(100).optional(),
  }),
});

export const updateShiftSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    receptionistId: z.string().min(1).optional(),
    date: z.string().min(1).optional(),
    session: sessionEnum.optional(),
    location: z.string().trim().min(1).max(100).optional(),
    status: z.enum(["SCHEDULED", "ON_DUTY", "COMPLETED"]).optional(),
  }),
});

export const shiftIdSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});

export const getShiftsSchema = z.object({
  query: z.object({
    from: z.string().optional(),
    to: z.string().optional(),
    receptionistId: z.string().optional(),
  }),
});
