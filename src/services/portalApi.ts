// Camada unica de requests do frontend.
// Centraliza base URL, timeout, erros e contratos de acesso a API.
import {
  dashboardMocks,
  demoAccounts,
  mockAdminChanges,
  mockAdminHealth,
  mockAdminTables,
  mockAdminUsers,
  roleMeta,
} from '../mockPortalData'
import type {
  AdminDatabaseDashboard,
  AdminOverviewDashboard,
  AdminUsersDashboard,
  AuthSession,
  CreateAdminUserPayload,
  CreateTriageCasePayload,
  DoctorCaseActionPayload,
  DoctorCaseActionResult,
  DashboardByRole,
  LoginPayload,
  SourceMode,
  TriageCaseActionPayload,
  TriageCaseActionResult,
  UserRole,
} from '../portalTypes'
import type { LiveCollectionRecord } from '../utils/liveCollections'
import { readLiveCollections } from '../utils/liveCollections'

export const SESSION_STORAGE_KEY = 'inovatech-auth-session'

const DEFAULT_API_BASE_URL = 'http://localhost:3001/api'
const REQUEST_DELAY_MS = 280
const REQUEST_TIMEOUT_MS = 8000

function getRequestedSource(): SourceMode {
  return import.meta.env.VITE_DATA_SOURCE === 'mock' ? 'mock' : 'api'
}

function getApiBaseUrl() {
  // Em produção, preferimos usar o mesmo domínio do frontend para simplificar deploy.
  const explicitBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim()

  if (explicitBaseUrl) {
    return explicitBaseUrl
  }

  if (typeof window !== 'undefined') {
    const { hostname, origin, port, protocol } = window.location

    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      if (port && port !== '3001') {
        return `${protocol}//${hostname}:3001/api`
      }

      return `${origin}/api`
    }
  }

  return DEFAULT_API_BASE_URL
}

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}

