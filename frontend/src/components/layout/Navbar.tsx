import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { Bell, Menu, Search, Settings, User } from 'lucide-react'
import useAuth from '@/hooks/useAuth'
import { getInitials } from '@/features/dashboard/mockData'
import {
  getUnreadCount,
  subscribeNotifications,
} from '@/features/notifications/notificationsStore'
type NavbarProps = {
  onMenuClick?: () => void
}

type SearchTarget = 'patients' | 'doctors' | 'appointments'

const SEARCH_TARGETS: Record<
  SearchTarget,
  { path: string; label: string; placeholder: string }
> = {
  patients: {
    path: '/patients',
    label: 'Patients',
    placeholder: 'Search by name, phone, or address...',
  },
  doctors: {
    path: '/doctors',
    label: 'Doctors',
    placeholder: 'Search by name, specialty, or phone...',
  },
  appointments: {
    path: '/appointments',
    label: 'Appointments',
    placeholder: 'Search patient, doctor, service, or status...',
  },
}

function targetFromPath(pathname: string): SearchTarget {
  if (pathname.startsWith('/doctors')) return 'doctors'
  if (pathname.startsWith('/appointments')) return 'appointments'
  return 'patients'
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const displayName = user?.fullName || user?.email || 'User'
  const initials = getInitials(displayName)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [unreadCount, setUnreadCount] = useState(getUnreadCount)
  const [target, setTarget] = useState<SearchTarget>(() => targetFromPath(location.pathname))
  const settingsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setTarget(targetFromPath(location.pathname))
  }, [location.pathname])

  useEffect(() => {
    const unsubscribe = subscribeNotifications(() => setUnreadCount(getUnreadCount()))
    return () => {
      unsubscribe()
    }
  }, [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        settingsRef.current &&
        !settingsRef.current.contains(event.target as Node)
      ) {
        setSettingsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleSearchSubmit(event: React.FormEvent) {
    event.preventDefault()
    const q = search.trim()
    if (!q) return
    navigate(`${SEARCH_TARGETS[target].path}?q=${encodeURIComponent(q)}`)
  }

  return (
    <header className="flex h-16 items-center gap-3 border-b border-border bg-white px-4 lg:px-6">
      <button
        type="button"
        onClick={onMenuClick}
        className="rounded-md border border-border p-2 text-foreground lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-4 w-4" />
      </button>

      <div className="mx-auto flex w-full max-w-2xl items-center">
        <form onSubmit={handleSearchSubmit} className="flex w-full items-center gap-2">
          <select
            value={target}
            onChange={(e) => setTarget(e.target.value as SearchTarget)}
            className="h-10 shrink-0 rounded-full border border-border bg-muted/40 px-3 text-sm outline-none transition focus:border-[#0F5C66] focus:ring-2 focus:ring-[#0F5C66]/20"
            aria-label="Search in"
          >
            <option value="patients">{SEARCH_TARGETS.patients.label}</option>
            <option value="doctors">{SEARCH_TARGETS.doctors.label}</option>
            <option value="appointments">{SEARCH_TARGETS.appointments.label}</option>
          </select>

          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={SEARCH_TARGETS[target].placeholder}
              className="h-10 w-full rounded-full border border-border bg-muted/40 pl-10 pr-4 text-sm outline-none transition focus:border-[#0F5C66] focus:ring-2 focus:ring-[#0F5C66]/20"
            />
          </div>
        </form>
      </div>

      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <Link
          to="/notifications"
          className="relative rounded-full p-2 text-muted-foreground hover:bg-muted"
          aria-label={
            unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications'
          }
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 ? (
            <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-semibold text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          ) : null}
        </Link>

        <div className="relative" ref={settingsRef}>
          <button
            type="button"
            onClick={() => setSettingsOpen((open) => !open)}
            className="rounded-full p-2 text-muted-foreground hover:bg-muted"
            aria-label="Settings"
            aria-expanded={settingsOpen}
          >
            <Settings className="h-4 w-4" />
          </button>

          {settingsOpen ? (
            <div className="absolute right-0 z-50 mt-2 w-48 rounded-xl border border-border bg-white p-1 shadow-lg">
              <Link
                to="/profile"
                onClick={() => setSettingsOpen(false)}
                className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-foreground hover:bg-muted"
              >
                <User className="h-4 w-4 text-[#0F5C66]" />
                Profile
              </Link>
            </div>
          ) : null}
        </div>

        <div className="flex items-center gap-2 border-l border-border pl-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0F5C66] text-xs font-semibold text-white">
            {initials || 'NC'}
          </div>
          <div className="hidden text-left sm:block">
            <p className="text-sm font-medium leading-none text-foreground">{displayName}</p>
            <p className="mt-1 text-[11px] uppercase tracking-wide text-muted-foreground">
              {user?.role || '—'}
            </p>
          </div>
        </div>
      </div>
    </header>
  )
}
