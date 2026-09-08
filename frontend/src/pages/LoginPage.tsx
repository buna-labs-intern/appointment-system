import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router'
import { useMutation } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import useAuth from '@/hooks/useAuth'
import { loginRequest, type LoginPayload } from '@/features/auth/authAPI'
import LoginForm from '@/features/auth/LoginForm'
import type { LoginFormValues } from '@/features/auth/loginSchema'

export default function LoginPage() {
  const { isAuthenticated, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [error, setError] = useState('')

  const loginMutation = useMutation({
    mutationFn: (payload: LoginPayload) => loginRequest(payload),
    onSuccess: (data) => {
      login(data.user, data.token, data.tenant)
      const redirectTo =
        (location.state as { from?: { pathname?: string } } | null)?.from
          ?.pathname || '/dashboard'
      navigate(redirectTo, { replace: true })
    },
    onError: (err: unknown) => {
      if (isAxiosError(err)) {
        const message =
          (err.response?.data as { message?: string } | undefined)?.message ||
          'Invalid email or password'
        setError(message)
        return
      }
      setError('Unable to sign in. Please try again.')
    },
  })

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  const handleSubmit = (values: LoginFormValues) => {
    setError('')
    loginMutation.mutate({
      email: values.email.trim(),
      password: values.password,
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F4F7FA] via-[#EEF3F7] to-[#E8EEF4] px-4 py-10 font-sans text-[#1A2B3C]">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl flex-col items-center justify-center gap-8 lg:flex-row lg:items-center lg:gap-14">
        <section className="flex w-full max-w-md flex-col items-center text-center lg:items-start lg:text-left">
          <div className="w-full rounded-2xl bg-white p-8 shadow-[0_8px_30px_rgba(16,42,68,0.06)]">
            <img
              src="/nexacare-logo.png"
              alt="NexaCare Health Management"
              className="mx-auto h-auto w-full max-w-[280px] object-contain"
            />
          </div>

          <div className="mt-8 max-w-sm">
            <h2 className="text-xl font-bold tracking-tight text-[#102A44]">
              Advanced Clinic Management
            </h2>
          </div>
        </section>

        <section className="w-full max-w-md">
          <div className="rounded-2xl bg-white px-8 py-9 shadow-[0_12px_40px_rgba(16,42,68,0.08)]">
            <header className="mb-8 flex items-start gap-3">
              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#0F5C66]">
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-white" aria-hidden="true">
                  <path d="M12 2l7 3v6c0 5-3.5 9.5-7 11-3.5-1.5-7-6-7-11V5l7-3zm0 5v4h-2v2h2v2h2v-2h2v-2h-2V7h-2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-[#102A44]">NexaCare</h1>
                <p className="text-sm text-[#8D9AA6]">Secure Clinic Operations Portal</p>
              </div>
            </header>

            <LoginForm
              onSubmit={handleSubmit}
              error={error}
              isSubmitting={loginMutation.isPending}
            />

            <footer className="mt-8 space-y-2 text-center">
              <p className="text-[10px] font-semibold tracking-[0.16em] text-[#A8B4BF]">
                AUTHORIZED PERSONNEL ONLY
              </p>
              <p className="pt-1 text-sm text-[#8D9AA6]">
                Accounts are created by an administrator.
              </p>
            </footer>
          </div>

          <div className="mt-5 flex justify-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#E7F4F4] px-4 py-2 text-xs font-medium text-[#0F5C66]">
              <span className="h-2 w-2 rounded-full bg-[#22C55E]" />
              System Online
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
