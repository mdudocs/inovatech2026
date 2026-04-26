// Este arquivo concentra os contratos principais do frontend.
// A ideia e que telas, mocks e API compartilhem os mesmos formatos.
export type ThemeTone = 'teal' | 'gold' | 'coral' | 'slate'
export type UserRole = 'population' | 'nurse' | 'doctor' | 'collector' | 'admin'
export type SourceMode = 'mock' | 'api'
export type AlertLevel = 'critical' | 'attention' | 'stable'
export type AdminSection = 'visao-geral' | 'usuarios' | 'banco'

// Metadados fixos de cada perfil para labels, descricao e rota inicial.
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

// Cartao de indicador reutilizado em varios paineis internos.
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

// Caso clinico e o modelo central usado por medicina e enfermagem.
export type DoctorCase = {
  id: string
  patient: string
  community: string
  risk: string
  status: string
  nextStep: string
  priorityGroup: string
  symptoms: string
  exposureSummary: string
  clinicalNote: string
  lastAction: string
  updatedAt: string
  returnAt?: string
}

export type DoctorCaseActionPayload = {
  action: 'request_biomarker' | 'schedule_return' | 'save_conduct'
  note: string
}

export type DoctorCaseActionResult = {
  case: DoctorCase
}

export type TriageCaseActionPayload = {
  action:
    | 'classify_priority'
    | 'send_to_doctor'
    | 'request_biomarker'
    | 'schedule_return'
  note: string
  returnAt?: string
}

export type TriageCaseActionResult = {
  case: DoctorCase
}

export type CreateTriageCasePayload = {
  patient: string
  community: string
  risk: string
  priorityGroup: string
  symptoms: string
  exposureSummary: string
  note: string
}

export type NurseDashboard = {
  kind: 'nurse'
  headline: string
  summary: string
  stats: MetricCard[]
  alerts: AlertItem[]
  cases: DoctorCase[]
  triageGuides: string[]
  queueNotes: string[]
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

// Estruturas usadas pelo painel operacional do agente de campo.
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

// Mapa final de resposta por perfil para garantir tipagem de dashboard.
export type DashboardByRole = {
  population: PopulationDashboard
  nurse: NurseDashboard
  doctor: DoctorDashboard
  collector: CollectorDashboard
  admin: AdminDashboard
}

export type PortalDashboard = DashboardByRole[UserRole]
