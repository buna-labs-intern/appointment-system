import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import useAuth from '../hooks/useAuth'
import { ROLES } from '../utils/constants'

export default function LoginPage() {
  const { isAuthenticated, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState(ROLES.RECEPTIONIST)
  const [showPassword, setShowPassword] = useState(false)
  const [trustDevice, setTrustDevice] = useState(false)
  const [error, setError] = useState('')

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    setError('')

    if (!email.trim() || !password.trim()) {
      setError('Email and password are required.')
      return
    }

    // Temporary local login until backend auth is connected
    login(
      {
        id: 1,
        email: email.trim(),
        fullName: role === ROLES.ADMIN ? 'NexaCare Admin' : 'Front Desk',
        role,
      },
      'dev-token',
    )

    const redirectTo = location.state?.from?.pathname || '/dashboard'
    navigate(redirectTo, { replace: true })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F4F7FA] via-[#EEF3F7] to-[#E8EEF4] px-4 py-10 font-sans text-[#1A2B3C]">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl flex-col items-center justify-center gap-8 lg:flex-row lg:items-center lg:gap-14">
        {/* Left branding */}
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

        {/* Right login card */}
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

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-[#102A44]">
                  Email Address
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-[#8D9AA6]">
                    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
                      <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z" />
                    </svg>
                  </span>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="admin@nexacare.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-[#D5DEE7] bg-white py-3 pl-10 pr-3 text-sm text-[#102A44] outline-none transition placeholder:text-[#A8B4BF] focus:border-[#3482B5] focus:ring-2 focus:ring-[#9DC8E2]/40"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label htmlFor="password" className="block text-sm font-medium text-[#102A44]">
                    Password
                  </label>
                  <button
                    type="button"
                    className="text-sm font-medium text-[#3482B5] hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-[#8D9AA6]">
                    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
                      <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6zm9 14H6V10h12v10z" />
                    </svg>
                  </span>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-[#D5DEE7] bg-white py-3 pl-10 pr-11 text-sm text-[#102A44] outline-none transition placeholder:text-[#A8B4BF] focus:border-[#3482B5] focus:ring-2 focus:ring-[#9DC8E2]/40"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute inset-y-0 right-3 flex items-center text-[#8D9AA6] hover:text-[#102A44]"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
                        <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
                        <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="role" className="mb-1.5 block text-sm font-medium text-[#102A44]">
                  Role (temporary)
                </label>
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full rounded-xl border border-[#D5DEE7] bg-white px-3 py-3 text-sm text-[#102A44] outline-none transition focus:border-[#3482B5] focus:ring-2 focus:ring-[#9DC8E2]/40"
                >
                  <option value={ROLES.RECEPTIONIST}>Receptionist</option>
                  <option value={ROLES.ADMIN}>Administrator</option>
                </select>
              </div>

              <label className="flex cursor-pointer items-center gap-2.5 text-sm text-[#5A6B7A]">
                <input
                  type="checkbox"
                  checked={trustDevice}
                  onChange={(e) => setTrustDevice(e.target.checked)}
                  className="h-4 w-4 rounded border-[#D5DEE7] text-[#005B7F] focus:ring-[#3482B5]"
                />
                Trust this device for 30 days
              </label>

              {error ? <p className="text-sm text-[var(--color-danger)]">{error}</p> : null}

              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#005B7F] py-3.5 text-sm font-semibold text-white transition hover:bg-[#004A68] active:scale-[0.99]"
              >
                Log In
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
                  <path d="M10 17l5-5-5-5v10zm-7-5c0-4.42 3.58-8 8-8h1v2h-1c-3.31 0-6 2.69-6 6s2.69 6 6 6h1v2h-1c-4.42 0-8-3.58-8-8z" />
                </svg>
              </button>
            </form>

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
                No account?{' '}
                <Link to="/register" className="font-medium text-[#3482B5] hover:underline">
                  Register
                </Link>
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
      <path fill="#EA4335" d="M12 10.2v3.6h5.1c-.2 1.2-1.5 3.6-5.1 3.6-3.1 0-5.6-2.5-5.6-5.6S8.9 6.2 12 6.2c1.8 0 3 .7 3.7 1.4l2.5-2.4C16.8 3.8 14.6 3 12 3 7 3 3 7 3 12s4 9 9 9c5.2 0 8.6-3.6 8.6-8.7 0-.6-.1-1-.2-1.5H12z" />
      <path fill="#34A853" d="M3 12c0-1.1.2-2.1.6-3.1l3.2 2.5C6.6 12.6 6.4 13.8 6.9 14.8L3.8 17C3.3 15.5 3 13.8 3 12z" opacity="0" />
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
