import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().trim().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
  role: z.enum(['ADMIN', 'RECEPTIONIST']),
  trustDevice: z.boolean().optional(),
})

export type LoginFormValues = z.infer<typeof loginSchema>
