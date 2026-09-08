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
import {
  createReceptionistSchema,
  receptionistSchema,
  type ReceptionistFormValues,
} from '@/features/users/receptionistSchema'
import { PASSWORD_MAX_LENGTH } from '@/utils/validation'

type ReceptionistFormProps = {
  mode: 'create' | 'edit'
  defaultValues?: Partial<ReceptionistFormValues>
  onSubmit: (values: ReceptionistFormValues) => void
  onCancel: () => void
  isSubmitting?: boolean
}

export default function ReceptionistForm({
  mode,
  defaultValues,
  onSubmit,
  onCancel,
  isSubmitting,
}: ReceptionistFormProps) {
  const form = useForm<ReceptionistFormValues>({
    resolver: zodResolver(mode === 'create' ? createReceptionistSchema : receptionistSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      isActive: true,
      ...defaultValues,
    },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full name</FormLabel>
              <FormControl>
                <Input placeholder="Front Desk Staff" disabled={isSubmitting} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Access email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="receptionist@nexacare.com"
                  disabled={isSubmitting}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{mode === 'create' ? 'Password' : 'New password (optional)'}</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder={mode === 'create' ? '••••••••' : 'Leave blank to keep current'}
                  disabled={isSubmitting}
                  maxLength={PASSWORD_MAX_LENGTH}
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  name={field.name}
                  ref={field.ref}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem>
              <label className="flex cursor-pointer items-center gap-2.5 text-sm text-muted-foreground">
                <input
                  type="checkbox"
                  checked={!!field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                  disabled={isSubmitting}
                  className="h-4 w-4 rounded border-input"
                />
                Active account
              </label>
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
            {isSubmitting
              ? 'Saving…'
              : mode === 'create'
                ? 'Create receptionist'
                : 'Save changes'}
          </Button>
        </div>
      </form>
    </Form>
  )
}