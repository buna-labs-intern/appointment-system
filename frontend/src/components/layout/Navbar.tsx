import useAuth from '@/hooks/useAuth'

type NavbarProps = {
  onMenuClick?: () => void
  title: string
}

export default function Navbar({ onMenuClick, title }: NavbarProps) {
  const { user } = useAuth()

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-card px-4 lg:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="rounded-md border border-border px-3 py-2 text-sm text-foreground lg:hidden"
          aria-label="Open menu"
        >
          Menu
        </button>
        <div>
          <h2 className="text-base font-semibold text-foreground">{title}</h2>
          <p className="hidden text-xs text-muted-foreground sm:block">
            Manage NexaCare operations
          </p>
        </div>
      </div>

      <div className="text-right">
        <p className="text-sm font-medium text-foreground">{user?.fullName || 'User'}</p>
        <p className="text-xs uppercase tracking-wide text-muted-foreground">
          {user?.role || '—'}
        </p>
      </div>
    </header>
  )
}
