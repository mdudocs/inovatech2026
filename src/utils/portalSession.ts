// Utilitarios de sessao local: validacao de perfil, leitura e persistencia do login.
import type { AuthSession, UserRole } from '../portalTypes'
import { SESSION_STORAGE_KEY } from '../services/portalApi'

export function isUserRole(value: string | undefined): value is UserRole {
  return (
    value === 'population' ||
    value === 'nurse' ||
    value === 'doctor' ||
    value === 'collector' ||
    value === 'admin'
  )
}

export function readStoredSession() {
  if (typeof window === 'undefined') {
    return null
  }

  const raw = window.localStorage.getItem(SESSION_STORAGE_KEY)

  if (!raw) {
    return null
  }

  try {
    const session = JSON.parse(raw) as AuthSession

    // Em modo API (producao), rejeita qualquer token que nao seja assinado pelo servidor.
    // Tokens reais sempre comecam com "asf.". Isso bloqueia sessoes falsas injetadas via localStorage.
    if (import.meta.env.VITE_DATA_SOURCE !== 'mock') {
      if (typeof session?.token !== 'string' || !session.token.startsWith('asf.')) {
        window.localStorage.removeItem(SESSION_STORAGE_KEY)
        return null
      }
    }

    return session
  } catch {
    window.localStorage.removeItem(SESSION_STORAGE_KEY)
    return null
  }
}

export function saveSession(session: AuthSession | null) {
  if (typeof window === 'undefined') {
    return
  }

  if (!session) {
    window.localStorage.removeItem(SESSION_STORAGE_KEY)
    return
  }

  window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session))
}
