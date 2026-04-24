import type { AlertItem } from '../../portalTypes'

export function AlertList({ alerts }: { alerts: AlertItem[] }) {
  return (
    <div className="stack-list">
      {alerts.map((alert) => (
        <article className={`alert-card alert-${alert.level}`} key={alert.id}>
          <div className="alert-head">
            <strong>{alert.title}</strong>
            <span>{alert.updatedAt}</span>
          </div>
          <p>{alert.description}</p>
          <small>
            {alert.community} | {alert.action}
          </small>
        </article>
      ))}
    </div>
  )
}
