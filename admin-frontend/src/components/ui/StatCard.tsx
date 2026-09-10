import type { ReactNode } from 'react'
import Card from './Card'

type Props = {
  label: string
  value: number | string
  icon: ReactNode
}

export default function StatCard({ label, value, icon }: Props) {
  return (
    <Card className="stat-glow animate-rise p-5">
      <div className="flex items-center justify-between">
        <p className="text-[13px] font-medium text-muted">{label}</p>
        <span className="text-accent/70">{icon}</span>
      </div>
      <p className="tabular mt-2 font-mono text-3xl font-medium text-ink">{value}</p>
    </Card>
  )
}
