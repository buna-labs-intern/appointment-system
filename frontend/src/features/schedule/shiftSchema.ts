import { z } from 'zod'
import { isDateTodayOrFuture, isWeekend } from '@/utils/clinicHours'

export const shiftSchema = z
  .object({
    receptionistId: z.string().min(1, 'Please select a receptionist'),
    date: z
      .string()
      .min(1, 'Please choose a shift date')
      .refine(isDateTodayOrFuture, {
        message: 'Shift date cannot be in the past',
      }),
    session: z.enum(['MORNING', 'AFTERNOON']),
    location: z
      .string()
      .trim()
      .min(2, 'Please enter a location (at least 2 characters)'),
  })
  .superRefine((values, ctx) => {
    if (values.date && isWeekend(values.date)) {
      ctx.addIssue({
        code: 'custom',
        path: ['date'],
        message: 'Staff shifts are only scheduled on weekdays',
      })
    }
  })

export type ShiftFormValues = z.infer<typeof shiftSchema>
