type LoadingStateProps = {
  label?: string
  className?: string
}

export default function LoadingState({
  label = 'Loading...',
  className = '',
}: LoadingStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 py-12 ${className}`}>
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#0F5C66] border-t-transparent" />
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  )
}
