import { useEffect, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import { TopBar } from './components/portal/TopBar'
import { roleMeta } from './mockPortalData'
import { AdminPortalPage } from './pages/admin/AdminPortalPage'
import type { AuthSession, UserRole } from './portalTypes'
import { AdminLoginPage } from './pages/portal/AdminLoginPage'
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

  async function handleLogin(
    role: UserRole,
    identifier: string,
    password: string,
    accessKey?: string,
  ) {
    const nextSession = await login({ role, identifier, password, accessKey })
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
              path="/acesso-interno"
              element={
                <AdminLoginPage
                  session={session}
                  onLogin={(identifier, password, accessKey) =>
                    handleLogin('admin', identifier, password, accessKey)
                  }
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
              path="/portal/admin"
              element={<Navigate to={roleMeta.admin.route} replace />}
            />
            <Route
              path="/portal/admin/:section"
              element={<AdminPortalPage session={session} />}
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
