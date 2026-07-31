import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { Bell, Menu, Search, Settings, User } from 'lucide-react'
import useAuth from '@/hooks/useAuth'
import { getInitials } from '@/features/dashboard/mockData'

type NavbarProps = {
  onMenuClick?: () => void
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  const { user } = useAuth()
  const displayName = user?.fullName || user?.email || 'User'
  const initials = getInitials(displayName)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const settingsRef = useRef<HTMLDivElement>(null)

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

      <div className="mx-auto flex w-full max-w-xl items-center">
        <div className="relative w-full">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search patients, doctors..."
            className="h-10 w-full rounded-full border border-border bg-muted/40 pl-10 pr-4 text-sm outline-none transition focus:border-[#0F5C66] focus:ring-2 focus:ring-[#0F5C66]/20"
          />
        </div>
      </div>

      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <button
          type="button"
          className="rounded-full p-2 text-muted-foreground hover:bg-muted"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
        </button>

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