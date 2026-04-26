// Secao reutilizavel de indicadores numericos dos paineis internos.
import type { MetricCard } from '../../portalTypes'

export function MetricSection({ items }: { items: MetricCard[] }) {
  return (
    <section className="metric-grid">
      {items.map((item) => (
        <article className={`metric-card tone-${item.tone}`} key={item.label}>
          <div className="metric-card-top">
            <span className="metric-dot" aria-hidden="true" />
            <small>{item.label}</small>
          </div>
          <strong>{item.value}</strong>
          <p>{item.detail}</p>
        </article>
      ))}
    </section>
  )
}
