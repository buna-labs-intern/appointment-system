import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { SESSION_TIMES } from '@/features/schedule/types'
import { shiftSchema, type ShiftFormValues } from '@/features/schedule/shiftSchema'

type StaffOption = {
  id: string
  fullName: string
}

type ShiftFormProps = {
  staffOptions: StaffOption[]
  defaultValues?: Partial<ShiftFormValues>
  onSubmit: (values: ShiftFormValues) => void
  onCancel: () => void
  isSubmitting?: boolean
}

export default function ShiftForm({
  staffOptions,
  defaultValues,
  onSubmit,
  onCancel,
  isSubmitting,
}: ShiftFormProps) {
  const form = useForm<ShiftFormValues>({
    resolver: zodResolver(shiftSchema),
    defaultValues: {
      receptionistId: '',
      date: '',
      session: 'MORNING',
      location: 'Front Desk',
      ...defaultValues,
    },
  })

  const session = form.watch('session')

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="receptionistId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Receptionist</FormLabel>
              <FormControl>
                <select
                  {...field}
                  disabled={isSubmitting}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">Select receptionist</option>
                  {staffOptions.map((person) => (
                    <option key={person.id} value={person.id}>
                      {person.fullName}
                    </option>
                  ))}
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date</FormLabel>
              <FormControl>
                <Input type="date" disabled={isSubmitting} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="session"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Shift session</FormLabel>
              <FormControl>
                <select
                  {...field}
                  disabled={isSubmitting}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="MORNING">{SESSION_TIMES.MORNING.label}</option>
                  <option value="AFTERNOON">{SESSION_TIMES.AFTERNOON.label}</option>
                </select>
              </FormControl>
              <p className="text-xs text-muted-foreground">
                Lunch break 12:00 – 13:00 is blocked. Selected: {SESSION_TIMES[session].start} –{' '}
                {SESSION_TIMES[session].end}
              </p>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <FormControl>
                <Input placeholder="Front Desk" disabled={isSubmitting} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-[#0F5C66] hover:bg-[#0C4B53]"
          >
            {isSubmitting ? 'Saving…' : 'Save shift'}
          </Button>
        </div>
      </form>
    </Form>
  )
}