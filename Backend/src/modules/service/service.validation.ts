import { z } from "zod";

export const createServiceSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Service name must be at least 2 characters"),
    description: z.string().optional().nullable(),
    price: z.number().nonnegative().optional().default(0),
    duration: z.number().int().positive().optional().default(30),
    isActive: z.boolean().optional().default(true),
  }),
});

export const updateServiceSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    description: z.string().optional().nullable(),
    price: z.number().nonnegative().optional(),
    duration: z.number().int().positive().optional(),
    isActive: z.boolean().optional(),
  }),
});

export const getServicesSchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    search: z.string().optional(),
    searchTerm: z.string().optional(),
    sortBy: z.string().optional(),
    sortOrder: z.string().optional(),
    isActive: z.string().optional(),
  }).optional(),
});

export const serviceIdSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Invalid service ID"),
  }),
});