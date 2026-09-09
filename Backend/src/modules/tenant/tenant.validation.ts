import { z } from "zod";

export const ownerSchema = z.object({
  fullName: z.string().trim().min(2, "Owner name must be at least 2 characters").max(80),
  email: z.string().trim().email("Owner email must be valid").toLowerCase(),
  phone: z
    .string()
    .trim()
    .min(7, "Owner phone must be at least 7 characters")
    .max(20, "Owner phone cannot exceed 20 characters"),
  password: z.string().min(6, "Owner password must be at least 6 characters").max(30),
});

export const createTenantSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2, "Clinic name must be at least 2 characters").max(80),
    slug: z
      .string()
      .trim()
      .min(2)
      .max(40)
      .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens")
      .optional(),
    address: z.string().max(200).optional(),
    phone: z
      .string()
      .trim()
      .min(7, "Clinic phone must be at least 7 characters")
      .max(20, "Clinic phone cannot exceed 20 characters")
      .optional(),
    owner: ownerSchema,
  }),
});

export const updateTenantSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(80).optional(),
    slug: z
      .string()
      .trim()
      .min(2)
      .max(40)
      .regex(/^[a-z0-9-]+$/)
      .optional(),
    address: z.string().max(200).optional().nullable(),
    phone: z.string().trim().min(7).max(20).optional().nullable(),
    defaultBranchId: z.string().optional().nullable(),
  }),
});

export const blockTenantSchema = z.object({
  body: z.object({
    reason: z.string().max(300).optional(),
  }),
});

export const listTenantsQuerySchema = z.object({
  query: z
    .object({
      search: z.string().optional(),
      searchTerm: z.string().optional(),
      q: z.string().optional(),
      isActive: z.string().optional(),
      page: z.string().optional(),
      limit: z.string().optional(),
    })
    .optional(),
});
