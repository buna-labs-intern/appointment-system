import type { ReactNode } from 'react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

type Tone = 'success' | 'danger' | 'neutral'

type Props = {
  tone: Tone
  pulse?: boolean
  children: ReactNode
}

const tones: Record<Tone, { bg: string; dot: string; text: string }> = {
  success: { bg: 'bg-accent-soft', dot: 'bg-accent', text: 'text-accent-hover' },
  danger: { bg: 'bg-danger-soft', dot: 'bg-danger', text: 'text-danger' },
  neutral: { bg: 'bg-canvas', dot: 'bg-faint', text: 'text-muted' },
}

export default function StatusBadge({ tone, pulse = false, children }: Props) {
  const t = tones[tone]
  return (
    <span
      className={twMerge(
        clsx(
          'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
          t.bg,
          t.text,
        ),
      )}
    >
      <span className={clsx('h-1.5 w-1.5 rounded-full', t.dot, pulse && 'animate-dot-ban')} />
      {children}
    </span>
  )
}