async function requestJson<T>(path: string, init?: RequestInit) {
  // Toda chamada HTTP do portal passa por aqui para compartilhar timeout,
  // headers e tratamento padronizado de erro.
  const controller = new AbortController()
  const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  let response: Response

  try {
    response = await fetch(`${getApiBaseUrl()}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(init?.headers ?? {}),
      },
      signal: controller.signal,
    })
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error('A API demorou para responder. Verifique se o backend esta ligado.', {
        cause: error,
      })
    }

    throw new Error('Nao foi possivel conectar com a API. Verifique se o backend esta ligado.', {
      cause: error,
    })
  } finally {
    window.clearTimeout(timeoutId)
  }

  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || 'Falha ao comunicar com a API.')
  }

  return (await response.json()) as T
}

function buildSession(payload: LoginPayload): AuthSession {
  const mockPassword = import.meta.env.VITE_MOCK_LOGIN_PASSWORD?.trim()

  if (!mockPassword) {
    throw new Error('Login mock indisponivel sem VITE_MOCK_LOGIN_PASSWORD.')
  }

  if (payload.password !== mockPassword) {
    throw new Error('Credenciais invalidas para o perfil selecionado.')
  }

  // As credenciais mock continuam úteis para desenvolvimento sem backend ligado.
  const account = demoAccounts.find(
    (item) =>
      item.role === payload.role &&
      item.identifier.toLowerCase() === payload.identifier.trim().toLowerCase(),
  )

  if (!account) {
    throw new Error('Credenciais invalidas para o perfil selecionado.')
  }

  return {
    token: `demo-token-${account.role}-${account.id}`,
    user: {
      id: account.id,
      name: account.name,
      role: account.role,
      roleLabel: roleMeta[account.role].label,
      territory: account.territory,
    },
  }
}

function getRequestHeaders(token?: string, extraHeaders?: HeadersInit) {
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(extraHeaders ?? {}),
  }
}

function buildMockAdminOverview(): AdminOverviewDashboard {
  return {
    headline: dashboardMocks.admin.headline,
    summary: dashboardMocks.admin.summary,
    stats: dashboardMocks.admin.stats,
    alerts: dashboardMocks.admin.alerts,
    activity: dashboardMocks.admin.activity,
    changes: mockAdminChanges,
  }
}

function buildMockAdminUsers(): AdminUsersDashboard {
  const users = mockAdminUsers
  const activeCount = users.filter((user) => user.active).length
  const inactiveCount = users.length - activeCount
  const profileCount = new Set(users.map((user) => user.role)).size

  return {
    headline: 'Gestao de usuarios do sistema.',
    summary: 'Ative, desative e acompanhe os acessos cadastrados no portal.',
    stats: [
      {
        label: 'Usuarios cadastrados',
        value: String(users.length),
        detail: 'Total de acessos disponiveis no sistema.',
        tone: 'teal',
      },
      {
        label: 'Usuarios ativos',
        value: String(activeCount),
        detail: 'Acessos liberados para entrar no sistema.',
        tone: 'gold',
      },
      {
        label: 'Usuarios inativos',
        value: String(inactiveCount),
        detail: 'Acessos temporariamente bloqueados.',
        tone: 'coral',
      },
      {
        label: 'Perfis encontrados',
        value: String(profileCount),
        detail: 'Perfis diferentes cadastrados na tabela usuarios.',
        tone: 'slate',
      },
    ],
    users,
  }
}

function buildMockAdminDatabase(): AdminDatabaseDashboard {
  return {
    headline: 'Controle do banco e da infraestrutura.',
    summary: 'Acompanhe o schema, as tabelas lidas pelo painel e o estado da integracao.',
    stats: dashboardMocks.admin.stats,
    alerts: dashboardMocks.admin.alerts,
    tables: mockAdminTables,
    health: mockAdminHealth,
    changes: mockAdminChanges,
  }
}

export function getPortalConfig() {
  return {
    sourceMode: getRequestedSource(),
    apiBaseUrl: getApiBaseUrl(),
  }
}

export async function login(payload: LoginPayload): Promise<AuthSession> {
  if (getRequestedSource() === 'api') {
    return requestJson<AuthSession>('/auth/login', {
      method: 'POST',
      headers:
        payload.role === 'admin' && payload.accessKey
          ? {
              'x-admin-access-key': payload.accessKey,
            }
          : undefined,
      body: JSON.stringify(payload),
    })
  }

  await wait(REQUEST_DELAY_MS)
  return buildSession(payload)
}

export type SupportContactPayload = {
  role: UserRole
  name: string
  contact: string
  message: string
}

export type SupportContactResult = {
  protocol: string
  status: string
  createdAt: string
}

export async function submitSupportContact(
  payload: SupportContactPayload,
): Promise<SupportContactResult> {
  if (getRequestedSource() === 'api') {
    return requestJson<SupportContactResult>('/support/contact', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  }

  await wait(REQUEST_DELAY_MS)

  const protocol = `AQ-DEMO-${Date.now().toString().slice(-6)}`
  const storedRequests = JSON.parse(
    window.localStorage.getItem('aquasafe-support-requests') || '[]',
  ) as SupportContactResult[]
  const nextRequest = {
    protocol,
    status: 'Aberto',
    createdAt: new Date().toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
  }

  window.localStorage.setItem(
    'aquasafe-support-requests',
    JSON.stringify([nextRequest, ...storedRequests].slice(0, 20)),
  )

  return nextRequest
}

export async function fetchDashboard<R extends UserRole>(
  role: R,
  token: string,
): Promise<DashboardByRole[R]> {
  if (getRequestedSource() === 'api') {
    return requestJson<DashboardByRole[R]>(`/dashboard/${role}`, {
      headers: getRequestHeaders(token),
    })
  }

  await wait(REQUEST_DELAY_MS)
  return dashboardMocks[role]
}

export async function fetchAdminOverview(token: string): Promise<AdminOverviewDashboard> {
  if (getRequestedSource() === 'api') {
    return requestJson<AdminOverviewDashboard>('/admin/overview', {
      headers: getRequestHeaders(token),
    })
  }

  await wait(REQUEST_DELAY_MS)
  return buildMockAdminOverview()
}

export async function fetchAdminUsers(token: string): Promise<AdminUsersDashboard> {
  if (getRequestedSource() === 'api') {
    return requestJson<AdminUsersDashboard>('/admin/users', {
      headers: getRequestHeaders(token),
    })
  }

  await wait(REQUEST_DELAY_MS)
  return buildMockAdminUsers()
}

export async function updateAdminUserStatus(
  token: string,
  userId: string,
  active: boolean,
): Promise<{ id: string; active: boolean; status: string }> {
  if (getRequestedSource() === 'api') {
    return requestJson<{ id: string; active: boolean; status: string }>(
      `/admin/users/${userId}/status`,
      {
        method: 'PATCH',
        headers: getRequestHeaders(token),
        body: JSON.stringify({ active }),
      },
    )
  }

  await wait(REQUEST_DELAY_MS)
  return {
    id: userId,
    active,
    status: active ? 'Ativo' : 'Inativo',
  }
}

export async function createAdminUser(
  token: string,
  payload: CreateAdminUserPayload,
): Promise<{ id: string }> {
  if (getRequestedSource() === 'api') {
    return requestJson<{ id: string }>('/admin/users', {
      method: 'POST',
      headers: getRequestHeaders(token),
      body: JSON.stringify(payload),
    })
  }

  await wait(REQUEST_DELAY_MS)

  const nextId = `mock-user-${Date.now()}`
  mockAdminUsers.unshift({
    id: nextId,
    name: payload.name,
    role: payload.role,
    identifier: payload.identifier,
    territory: payload.territory || 'Nao informado',
    status: 'Ativo',
    active: true,
  })

  return { id: nextId }
}

export async function fetchAdminDatabase(token: string): Promise<AdminDatabaseDashboard> {
  if (getRequestedSource() === 'api') {
    return requestJson<AdminDatabaseDashboard>('/admin/database', {
      headers: getRequestHeaders(token),
    })
  }

  await wait(REQUEST_DELAY_MS)
  return buildMockAdminDatabase()
}

export async function submitDoctorCaseAction(
  token: string,
  caseId: string,
  payload: DoctorCaseActionPayload,
): Promise<DoctorCaseActionResult> {
  if (getRequestedSource() === 'api') {
    return requestJson<DoctorCaseActionResult>(`/doctor/cases/${caseId}/actions`, {
      method: 'POST',
      headers: getRequestHeaders(token),
      body: JSON.stringify(payload),
    })
  }

  await wait(REQUEST_DELAY_MS)

  const actionMeta =
    payload.action === 'request_biomarker'
      ? {
          lastAction: 'Biomarcador solicitado',
          status: 'Aguardando biomarcador',
          nextStep: 'Coletar biomarcador e revisar resultado.',
        }
      : payload.action === 'schedule_return'
        ? {
            lastAction: 'Retorno marcado',
            status: 'Retorno agendado',
            nextStep: 'Reavaliar sintomas e consumo de peixe.',
          }
        : {
            lastAction: 'Conduta registrada',
            status: 'Conduta registrada',
            nextStep: 'Acompanhar evolucao no proximo contato.',
          }

  const currentCase =
    dashboardMocks.doctor.cases.find((item) => item.id === caseId) ??
    dashboardMocks.doctor.cases[0]

  return {
    case: {
      ...currentCase,
      ...actionMeta,
      clinicalNote: payload.note,
      updatedAt: new Date().toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    },
  }
}

export async function submitTriageCaseAction(
  token: string,
  caseId: string,
  payload: TriageCaseActionPayload,
): Promise<TriageCaseActionResult> {
  if (getRequestedSource() === 'api') {
    return requestJson<TriageCaseActionResult>(`/nurse/cases/${caseId}/triage`, {
      method: 'POST',
      headers: getRequestHeaders(token),
      body: JSON.stringify(payload),
    })
  }

  await wait(REQUEST_DELAY_MS)

  const currentCase =
    dashboardMocks.doctor.cases.find((item) => item.id === caseId) ??
    dashboardMocks.doctor.cases[0]
  const actionMeta =
    payload.action === 'send_to_doctor'
      ? {
          lastAction: 'Encaminhado ao medico',
          status: 'Aguardando medico',
          nextStep: 'Medico deve revisar triagem e definir conduta.',
        }
      : payload.action === 'request_biomarker'
        ? {
            lastAction: 'Biomarcador solicitado pela triagem',
            status: 'Aguardando biomarcador',
            nextStep: 'Coletar biomarcador e encaminhar resultado ao medico.',
          }
        : payload.action === 'schedule_return'
          ? {
              lastAction: 'Retorno marcado pela triagem',
              status: 'Retorno agendado',
              nextStep: payload.returnAt
                ? `Reavaliar paciente no retorno de ${payload.returnAt}.`
                : 'Reavaliar paciente no retorno agendado.',
            }
        : {
            lastAction: 'Prioridade classificada',
            status: 'Triagem concluida',
            nextStep: 'Aguardar chamada conforme prioridade.',
          }

  return {
    case: {
      ...currentCase,
      ...actionMeta,
      clinicalNote: payload.note,
      returnAt:
        payload.action === 'schedule_return' ? payload.returnAt : currentCase.returnAt,
      updatedAt: new Date().toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    },
  }
}

export async function createTriageCase(
  token: string,
  payload: CreateTriageCasePayload,
): Promise<TriageCaseActionResult> {
  if (getRequestedSource() === 'api') {
    return requestJson<TriageCaseActionResult>('/nurse/cases', {
      method: 'POST',
      headers: getRequestHeaders(token),
      body: JSON.stringify(payload),
    })
  }

  await wait(REQUEST_DELAY_MS)

  return {
    case: {
      id: `mock-triage-${Date.now()}`,
      patient: payload.patient,
      community: payload.community,
      risk: payload.risk,
      status: 'Aguardando medico',
      nextStep: 'Medico deve revisar triagem e definir conduta.',
      priorityGroup: payload.priorityGroup,
      symptoms: payload.symptoms,
      exposureSummary: payload.exposureSummary,
      clinicalNote: payload.note,
      lastAction: 'Triagem enviada ao medico',
      updatedAt: new Date().toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    },
  }
}

export type CollectionSearchParams = {
  q?: string
  risk?: string
  community?: string
  limit?: number
}

function buildCollectionSearchPath(params?: CollectionSearchParams) {
  const searchParams = new URLSearchParams()

  if (params?.q?.trim()) {
    searchParams.set('q', params.q.trim())
  }

  if (params?.risk?.trim()) {
    searchParams.set('risk', params.risk.trim())
  }

  if (params?.community?.trim()) {
    searchParams.set('community', params.community.trim())
  }

  if (params?.limit) {
    searchParams.set('limit', String(params.limit))
  }

  const queryString = searchParams.toString()

  return `/collections/live${queryString ? `?${queryString}` : ''}`
}

export async function fetchLiveCollections(
  token?: string,
  params?: CollectionSearchParams,
): Promise<LiveCollectionRecord[]> {
  // O mapa e as telas de apoio usam esta função para combinar pesquisa,
  // filtros e leitura oficial da API.
  if (getRequestedSource() === 'api' && token) {
    return requestJson<LiveCollectionRecord[]>(buildCollectionSearchPath(params), {
      headers: getRequestHeaders(token),
    })
  }

  await wait(REQUEST_DELAY_MS)
  const localRecords = readLiveCollections()
  const query = params?.q?.trim().toLowerCase() ?? ''
  const risk = params?.risk?.trim() ?? ''
  const community = params?.community?.trim() ?? ''

  return localRecords
    .filter((record) => {
      if (risk && record.risk !== risk) {
        return false
      }

      if (community && record.community !== community) {
        return false
      }

      if (!query) {
        return true
      }

      const searchableText = [
        record.id,
        record.collectionNumber ? String(record.collectionNumber) : '',
        record.community,
        record.sampleType,
        record.collector,
        record.status,
        record.note ?? '',
      ]
        .join(' ')
        .toLowerCase()

      return searchableText.includes(query)
    })
    .slice(0, params?.limit ?? 200)
}

export async function fetchLiveCollectionDetail(
  token: string,
  collectionId: string,
): Promise<LiveCollectionRecord> {
  if (getRequestedSource() === 'api') {
    return requestJson<LiveCollectionRecord>(
      `/collections/live/${encodeURIComponent(collectionId)}`,
      {
        headers: getRequestHeaders(token),
      },
    )
  }

  await wait(REQUEST_DELAY_MS)

  const localRecord = readLiveCollections().find((record) => record.id === collectionId)

  if (localRecord) {
    return localRecord
  }

  throw new Error('Coleta nao encontrada no modo demonstracao.')
}

export async function submitLiveCollection(
  token: string,
  payload: LiveCollectionRecord,
): Promise<LiveCollectionRecord> {
  // A API devolve a versão persistida da coleta, normalmente já com número oficial.
  if (getRequestedSource() === 'api') {
    return requestJson<LiveCollectionRecord>('/collections/live', {
      method: 'POST',
      headers: getRequestHeaders(token),
      body: JSON.stringify(payload),
    })
  }

  await wait(REQUEST_DELAY_MS)
  return payload
}
