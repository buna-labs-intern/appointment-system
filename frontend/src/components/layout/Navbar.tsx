import useAuth from '../../hooks/useAuth'

export default function Navbar({ onMenuClick, title }) {
  const { user } = useAuth()

  return (
    <header className="flex h-16 items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface)] px-4 lg:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="rounded-md border border-[var(--color-border)] px-3 py-2 text-sm text-[var(--color-text)] lg:hidden"
          aria-label="Open menu"
        >
          Menu
        </button>
        <div>
          <h2 className="text-base font-semibold text-[var(--color-text)]">{title}</h2>
          <p className="hidden text-xs text-[var(--color-muted)] sm:block">
            Manage NexaCare operations
          </p>
        </div>
      </div>

      <div className="text-right">
        <p className="text-sm font-medium text-[var(--color-text)]">
          {user?.fullName || 'User'}
        </p>
        <p className="text-xs uppercase tracking-wide text-[var(--color-muted)]">
          {user?.role || '—'}
        </p>
      </div>
    </header>
  )
}
