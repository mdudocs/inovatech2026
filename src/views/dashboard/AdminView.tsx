import { BellRing, Database, ShieldUser, Users } from 'lucide-react'
import type { AdminDashboard } from '../../portalTypes'
import { AlertList } from '../../components/portal/AlertList'
import { Panel } from '../../components/portal/Panel'

export function AdminView({ data }: { data: AdminDashboard }) {
  return (
    <>
      <section className="dashboard-grid">
        <Panel title="Alertas do sistema" icon={<BellRing size={18} />}>
          <AlertList alerts={data.alerts} />
        </Panel>
        <Panel title="Atividade administrativa" icon={<ShieldUser size={18} />}>
          <ul className="clean-list">
            {data.activity.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
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

      <Panel title="Usuarios do sistema" icon={<Users size={18} />}>
        <div className="case-table">
          {data.users.map((item) => (
            <article className="case-row" key={`${item.identifier}-${item.role}`}>
              <div>
                <strong>{item.name}</strong>
                <small>{item.identifier}</small>
              </div>
              <div>
                <strong>{item.role}</strong>
                <small>Perfil</small>
              </div>
              <div>
                <strong>{item.territory}</strong>
                <small>Territorio</small>
              </div>
              <div>
                <strong>{item.status}</strong>
                <small>Status</small>
              </div>
            </article>
          ))}
        </div>
      </Panel>
    </>
  )
}
