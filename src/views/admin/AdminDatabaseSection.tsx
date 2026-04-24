import { BellRing, Database } from 'lucide-react'
import { RecentChangesPanel } from '../../components/admin/RecentChangesPanel'
import { AlertList } from '../../components/portal/AlertList'
import { MetricSection } from '../../components/portal/MetricSection'
import { Panel } from '../../components/portal/Panel'
import type { AdminDatabaseDashboard } from '../../portalTypes'

function getHealthStatusClass(status: string) {
  const normalizedStatus = status.trim().toLowerCase()

  if (normalizedStatus === 'online') {
    return 'alert-status-online'
  }

  if (normalizedStatus === 'offline') {
    return 'alert-status-offline'
  }

  return 'alert-status-attention'
}

export function AdminDatabaseSection({ data }: { data: AdminDatabaseDashboard }) {
  return (
    <>
      <MetricSection items={data.stats} />

      <section className="dashboard-grid">
        <Panel title="Saude da integracao" icon={<BellRing size={18} />}>
          <AlertList alerts={data.alerts} />
        </Panel>
        <Panel title="Estado dos servicos" icon={<Database size={18} />}>
          <div className="admin-service-grid">
            {data.health.map((item) => (
              <article className={`admin-service-card tone-${item.tone}`} key={item.label}>
                <div className="admin-service-head">
                  <small>{item.label}</small>
                  <span className={`alert-status ${getHealthStatusClass(item.status)}`}>
                    <span className="status-led" aria-hidden="true" />
                    {item.status}
                  </span>
                </div>
                <p>{item.detail}</p>
              </article>
            ))}
          </div>
        </Panel>
      </section>

      <Panel title="Tabelas do banco" icon={<Database size={18} />}>
        <div className="support-grid">
          {data.tables.map((item) => (
            <article className="list-card" key={item.table}>
              <strong>{item.table}</strong>
              <p>{item.detail}</p>
              <small>{item.rows} registros</small>
            </article>
          ))}
        </div>
      </Panel>

      <RecentChangesPanel changes={data.changes} />
    </>
  )
}
