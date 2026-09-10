import { Link } from 'react-router'
import { Compass } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-canvas px-4 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-soft text-accent">
        <Compass className="h-7 w-7" aria-hidden="true" />
      </div>
      <div>
        <p className="tabular font-mono text-4xl font-medium text-ink">404</p>
        <p className="mt-2 text-sm text-muted">This page does not exist.</p>
      </div>
      <Link to="/tenants" className="text-sm font-medium text-accent-hover hover:underline">
        Go to clinics
      </Link>
    </div>
  )
}
