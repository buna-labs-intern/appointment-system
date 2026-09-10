import { NavLink, Outlet } from 'react-router'
import { Building2, LogOut } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/app/store'
import { logout } from '@/features/auth/authSlice'

export default function DashboardLayout() {
  const dispatch = useAppDispatch()
  const user = useAppSelector((state) => state.auth.user)

  return (
    <div className="flex min-h-screen">
      <aside className="sidebar-aurora fixed inset-y-0 left-0 z-30 flex w-64 flex-col">
        <div className="flex items-center gap-3 px-6 pb-6 pt-7">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-emerald-300 ring-1 ring-white/15">
            <Building2 className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">NexaCare Platform</p>
            <p className="text-xs text-emerald-100/50">Clinic administration</p>
          </div>
        </div>

        <nav className="flex-1 px-3">
          <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-100/35">
            Manage
          </p>
          <ul className="space-y-1">
            <li>
              <NavLink
                to="/tenants"
                className={({ isActive }) =>
                  `flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-white/10 text-white ring-1 ring-white/10'
                      : 'text-emerald-100/60 hover:bg-white/5 hover:text-white'
                  }`
                }
              >
                <Building2 className="h-4 w-4" aria-hidden="true" />
                Clinics
              </NavLink>
            </li>
          </ul>
        </nav>

        <div className="border-t border-white/10 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-400/15 text-sm font-semibold text-emerald-200">
              {user?.fullName?.trim().charAt(0).toUpperCase() ?? 'S'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">{user?.fullName}</p>
              <p className="truncate text-xs text-emerald-100/50">{user?.email}</p>
            </div>
            <button
              type="button"
              onClick={() => dispatch(logout())}
              className="rounded-lg p-2 text-emerald-100/60 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Log out"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </aside>

      <div className="ml-64 min-w-0 flex-1">
        <main className="mx-auto max-w-7xl px-8 py-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
