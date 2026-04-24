import { AlertTriangle, BadgeCheck, Stethoscope, Users } from 'lucide-react'
import type { PopulationDashboard } from '../../portalTypes'
import { AlertList } from '../../components/portal/AlertList'
import { Panel } from '../../components/portal/Panel'

export function PopulationView({ data }: { data: PopulationDashboard }) {
  return (
    <>
      <section className="dashboard-grid">
        <Panel title="Avisos da comunidade" icon={<AlertTriangle size={18} />}>
          <AlertList alerts={data.alerts} />
        </Panel>
        <Panel title="Acoes do dia" icon={<Users size={18} />}>
          <ul className="clean-list">
            {data.todayActions.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </Panel>
      </section>

      <section className="dashboard-grid">
        <Panel title="Sinais observados" icon={<Stethoscope size={18} />}>
          <ul className="clean-list">
            {data.warningSigns.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </Panel>
        <Panel title="Atendimentos marcados" icon={<BadgeCheck size={18} />}>
          <div className="stack-list">
            {data.appointments.map((item) => (
              <article className="list-card" key={`${item.title}-${item.date}`}>
                <strong>{item.title}</strong>
                <p>{item.note}</p>
                <small>
                  {item.date} | {item.status}
                </small>
              </article>
            ))}
          </div>
        </Panel>
      </section>

      <Panel title="Registros da comunidade" icon={<BadgeCheck size={18} />}>
        <div className="support-grid">
          {data.supportPoints.map((item) => (
            <article className="list-card" key={item.title}>
              <strong>{item.title}</strong>
              <p>{item.note}</p>
              <small>{item.value}</small>
            </article>
          ))}
        </div>
      </Panel>
    </>
  )
}
