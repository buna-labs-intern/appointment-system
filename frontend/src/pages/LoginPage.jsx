import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import useAuth from '../hooks/useAuth'
import { ROLES } from '../utils/constants'

export default function LoginPage() {
  const { isAuthenticated, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState(ROLES.RECEPTIONIST)
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
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg)] px-4">
      <div className="w-full max-w-md rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-[var(--color-text)]">Sign in</h1>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          NexaCare Appointment System
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-[var(--color-border)] px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
              placeholder="you@nexacare.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-[var(--color-border)] px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
              placeholder="Enter password"
            />
          </div>

          <div>
            <label htmlFor="role" className="mb-1 block text-sm font-medium">
              Role (temporary)
            </label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full rounded-md border border-[var(--color-border)] px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
            >
              <option value={ROLES.RECEPTIONIST}>Receptionist</option>
              <option value={ROLES.ADMIN}>Administrator</option>
            </select>
          </div>

          {error ? <p className="text-sm text-[var(--color-danger)]">{error}</p> : null}

          <button
            type="submit"
            className="w-full rounded-md bg-[var(--color-accent)] px-3 py-2.5 text-sm font-medium text-white transition hover:bg-[var(--color-sidebar-hover)]"
          >
            Sign in
          </button>
        </form>
      </div>
    </div>
  )
}
