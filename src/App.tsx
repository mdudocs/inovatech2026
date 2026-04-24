import { useEffect, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import { TopBar } from './components/portal/TopBar'
import { roleMeta } from './mockPortalData'
import type { AuthSession, UserRole } from './portalTypes'
import { LandingPage } from './pages/portal/LandingPage'
import { LoginPage } from './pages/portal/LoginPage'
import { PortalPage } from './pages/portal/PortalPage'
import { login } from './services/portalApi'
import { applyTheme, resolveInitialTheme } from './theme'
import { readStoredSession, saveSession } from './utils/portalSession'

function App() {
  const [theme, setTheme] = useState(resolveInitialTheme)
  const [session, setSession] = useState<AuthSession | null>(() => readStoredSession())

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  async function handleLogin(role: UserRole, identifier: string, password: string) {
    const nextSession = await login({ role, identifier, password })
    setSession(nextSession)
    saveSession(nextSession)
    return nextSession
  }

  function handleLogout() {
    setSession(null)
    saveSession(null)
  }

  return (
    <BrowserRouter>
      <div className="app-shell">
        <TopBar
          theme={theme}
          session={session}
          onLogout={handleLogout}
          onToggleTheme={() =>
            setTheme((current) => (current === 'light' ? 'dark' : 'light'))
          }
        />

        <main className="page-wrap">
          <Routes>
            <Route index element={<LandingPage session={session} />} />
            <Route
              path="/login"
              element={
                <LoginPage
                  session={session}
                  onLogin={handleLogin}
                />
              }
            />
            <Route
              path="/portal"
              element={
                session ? (
                  <Navigate to={roleMeta[session.user.role].route} replace />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/portal/:role"
              element={<PortalPage session={session} />}
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
