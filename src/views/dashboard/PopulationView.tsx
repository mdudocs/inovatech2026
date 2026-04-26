import { AlertTriangle, BadgeCheck, Stethoscope, Users } from 'lucide-react'
import type { PopulationDashboard } from '../../portalTypes'
import { AlertList } from '../../components/portal/AlertList'
import { Panel } from '../../components/portal/Panel'
import { LazyRiverMapPanel } from '../../components/LazyRiverMapPanel'

export function PopulationView({
  data,
  token,
}: {
  data: PopulationDashboard
  token: string
}) {
  return (
    <>
      <section className="dashboard-grid">
        <Panel title="Avisos da comunidade" icon={<AlertTriangle size={18} />}>
          <AlertList
            alerts={data.alerts}
            emptyMessage="Nenhum aviso registrado para a comunidade ainda."
          />
        </Panel>
        <Panel title="Acoes do dia" icon={<Users size={18} />}>
          {data.todayActions.length > 0 ? (
            <ul className="clean-list">
              {data.todayActions.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : (
            <p className="section-text">Nenhuma acao pendente para hoje.</p>
          )}
        </Panel>
      </section>

      <LazyRiverMapPanel mode="community" token={token} />

      <section className="dashboard-grid">
        <Panel title="Sinais observados" icon={<Stethoscope size={18} />}>
          {data.warningSigns.length > 0 ? (
            <ul className="clean-list">
              {data.warningSigns.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : (
            <p className="section-text">Nenhum sinal registrado pela familia.</p>
          )}
        </Panel>
        <Panel title="Atendimentos marcados" icon={<BadgeCheck size={18} />}>
          {data.appointments.length > 0 ? (
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
          ) : (
            <p className="section-text">Nenhum atendimento marcado.</p>
          )}
        </Panel>
      </section>

      <Panel title="Registros da comunidade" icon={<BadgeCheck size={18} />}>
        {data.supportPoints.length > 0 ? (
          <div className="support-grid">
            {data.supportPoints.map((item) => (
              <article className="list-card" key={item.title}>
                <strong>{item.title}</strong>
                <p>{item.note}</p>
                <small>{item.value}</small>
              </article>
            ))}
          </div>
        ) : (
          <p className="section-text">Nenhum registro comunitario enviado ainda.</p>
        )}
      </Panel>
    </>
  )
}
