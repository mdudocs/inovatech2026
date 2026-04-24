import { AlertTriangle, ClipboardList, Route as RouteIcon, TestTubeDiagonal, Waves } from 'lucide-react'
import type { CollectorDashboard } from '../../portalTypes'
import { AlertList } from '../../components/portal/AlertList'
import { Panel } from '../../components/portal/Panel'

export function CollectorView({ data }: { data: CollectorDashboard }) {
  return (
    <>
      <section className="dashboard-grid">
        <Panel title="Alertas da rota" icon={<AlertTriangle size={18} />}>
          <AlertList alerts={data.alerts} />
        </Panel>
        <Panel title="Checklist antes de sair" icon={<ClipboardList size={18} />}>
          <ul className="clean-list">
            {data.checklist.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </Panel>
      </section>

      <section className="dashboard-grid">
        <Panel title="Rota do dia" icon={<RouteIcon size={18} />}>
          <div className="timeline-list">
            {data.route.map((item) => (
              <article className="timeline-item" key={`${item.stop}-${item.eta}`}>
                <span className="timeline-time">{item.eta}</span>
                <div>
                  <strong>{item.stop}</strong>
                  <p>{item.focus}</p>
                  <small>{item.risk}</small>
                </div>
              </article>
            ))}
          </div>
        </Panel>
        <Panel title="Coletas prioritarias" icon={<TestTubeDiagonal size={18} />}>
          <div className="stack-list">
            {data.tasks.map((item) => (
              <article className="list-card" key={`${item.community}-${item.sampleType}`}>
                <strong>{item.community}</strong>
                <p>{item.sampleType}</p>
                <small>
                  {item.window} | {item.owner} | {item.status}
                </small>
              </article>
            ))}
          </div>
        </Panel>
      </section>

      <Panel title="Lotes de amostras" icon={<Waves size={18} />}>
        <div className="support-grid">
          {data.samples.map((item) => (
            <article className="list-card" key={item.label}>
              <strong>{item.label}</strong>
              <p>{item.note}</p>
              <small>{item.amount}</small>
            </article>
          ))}
        </div>
      </Panel>
    </>
  )
}
