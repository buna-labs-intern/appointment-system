import { Link } from 'react-router'

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-slate-50">
      <p className="text-5xl font-bold text-slate-300">404</p>
      <p className="text-sm text-slate-500">This page does not exist.</p>
      <Link to="/tenants" className="text-sm font-medium text-[#0F5C66] hover:underline">
        Go to clinics
      </Link>
    </div>
  )
}
