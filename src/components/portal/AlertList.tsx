// Lista padronizada de alertas usada pelos diferentes perfis do portal.
import { Link } from 'react-router-dom'
import type { AlertItem } from '../../portalTypes'

const statusByLevel = {
  stable: { label: 'Online', className: 'alert-status-online' },
  attention: { label: 'Atencao', className: 'alert-status-attention' },
  critical: { label: 'Offline', className: 'alert-status-offline' },
}

export function AlertList({
  alerts,
  emptyMessage = 'Nenhum alerta registrado no momento.',
}: {
  alerts: AlertItem[]
  emptyMessage?: string
}) {
  if (alerts.length === 0) {
    return <p className="section-text">{emptyMessage}</p>
  }

  return (
    <div className="stack-list">
      {alerts.map((alert) => {
        const status = statusByLevel[alert.level]
        const content = (
          <>
            <div className="alert-head">
              <div className="alert-title-block">
                <strong>{alert.title}</strong>
                <span className={`alert-status ${status.className}`}>
                  <span className="status-led" aria-hidden="true" />
                  {status.label}
                </span>
              </div>
              <span>{alert.updatedAt}</span>
            </div>
            <p>{alert.description}</p>
            <div className="alert-meta">
              <div className="alert-meta-item">
                <small>Origem</small>
                <strong>{alert.community}</strong>
              </div>
              <div className="alert-meta-item">
                <small>Acao</small>
                <strong>{alert.action}</strong>
              </div>
            </div>
          </>
        )

        if (alert.href) {
          return (
            <Link
              className={`alert-card alert-${alert.level} alert-card-link`}
              key={alert.id}
              to={alert.href}
            >
              {content}
            </Link>
          )
        }

        return (
          <article className={`alert-card alert-${alert.level}`} key={alert.id}>
            {content}
          </article>
        )
      })}
    </div>
  )
}
