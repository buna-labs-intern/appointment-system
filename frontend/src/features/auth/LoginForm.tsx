import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, LogIn } from 'lucide-react'
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
import { loginSchema, type LoginFormValues } from '@/features/auth/loginSchema'

type LoginFormProps = {
  onSubmit: (values: LoginFormValues) => void
  error?: string
  isSubmitting?: boolean
}

export default function LoginForm({ onSubmit, error, isSubmitting }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false)

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      trustDevice: false,
    },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Address</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  autoComplete="email"
                  placeholder="admin@hospital.com"
                  className="h-11 rounded-xl"
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
              <div className="flex items-center justify-between">
                <FormLabel>Password</FormLabel>
                <button
                  type="button"
                  className="text-sm font-medium text-[#3482B5] hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <FormControl>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className="h-11 rounded-xl pr-10"
                    disabled={isSubmitting}
                    {...field}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="trustDevice"
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
                Trust this device for 30 days
              </label>
            </FormItem>
          )}
        />

        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        <Button
          type="submit"
          disabled={isSubmitting}
          className="h-11 w-full rounded-xl bg-[#005B7F] hover:bg-[#004A68]"
        >
          {isSubmitting ? 'Signing in…' : 'Log In'}
          <LogIn className="h-4 w-4" />
        </Button>
      </form>
    </Form>
  )
}