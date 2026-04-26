import type { PortalDashboard } from '../../portalTypes'
import { CollectorView } from './CollectorView'
import { DoctorView } from './DoctorView'
import { NurseView } from './NurseView'
import { PopulationView } from './PopulationView'

export function DashboardBody({
  dashboard,
  token,
  userTerritory,
}: {
  dashboard: PortalDashboard
  token: string
  userTerritory: string
}) {
  if (dashboard.kind === 'population') {
    return <PopulationView data={dashboard} token={token} />
  }

  if (dashboard.kind === 'doctor') {
    return <DoctorView data={dashboard} initialTerritory={userTerritory} token={token} />
  }

  if (dashboard.kind === 'nurse') {
    return <NurseView data={dashboard} token={token} />
  }

  if (dashboard.kind === 'admin') {
    return null
  }

  return <CollectorView data={dashboard} token={token} />
}
