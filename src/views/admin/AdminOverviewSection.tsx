import { BellRing, ShieldUser } from 'lucide-react'
import { RecentChangesPanel } from '../../components/admin/RecentChangesPanel'
import { AlertList } from '../../components/portal/AlertList'
import { MetricSection } from '../../components/portal/MetricSection'
import { Panel } from '../../components/portal/Panel'
import type { AdminOverviewDashboard } from '../../portalTypes'

export function AdminOverviewSection({ data }: { data: AdminOverviewDashboard }) {
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

      <RecentChangesPanel changes={data.changes} />
    </>
  )
}
