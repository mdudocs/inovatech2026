export type ThemeTone = 'teal' | 'gold' | 'coral' | 'slate'
export type UserRole = 'population' | 'doctor' | 'collector' | 'admin'
export type SourceMode = 'mock' | 'api'
export type AlertLevel = 'critical' | 'attention' | 'stable'
export type AdminSection = 'visao-geral' | 'usuarios' | 'banco'

export type RoleMeta = {
  label: string
  shortLabel: string
  credentialLabel: string
  description: string
  route: string
}

export type DemoAccount = {
  id: string
  role: UserRole
  name: string
  identifier: string
  password: string
  territory: string
}

export type SessionUser = {
  id: string
  name: string
  role: UserRole
  roleLabel: string
  territory: string
}

export type AuthSession = {
  token: string
  user: SessionUser
}

export type LoginPayload = {
  role: UserRole
  identifier: string
  password: string
  accessKey?: string
}

export type MetricCard = {
  label: string
  value: string
  detail: string
  tone: ThemeTone
}

export type AlertItem = {
  id: string
  title: string
  level: AlertLevel
  community: string
  updatedAt: string
  description: string
  action: string
  href?: string
}

export type AppointmentItem = {
  title: string
  date: string
  status: string
  note: string
}

export type SupportPoint = {
  title: string
  value: string
  note: string
}

export type PopulationDashboard = {
  kind: 'population'
  headline: string
  summary: string
  stats: MetricCard[]
  alerts: AlertItem[]
  todayActions: string[]
  warningSigns: string[]
  appointments: AppointmentItem[]
  supportPoints: SupportPoint[]
}

export type DoctorCase = {
  patient: string
  community: string
  risk: string
  status: string
  nextStep: string
}

export type DoctorDashboard = {
  kind: 'doctor'
  headline: string
  summary: string
  stats: MetricCard[]
  alerts: AlertItem[]
  cases: DoctorCase[]
  agenda: string[]
  protocols: string[]
  territoryNotes: string[]
}

export type CollectorRouteStop = {
  stop: string
  eta: string
  focus: string
  risk: string
}

export type CollectorTask = {
  community: string
  sampleType: string
  window: string
  owner: string
  status: string
}

export type SampleBatch = {
  label: string
  amount: string
  note: string
}

export type CollectorDashboard = {
  kind: 'collector'
  headline: string
  summary: string
  stats: MetricCard[]
  alerts: AlertItem[]
  checklist: string[]
  route: CollectorRouteStop[]
  tasks: CollectorTask[]
  samples: SampleBatch[]
}

export type AdminTableSummary = {
  table: string
  rows: string
  detail: string
}

export type AdminUserSummary = {
  id: string
  name: string
  role: string
  identifier: string
  territory: string
  status: string
  active: boolean
}

export type AdminOverviewDashboard = {
  headline: string
  summary: string
  stats: MetricCard[]
  alerts: AlertItem[]
  activity: string[]
  changes: DatabaseChangeItem[]
}

export type AdminUsersDashboard = {
  headline: string
  summary: string
  stats: MetricCard[]
  users: AdminUserSummary[]
}

export type CreateAdminUserPayload = {
  name: string
  role: UserRole
  identifier: string
  password: string
  territory: string
}

export type AdminDatabaseHealth = {
  label: string
  status: string
  detail: string
  tone: ThemeTone
}

export type DatabaseChangeItem = {
  id: string
  table: string
  action: 'INSERT' | 'UPDATE' | 'DELETE'
  recordId: string
  summary: string
  changedAt: string
  href?: string
}

export type AdminDatabaseDashboard = {
  headline: string
  summary: string
  stats: MetricCard[]
  alerts: AlertItem[]
  tables: AdminTableSummary[]
  health: AdminDatabaseHealth[]
  changes: DatabaseChangeItem[]
}

export type AdminDashboard = {
  kind: 'admin'
} & AdminOverviewDashboard

export type DashboardByRole = {
  population: PopulationDashboard
  doctor: DoctorDashboard
  collector: CollectorDashboard
  admin: AdminDashboard
}

export type PortalDashboard = DashboardByRole[UserRole]
