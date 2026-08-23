import { z } from "zod";

export const createUserSchema = z.object({
  body: z.object({
    fullName: z.string().min(2, "Full name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    role: z.enum(["ADMIN", "RECEPTIONIST"]).optional().default("RECEPTIONIST"),
    isActive: z.boolean().optional().default(true),
  }),
});

export const updateUserSchema = z.object({
  body: z.object({
    fullName: z.string().min(2).optional(),
    email: z.string().email().optional(),
    password: z.string().min(6).optional(),
    role: z.enum(["ADMIN", "RECEPTIONIST"]).optional(),
    isActive: z.boolean().optional(),
  }),
});
