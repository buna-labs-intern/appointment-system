import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { changePasswordRequest } from '@/features/auth/authAPI'
import { useTenant } from '@/features/tenant/TenantContext'
import useAuth from '@/hooks/useAuth'
import { canChangeOwnPassword } from '@/utils/permissions'
import {
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
} from '@/utils/validation'

const passwordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, 'Current password is required')
      .max(PASSWORD_MAX_LENGTH, 'Password cannot exceed 64 characters'),
    newPassword: z
      .string()
      .min(PASSWORD_MIN_LENGTH, 'New password must be at least 8 characters')
      .max(PASSWORD_MAX_LENGTH, 'Password cannot exceed 64 characters')
      .regex(/[A-Z]/, 'Include an uppercase letter')
      .regex(/[0-9]/, 'Include a number'),
    confirmPassword: z
      .string()
      .min(1, 'Confirm your new password')
      .max(PASSWORD_MAX_LENGTH, 'Password cannot exceed 64 characters'),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type PasswordFormValues = z.infer<typeof passwordSchema>

export default function ProfilePage() {
  const { user } = useAuth()
  const { tenantName } = useTenant()
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const canChangePassword = canChangeOwnPassword(user?.role)

  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  })

  const changeMutation = useMutation({
    mutationFn: changePasswordRequest,
    onSuccess: () => {
      setError('')
      setMessage('Password updated successfully.')
      form.reset()
    },
    onError: (err: unknown) => {
      setMessage('')
      if (isAxiosError(err)) {
        setError(
          (err.response?.data as { message?: string } | undefined)?.message ||
            'Could not update password.',
        )
        return
      }
      setError('Could not update password. Please try again.')
    },
  })

  function onSubmit(values: PasswordFormValues) {
    setError('')
    setMessage('')
    changeMutation.mutate({
      currentPassword: values.currentPassword,
      newPassword: values.newPassword,
    })
  }

  return (
    <section className="mx-auto max-w-2xl space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground">Profile</h3>
        <p className="text-sm text-muted-foreground">
          View your account and change your password.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <h4 className="mb-4 text-sm font-semibold text-foreground">Current user</h4>
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Full name</dt>
            <dd className="font-medium text-foreground">{user?.fullName || '—'}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Email</dt>
            <dd className="font-medium text-foreground">{user?.email || '—'}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Role</dt>
            <dd className="font-medium uppercase text-foreground">{user?.role || '—'}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Clinic</dt>
            <dd className="font-medium text-foreground">{tenantName}</dd>
          </div>
        </dl>
      </div>

      {canChangePassword ? (
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h4 className="mb-4 text-sm font-semibold text-foreground">Change password</h4>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        autoComplete="current-password"
                        maxLength={PASSWORD_MAX_LENGTH}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        autoComplete="new-password"
                        maxLength={PASSWORD_MAX_LENGTH}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm new password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        autoComplete="new-password"
                        maxLength={PASSWORD_MAX_LENGTH}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {error ? <p className="text-sm text-destructive">{error}</p> : null}
              {message ? <p className="text-sm text-emerald-700">{message}</p> : null}

              <Button
                type="submit"
                disabled={changeMutation.isPending}
                className="bg-[#0F5C66] hover:bg-[#0C4B53]"
              >
                {changeMutation.isPending ? 'Updating...' : 'Update password'}
              </Button>
            </form>
          </Form>
        </div>
      ) : null}
    </section>
  )
}
