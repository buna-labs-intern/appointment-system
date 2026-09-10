import { z } from "zod";
import {
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
} from "../../utils/validationConstants";

export const createUserSchema = z.object({
  body: z.object({
    fullName: z.string().min(2, "Full name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z
      .string()
      .min(PASSWORD_MIN_LENGTH, "Password must be at least 8 characters")
      .max(PASSWORD_MAX_LENGTH, "Password cannot exceed 64 characters"),
    role: z.enum(["ADMIN", "RECEPTIONIST"]).optional().default("RECEPTIONIST"),
    isActive: z.boolean().optional().default(true),
    branchIds: z.array(z.string()).optional(),
    branchId: z.string().optional(),
  }),
});

export const updateUserSchema = z.object({
  body: z.object({
    fullName: z.string().min(2).optional(),
    email: z.string().email().optional(),
    password: z
      .string()
      .min(PASSWORD_MIN_LENGTH)
      .max(PASSWORD_MAX_LENGTH, "Password cannot exceed 64 characters")
      .optional(),
    role: z.enum(["ADMIN", "RECEPTIONIST"]).optional(),
    isActive: z.boolean().optional(),
    branchIds: z.array(z.string()).optional(),
    branchId: z.string().optional().nullable(),
  }),
});
