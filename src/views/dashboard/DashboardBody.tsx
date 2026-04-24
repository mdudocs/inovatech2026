import { AdminView } from './AdminView'
import type { PortalDashboard } from '../../portalTypes'
import { CollectorView } from './CollectorView'
import { DoctorView } from './DoctorView'
import { PopulationView } from './PopulationView'

export function DashboardBody({ dashboard }: { dashboard: PortalDashboard }) {
  if (dashboard.kind === 'population') {
    return <PopulationView data={dashboard} />
  }

  if (dashboard.kind === 'doctor') {
    return <DoctorView data={dashboard} />
  }

  if (dashboard.kind === 'admin') {
    return <AdminView data={dashboard} />
  }

  return <CollectorView data={dashboard} />
}
