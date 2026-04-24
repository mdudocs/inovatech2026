import { dashboardMocks, demoAccounts, roleMeta } from '../mockPortalData'
import type {
  AuthSession,
  DashboardByRole,
  LoginPayload,
  SourceMode,
  UserRole,
} from '../portalTypes'

export const SESSION_STORAGE_KEY = 'inovatech-auth-session'

const DEFAULT_API_BASE_URL = 'http://localhost:3001/api'
const REQUEST_DELAY_MS = 280

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
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  })

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
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  }

  await wait(REQUEST_DELAY_MS)
  return dashboardMocks[role]
}
