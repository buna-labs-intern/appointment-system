import { z } from "zod";

export const createPatientSchema = z.object({
  body: z.object({
    fullName: z.string().min(2, "Full name must be at least 2 characters").max(100, "Full name cannot exceed 100 characters"),
    phone: z
      .string()
      .min(7, "Phone number must be at least 7 characters")
      .max(16, "Phone number cannot exceed 16 characters")
      .regex(/^[+]?[0-9\s\-()]+$/, "Invalid phone number format"),
    gender: z.string().min(1, "Gender is required"),
    birthDate: z.string().optional(),
    dateOfBirth: z.string().optional(),
    address: z.string().max(255, "Address cannot exceed 255 characters").optional().nullable(),
    notes: z.string().max(1000, "Notes cannot exceed 1000 characters").optional().nullable(),
  }),
});

export const updatePatientSchema = z.object({
  body: z.object({
    fullName: z.string().min(2).max(100).optional(),
    phone: z
      .string()
      .min(7, "Phone number must be at least 7 characters")
      .max(16, "Phone number cannot exceed 16 characters")
      .regex(/^[+]?[0-9\s\-()]+$/, "Invalid phone number format")
      .optional(),
    gender: z.string().optional(),
    birthDate: z.string().optional(),
    dateOfBirth: z.string().optional(),
    address: z.string().max(255).optional().nullable(),
    notes: z.string().max(1000).optional().nullable(),
  }),
});

export const getPatientsSchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    search: z.string().optional(),
    searchTerm: z.string().optional(),
    q: z.string().optional(),
    sortBy: z.string().optional(),
    sortOrder: z.string().optional(),
    gender: z.string().optional(),
  }).optional(),
});

export const patientIdSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Invalid patient ID"),
  }),
});