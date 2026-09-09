import { Outlet } from 'react-router'

export default function AuthLayout() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 via-slate-50 to-teal-50/60 px-4 py-10">
      <div className="w-full max-w-md">
        <Outlet />
      </div>
    </div>
  )
}
