import { z } from 'zod'

export const shiftSchema = z.object({
  receptionistId: z.string().min(1, 'Receptionist is required'),
  date: z.string().min(1, 'Date is required'),
  session: z.enum(['MORNING', 'AFTERNOON']),
  location: z.string().trim().min(2, 'Location is required'),
})

export type ShiftFormValues = z.infer<typeof shiftSchema>