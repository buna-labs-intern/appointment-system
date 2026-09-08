import { NavLink } from 'react-router'
import {
  BarChart3,
  CalendarClock,
  CalendarDays,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Stethoscope,
  UserCog,
  UserRound,
  Users,
} from 'lucide-react'
import useAuth from '@/hooks/useAuth'
import { NAV_ITEMS } from '@/utils/constants'
import { canAccessPath } from '@/utils/permissions'

const ICONS = {
  LayoutDashboard,
  CalendarClock,
  CalendarDays,
  Users,
  Stethoscope,
  ClipboardList,
  BarChart3,
  UserCog,
  UserRound,
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

  const items = NAV_ITEMS.filter((item) => canAccessPath(item.path, user?.role))

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
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-border bg-white transition-transform duration-200 lg:static lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center gap-3 border-b border-border px-5 py-5">
          <img
            src="/nexacare-logo.png"
            alt="NexaCare Logo"
            className="h-10 w-10 rounded-lg object-contain bg-white border border-border/60 p-0.5 shadow-sm"
          />
          <div>
            <p className="text-sm font-semibold text-foreground">NexaCare</p>
            <p className="text-xs text-muted-foreground">Clinic Operations</p>
          </div>
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
                  `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-[#0F5C66] text-white'
                      : 'text-foreground/80 hover:bg-muted'
                  }`
                }
              >
                {Icon ? <Icon className="h-4 w-4 shrink-0" aria-hidden="true" /> : null}
                <span>{item.label}</span>
              </NavLink>
            )
          })}
        </nav>

        <div className="mt-auto border-t border-border px-3 py-4">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground/80 transition-colors hover:bg-muted"
          >
            <LogOut className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  )
}
