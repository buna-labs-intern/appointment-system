import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Loader2 } from 'lucide-react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

type Variant = 'primary' | 'danger' | 'danger-soft' | 'soft' | 'ghost' | 'outline'
type Size = 'sm' | 'md'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  size?: Size
  loading?: boolean
  children: ReactNode
}

const base =
  'inline-flex items-center justify-center gap-1.5 rounded-lg font-medium whitespace-nowrap transition-colors disabled:pointer-events-none disabled:opacity-50'

const variants: Record<Variant, string> = {
  primary: 'accent-button text-white shadow-sm',
  danger: 'danger-button text-white shadow-sm',
  'danger-soft':
    'border border-red-200 bg-white text-red-600 hover:bg-red-50 hover:border-red-300',
  soft: 'border border-border bg-white text-ink hover:bg-canvas hover:border-border-strong',
  ghost: 'text-muted hover:bg-canvas hover:text-ink',
  outline: 'border border-accent/30 bg-accent-soft text-accent-hover hover:bg-accent-soft/70',
}

const sizes: Record<Size, string> = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-10 px-4 text-sm',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  className,
  disabled,
  children,
  ...rest
}: Props) {
  return (
    <button
      className={twMerge(clsx(base, variants[variant], sizes[size]), className)}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
      {children}
    </button>
  )
}
