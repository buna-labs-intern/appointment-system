import Button from './Button'

type Props = {
  page: number
  totalPages: number
  total: number
  onChange: (page: number) => void
}

export default function Pagination({ page, totalPages, total, onChange }: Props) {
  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-between text-sm">
      <p className="text-[13px] text-muted">
        Page <span className="tabular font-mono">{page}</span> of{' '}
        <span className="tabular font-mono">{totalPages}</span>
        <span className="text-faint"> · {total} clinics</span>
      </p>
      <div className="flex gap-2">
        <Button variant="soft" size="sm" disabled={page <= 1} onClick={() => onChange(page - 1)}>
          Previous
        </Button>
        <Button
          variant="soft"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onChange(page + 1)}
        >
          Next
        </Button>
      </div>
      <p className="w-px" aria-hidden="true">
        {total}
      </p>
    </div>
  )
}
