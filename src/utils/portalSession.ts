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
    return JSON.parse(raw) as AuthSession
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
