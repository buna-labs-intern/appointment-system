import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router'
import { useMutation } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { useAppDispatch, useAppSelector } from '@/app/store'
import { setSession } from '@/features/auth/authSlice'
import { loginRequest } from '@/features/auth/authApi'
import { extractApiError } from '@/lib/api'

type LoginForm = {
  email: string
  password: string
}

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
    <div className="rounded-2xl bg-white p-8 shadow-xl shadow-slate-200">
      <div className="mb-8">
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#0F5C66] text-white">
          <svg viewBox="0 0 24 24" className="h-6 w-6 fill-white" aria-hidden="true">
            <path d="M12 2l7 3v6c0 5-3.5 9.5-7 11-3.5-1.5-7-6-7-11V5l7-3zm0 5v4h-2v2h2v2h2v-2h2v-2h-2V7h-2z" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-slate-900">Platform Admin</h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage clinics, owners and bans for the whole NexaCare platform.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={form.email}
            onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#0F5C66] focus:ring-2 focus:ring-[#0F5C66]/20"
            placeholder="super@nexacare.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-700">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            autoComplete="current-password"
            value={form.password}
            onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#0F5C66] focus:ring-2 focus:ring-[#0F5C66]/20"
            placeholder="••••••••"
          />
        </div>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        {isAxiosError(mutation.error) && !error ? (
          <p className="text-sm text-red-600">Unable to sign in.</p>
        ) : null}

        <button
          type="submit"
          disabled={mutation.isPending}
          className="w-full rounded-lg bg-[#0F5C66] py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#0C4B53] disabled:opacity-60"
        >
          {mutation.isPending ? 'Signing in...' : 'Sign in'}
        </button>
      </form>

      <p className="mt-6 text-center text-xs text-slate-400">Authorized personnel only</p>
    </div>
  )
}
