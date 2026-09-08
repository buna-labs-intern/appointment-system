import { z } from 'zod'
import {
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
} from '@/utils/validation'

export const receptionistSchema = z.object({
  fullName: z.string().trim().min(2, 'Full name is required'),
  email: z.string().trim().email('Enter a valid email address'),
  password: z
    .string()
    .min(PASSWORD_MIN_LENGTH, 'Password must be at least 8 characters')
    .max(PASSWORD_MAX_LENGTH, 'Password cannot exceed 64 characters')
    .optional()
    .or(z.literal('')),
  isActive: z.boolean(),
})

export type ReceptionistFormValues = z.infer<typeof receptionistSchema>

export const createReceptionistSchema = receptionistSchema.extend({
  password: z
    .string()
    .min(PASSWORD_MIN_LENGTH, 'Password must be at least 8 characters')
    .max(PASSWORD_MAX_LENGTH, 'Password cannot exceed 64 characters'),
})