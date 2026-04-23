export type ThemeMode = 'light' | 'dark'

export const THEME_STORAGE_KEY = 'inovatech-theme'

function isThemeMode(value: string | null | undefined): value is ThemeMode {
  return value === 'light' || value === 'dark'
}

export function getStoredTheme(): ThemeMode | null {
  if (typeof window === 'undefined') {
    return null
  }

  const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY)

  return isThemeMode(storedTheme) ? storedTheme : null
}

export function resolveInitialTheme(): ThemeMode {
  if (typeof document !== 'undefined') {
    const activeTheme = document.documentElement.dataset.theme

    if (isThemeMode(activeTheme)) {
      return activeTheme
    }
  }

  return getStoredTheme() ?? 'light'
}

export function applyTheme(theme: ThemeMode) {
  if (typeof document !== 'undefined') {
    document.documentElement.dataset.theme = theme
    document.documentElement.style.colorScheme = theme
  }

  if (typeof window !== 'undefined') {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme)
  }
}
