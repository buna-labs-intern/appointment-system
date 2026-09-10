import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router'
import { useMutation } from '@tanstack/react-query'
import { Building2 } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/app/store'
import { setSession } from '@/features/auth/authSlice'
import { loginRequest } from '@/features/auth/authApi'
import { extractApiError } from '@/lib/api'

type LoginForm = {
  email: string
  password: string
}

const inputClass =
  'h-11 w-full rounded-lg border border-white/15 bg-white/8 px-3 text-sm text-white placeholder:text-emerald-100/35 transition-[border-color,box-shadow] focus:border-emerald-400/60 focus:bg-white/12 focus:ring-4 focus:ring-emerald-400/15 focus:outline-none'

export default function LoginPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const isAuthenticated = useAppSelector((state) => Boolean(state.auth.user && state.auth.token))
  const [form, setForm] = useState<LoginForm>({ email: '', password: '' })
  const [error, setError] = useState('')

  const mutation = useMutation({
    mutationFn: loginRequest,
    onSuccess: (session) => {
      dispatch(setSession({ user: session.user, token: session.token }))
      const redirectTo = (location.state as { from?: string } | null)?.from ?? '/tenants'
      navigate(redirectTo, { replace: true })
    },
    onError: (err: unknown) => {
      setError(extractApiError(err) || 'Invalid email or password')
    },
  })

  if (isAuthenticated) {
    return <Navigate to="/tenants" replace />
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    mutation.mutate({ email: form.email.trim(), password: form.password })
  }

  return (
    <div className="animate-rise w-full max-w-md rounded-2xl border border-white/12 bg-white/8 p-8 shadow-modal backdrop-blur-xl">
      <div className="mb-8">
        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-b from-emerald-400 to-emerald-600 text-white shadow-lg shadow-emerald-900/40">
          <Building2 className="h-6 w-6" aria-hidden="true" />
        </div>
        <h1 className="text-xl font-semibold text-white">Platform Admin</h1>
        <p className="mt-1 text-sm text-emerald-100/55">
          Manage clinics, owners and bans for the whole platform.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="mb-1.5 block text-[13px] font-medium text-emerald-50">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={form.email}
            onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
            className={inputClass}
            placeholder="super@nexacare.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="mb-1.5 block text-[13px] font-medium text-emerald-50">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            autoComplete="current-password"
            value={form.password}
            onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
            className={inputClass}
            placeholder="••••••••"
          />
        </div>

        {error ? (
          <p className="rounded-lg border border-red-400/25 bg-red-500/15 px-3 py-2 text-[13px] text-red-200">
            {error}
          </p>
        ) : null}
        {mutation.isError && !error ? (
          <p className="rounded-lg border border-red-400/25 bg-red-500/15 px-3 py-2 text-[13px] text-red-200">
            Unable to sign in.
          </p>
        ) : null}

        <button
          type="submit"
          disabled={mutation.isPending}
          className="accent-button h-11 w-full rounded-lg text-sm font-semibold text-white disabled:opacity-60"
        >
          {mutation.isPending ? 'Signing in...' : 'Sign in'}
        </button>
      </form>

      <p className="mt-6 text-center text-xs tracking-wide text-emerald-100/35">
        Authorized personnel only
      </p>
    </div>
  )
}
