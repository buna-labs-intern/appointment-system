// src/modules/doctor/doctor.validation.ts
import { z } from 'zod';

// ✅ CREATE
export const createDoctorSchema = z.object({
  body: z.object({
    fullName: z.string().min(2, 'Full name must be at least 2 characters').max(100, 'Full name cannot exceed 100 characters'),
    specialty: z.string().min(2, 'Specialty must be at least 2 characters').max(100, 'Specialty cannot exceed 100 characters'),
    phone: z
      .string()
      .min(7, 'Phone number must be at least 7 characters')
      .max(16, 'Phone number cannot exceed 16 characters')
      .regex(/^[+]?[0-9\s\-()]+$/, 'Invalid phone number format'),
  }),
});

// ✅ UPDATE
export const updateDoctorSchema = z.object({
  body: z.object({
    fullName: z.string().min(2).max(100).optional(),
    specialty: z.string().min(2).max(100).optional(),
    phone: z
      .string()
      .min(7, 'Phone number must be at least 7 characters')
      .max(16, 'Phone number cannot exceed 16 characters')
      .regex(/^[+]?[0-9\s\-()]+$/, 'Invalid phone number format')
      .optional(),
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