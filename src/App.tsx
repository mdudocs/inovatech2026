import { useEffect, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import { SiteLayout } from './components/SiteLayout'
import { CommunitiesPage } from './pages/CommunitiesPage'
import { ContextPage } from './pages/ContextPage'
import { HomePage } from './pages/HomePage'
import { PanelPage } from './pages/PanelPage'
import { SciencePage } from './pages/SciencePage'
import { applyTheme, resolveInitialTheme } from './theme'

function App() {
  const [theme, setTheme] = useState(resolveInitialTheme)

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  return (
    <BrowserRouter>
      <Routes>
        <Route
          element={
            <SiteLayout
              theme={theme}
              onToggleTheme={() =>
                setTheme((current) => (current === 'light' ? 'dark' : 'light'))
              }
            />
          }
        >
          <Route index element={<HomePage />} />
          <Route path="contexto" element={<ContextPage />} />
          <Route path="painel" element={<PanelPage />} />
          <Route path="comunidades" element={<CommunitiesPage />} />
          <Route path="ciencia" element={<SciencePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
