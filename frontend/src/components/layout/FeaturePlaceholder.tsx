type PlaceholderProps = {
  title: string
  description: string
}

export default function FeaturePlaceholder({ title, description }: PlaceholderProps) {
  return (
    <section className="rounded-xl border border-border bg-card p-6 text-card-foreground shadow-sm">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    </section>
  )
}
