// src/modules/service/service.validation.ts
import { z } from 'zod';

// ✅ CREATE
export const createServiceSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Service name must be at least 2 characters'),
    price: z.number().positive('Price must be greater than 0'),
    duration: z.number().int().positive('Duration must be a positive integer'),
  }),
});

// ✅ UPDATE
export const updateServiceSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    price: z.number().positive().optional(),
    duration: z.number().int().positive().optional(),
    isActive: z.boolean().optional(),
  }),
});

// ✅ GET ALL (query)
export const getServicesSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
    searchTerm: z.string().optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
    isActive: z.string().transform(val => val === 'true').optional(),
  }),
});

// ✅ GET BY ID / DELETE / ACTIVATE / DEACTIVATE
export const serviceIdSchema = z.object({
  params: z.object({
    id: z.string().cuid('Invalid service ID'),
  }),
});