import { z } from "zod";
import {
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
} from "../../utils/validationConstants";

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email format"),
    password: z
      .string()
      .min(1, "Password is required")
      .max(PASSWORD_MAX_LENGTH, "Password cannot exceed 64 characters"),
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z
      .string()
      .min(1, "Current password is required")
      .max(PASSWORD_MAX_LENGTH, "Password cannot exceed 64 characters"),
    newPassword: z
      .string()
      .min(PASSWORD_MIN_LENGTH, "New password must be at least 8 characters")
      .max(PASSWORD_MAX_LENGTH, "Password cannot exceed 64 characters")
      .regex(/[A-Z]/, "Include an uppercase letter")
      .regex(/[0-9]/, "Include a number"),
  }),
});
