// src/modules/doctor/doctor.validation.ts
import { z } from 'zod';

// ✅ CREATE
export const createDoctorSchema = z.object({
  body: z.object({
    fullName: z.string().min(2, 'Full name must be at least 2 characters'),
    specialty: z.string().min(2, 'Specialty must be at least 2 characters'),
    phone: z.string().min(10, 'Phone must be at least 10 characters'),
  }),
});

// ✅ UPDATE
export const updateDoctorSchema = z.object({
  body: z.object({
    fullName: z.string().min(2).optional(),
    specialty: z.string().min(2).optional(),
    phone: z.string().min(10).optional(),
    isActive: z.boolean().optional(),
  }),
});

// ✅ GET ALL (query)
export const getDoctorsSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
    searchTerm: z.string().optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
    specialty: z.string().optional(),
    isActive: z.string().transform(val => val === 'true').optional(),
  }),
});

// ✅ GET BY ID / DELETE / TOGGLE ACTIVE
export const doctorIdSchema = z.object({
  params: z.object({
    id: z.string().cuid('Invalid doctor ID'),
  }),
});