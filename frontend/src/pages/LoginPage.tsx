import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import useAuth from '@/hooks/useAuth'
import { ROLES } from '@/utils/constants'
import LoginForm from '@/features/auth/LoginForm'
import type { LoginFormValues } from '@/features/auth/loginSchema'

export default function LoginPage() {
  const { isAuthenticated, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [error, setError] = useState('')

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  const handleSubmit = (values: LoginFormValues) => {
    setError('')

    // Temporary local login until backend auth is connected
    login(
      {
        id: 1,
        email: values.email.trim(),
        fullName: values.role === ROLES.ADMIN ? 'NexaCare Admin' : 'Front Desk',
        role: values.role,
      },
      'dev-token',
    )

    const redirectTo = location.state?.from?.pathname || '/dashboard'
    navigate(redirectTo, { replace: true })
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
              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#005B7F]">
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-white" aria-hidden="true">
                  <path d="M12 2l7 3v6c0 5-3.5 9.5-7 11-3.5-1.5-7-6-7-11V5l7-3zm0 5v4h-2v2h2v2h2v-2h2v-2h-2V7h-2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-[#102A44]">NexaCare</h1>
                <p className="text-sm text-[#8D9AA6]">Secure Clinic Operations Portal</p>
              </div>
            </header>

            <LoginForm onSubmit={handleSubmit} error={error} />

            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-[#E3E9EF]" />
              <span className="text-[11px] font-medium tracking-[0.12em] text-[#8D9AA6]">
                OR CONTINUE WITH
              </span>
              <div className="h-px flex-1 bg-[#E3E9EF]" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                className="flex items-center justify-center gap-2 rounded-xl border border-[#D5DEE7] bg-white py-2.5 text-sm font-medium text-[#102A44] transition hover:bg-[#F7F9FB]"
              >
                <GoogleIcon />
                Google
              </button>
              <button
                type="button"
                className="flex items-center justify-center gap-2 rounded-xl border border-[#D5DEE7] bg-white py-2.5 text-sm font-medium text-[#102A44] transition hover:bg-[#F7F9FB]"
              >
                <MicrosoftIcon />
                Microsoft
              </button>
            </div>

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
            <div className="inline-flex items-center gap-2 rounded-full bg-[#D9ECF7] px-4 py-2 text-xs font-medium text-[#005B7F]">
              <span className="h-2 w-2 rounded-full bg-[#22C55E]" />
              System Online
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M12 10.2v3.6h5.1c-.2 1.2-1.5 3.6-5.1 3.6-3.1 0-5.6-2.5-5.6-5.6S8.9 6.2 12 6.2c1.8 0 3 .7 3.7 1.4l2.5-2.4C16.8 3.8 14.6 3 12 3 7 3 3 7 3 12s4 9 9 9c5.2 0 8.6-3.6 8.6-8.7 0-.6-.1-1-.2-1.5H12z"
      />
    </svg>
  )
}

function MicrosoftIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path fill="#F25022" d="M3 3h8v8H3z" />
      <path fill="#7FBA00" d="M13 3h8v8h-8z" />
      <path fill="#00A4EF" d="M3 13h8v8H3z" />
      <path fill="#FFB900" d="M13 13h8v8h-8z" />
    </svg>
  )
}
