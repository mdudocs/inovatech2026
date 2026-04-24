import {
  AlertTriangle,
  BellRing,
  Route as RouteIcon,
  ShieldCheck,
  Stethoscope,
} from 'lucide-react'
import type { DoctorDashboard } from '../../portalTypes'
import { AlertList } from '../../components/portal/AlertList'
import { Panel } from '../../components/portal/Panel'

export function DoctorView({ data }: { data: DoctorDashboard }) {
  return (
    <>
      <section className="dashboard-grid">
        <Panel title="Alertas do territorio" icon={<AlertTriangle size={18} />}>
          <AlertList alerts={data.alerts} />
        </Panel>
        <Panel title="Conduta rapida" icon={<ShieldCheck size={18} />}>
          <ul className="clean-list">
            {data.protocols.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </Panel>
      </section>

      <Panel title="Casos para ver hoje" icon={<Stethoscope size={18} />}>
        <div className="case-table">
          {data.cases.map((item) => (
            <article className="case-row" key={`${item.patient}-${item.community}`}>
              <div>
                <strong>{item.patient}</strong>
                <small>{item.community}</small>
              </div>
              <div>
                <strong>{item.risk}</strong>
                <small>Risco</small>
              </div>
              <div>
                <strong>{item.status}</strong>
                <small>Status</small>
              </div>
              <div>
                <strong>{item.nextStep}</strong>
                <small>Proximo passo</small>
              </div>
            </article>
          ))}
        </div>
      </Panel>

      <section className="dashboard-grid">
        <Panel title="Agenda da equipe" icon={<RouteIcon size={18} />}>
          <ul className="clean-list">
            {data.agenda.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </Panel>
        <Panel title="Recados do territorio" icon={<BellRing size={18} />}>
          <ul className="clean-list">
            {data.territoryNotes.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </Panel>
      </section>
    </>
  )
}
