import type { MetricCard } from '../../portalTypes'

export function MetricSection({ items }: { items: MetricCard[] }) {
  return (
    <section className="metric-grid">
      {items.map((item) => (
        <article className={`metric-card tone-${item.tone}`} key={item.label}>
          <small>{item.label}</small>
          <strong>{item.value}</strong>
          <p>{item.detail}</p>
        </article>
      ))}
    </section>
  )
}
