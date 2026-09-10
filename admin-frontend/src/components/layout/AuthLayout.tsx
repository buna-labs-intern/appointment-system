import { Outlet } from 'react-router'

export default function AuthLayout() {
  return (
    <div className="sidebar-aurora flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <Outlet />
      </div>
    </div>
  )
}
