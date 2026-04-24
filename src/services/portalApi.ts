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
  DashboardByRole,
  LoginPayload,
  SourceMode,
  UserRole,
} from '../portalTypes'

export const SESSION_STORAGE_KEY = 'inovatech-auth-session'

const DEFAULT_API_BASE_URL = 'http://localhost:3001/api'
const REQUEST_DELAY_MS = 280
const REQUEST_TIMEOUT_MS = 8000

function getRequestedSource(): SourceMode {
  return import.meta.env.VITE_DATA_SOURCE === 'mock' ? 'mock' : 'api'
}

function getApiBaseUrl() {
  return import.meta.env.VITE_API_BASE_URL?.trim() || DEFAULT_API_BASE_URL
}

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}

async function requestJson<T>(path: string, init?: RequestInit) {
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
  const account = demoAccounts.find(
    (item) =>
      item.role === payload.role &&
      item.identifier.toLowerCase() === payload.identifier.trim().toLowerCase() &&
      item.password === payload.password,
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
