import { z } from "zod";

export const createBranchSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Name must be at least 2 characters").max(80),
    slug: z.string().min(2).max(40).regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens").optional(),
    address: z.string().max(200).optional(),
    phone: z.string().max(20).optional(),
  }),
});

export const updateBranchSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(80).optional(),
    slug: z.string().min(2).max(40).regex(/^[a-z0-9-]+$/).optional(),
    address: z.string().max(200).optional().nullable(),
    phone: z.string().max(20).optional().nullable(),
  }),
});

export const blockBranchSchema = z.object({
  body: z.object({
    reason: z.string().max(300).optional(),
  }),
});
