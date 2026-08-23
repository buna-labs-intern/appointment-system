import { z } from "zod";

export const createPatientSchema = z.object({
  body: z.object({
    fullName: z.string().min(2, "Full name must be at least 2 characters"),
    phone: z.string().min(6, "Phone must be at least 6 characters"),
    gender: z.string().min(1, "Gender is required"),
    birthDate: z.string().optional(),
    dateOfBirth: z.string().optional(),
    address: z.string().optional().nullable(),
    notes: z.string().optional().nullable(),
  }),
});

export const updatePatientSchema = z.object({
  body: z.object({
    fullName: z.string().min(2).optional(),
    phone: z.string().min(6).optional(),
    gender: z.string().optional(),
    birthDate: z.string().optional(),
    dateOfBirth: z.string().optional(),
    address: z.string().optional().nullable(),
    notes: z.string().optional().nullable(),
  }),
});

export const getPatientsSchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    search: z.string().optional(),
    searchTerm: z.string().optional(),
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