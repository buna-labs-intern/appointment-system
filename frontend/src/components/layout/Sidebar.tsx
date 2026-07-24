import { NavLink } from 'react-router'
import {
  CalendarDays,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Stethoscope,
  UserCog,
  Users,
} from 'lucide-react'
import useAuth from '@/hooks/useAuth'
import { NAV_ITEMS, ROLES } from '@/utils/constants'

const ICONS = {
  LayoutDashboard,
  CalendarDays,
  Users,
  Stethoscope,
  ClipboardList,
  UserCog,
}

type SidebarProps = {
  open: boolean
  onClose?: () => void
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const { user, logout } = useAuth()

  const handleLogout = () => {
    onClose?.()
    logout()
  }

  const items =
    user?.role === ROLES.ADMIN
      ? NAV_ITEMS
      : NAV_ITEMS.filter((item) => item.path !== '/users')

  return (
    <>
      <div
        className={`fixed inset-0 z-30 bg-black/40 transition-opacity lg:hidden ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
        aria-hidden={!open}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-[var(--color-sidebar)] text-white transition-transform duration-200 lg:static lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="border-b border-white/10 px-5 py-5">
          <p className="text-xs uppercase tracking-[0.2em] text-teal-100/80">NexaCare</p>
          <h1 className="mt-1 text-lg font-semibold">Appointment System</h1>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {items.map((item) => {
            const Icon = ICONS[item.icon as keyof typeof ICONS]

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors ${
                    isActive
                      ? 'bg-[var(--color-accent)] text-white'
                      : 'text-teal-50/90 hover:bg-[var(--color-sidebar-hover)]'
                  }`
                }
              >
                {Icon ? <Icon className="h-4 w-4 shrink-0" aria-hidden="true" /> : null}
                <span>{item.label}</span>
              </NavLink>
            )
          })}
        </nav>

        <div className="mt-auto border-t border-white/10 px-3 py-4">
          <p className="mb-3 px-2 text-xs text-teal-100/70">
            Signed in as {user?.fullName || user?.email || 'User'}
          </p>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm text-teal-50/90 transition-colors hover:bg-[var(--color-sidebar-hover)]"
          >
            <LogOut className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  )
}
