import type { HTMLAttributes } from 'react'
import { twMerge } from 'tailwind-merge'

type Props = HTMLAttributes<HTMLDivElement>

export default function Card({ className, ...rest }: Props) {
  return <div className={twMerge('rounded-xl border border-border bg-surface shadow-card', className)} {...rest} />
}
