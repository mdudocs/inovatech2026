// Resumo geral da administracao com alertas, metricas e mudancas recentes.
import { BellRing, ShieldUser } from 'lucide-react'
import { RecentChangesPanel } from '../../components/admin/RecentChangesPanel'
import { AlertList } from '../../components/portal/AlertList'
import { MetricSection } from '../../components/portal/MetricSection'
import { Panel } from '../../components/portal/Panel'
import { LazyRiverMapPanel } from '../../components/LazyRiverMapPanel'
import type { AdminOverviewDashboard } from '../../portalTypes'

export function AdminOverviewSection({
  data,
  token,
}: {
  data: AdminOverviewDashboard
  token: string
}) {
  return (
    <>
      <MetricSection items={data.stats} />

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

      <LazyRiverMapPanel mode="technical" token={token} />

      <RecentChangesPanel changes={data.changes} />
    </>
  )
}
