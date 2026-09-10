import type { ReactNode } from 'react'

type Props = {
  icon: ReactNode
  title: string
  hint?: string
  action?: ReactNode
}

export default function EmptyState({ icon, title, hint, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-canvas text-faint">
        {icon}
      </div>
      <p className="text-sm font-medium text-ink">{title}</p>
      {hint ? <p className="mt-1 max-w-sm text-[13px] text-muted">{hint}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  )
}
