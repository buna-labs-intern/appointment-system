// src/modules/patient/patient.validation.ts
import { z } from 'zod';

// ✅ CREATE - with body wrapper
export const createPatientSchema = z.object({
  body: z.object({
    fullName: z.string().min(2, 'Full name must be at least 2 characters'),
    phone: z.string().min(10, 'Phone must be at least 10 characters'),
    gender: z.enum(['Male', 'Female', 'Other']),
    birthDate: z.string().datetime({ message: 'Invalid date format' }),
  }),
});

// ✅ UPDATE - with body wrapper
export const updatePatientSchema = z.object({
  body: z.object({
    fullName: z.string().min(2).optional(),
    phone: z.string().min(10).optional(),
    gender: z.enum(['Male', 'Female', 'Other']).optional(),
    birthDate: z.string().datetime().optional(),
  }),
});

// ✅ GET ALL (query parameters) - with query wrapper
export const getPatientsSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
    searchTerm: z.string().optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
    gender: z.enum(['Male', 'Female', 'Other']).optional(),
  }),
});

// ✅ GET BY ID / DELETE - with params wrapper
export const patientIdSchema = z.object({
  params: z.object({
    id: z.string().cuid('Invalid patient ID'),
  }),
});