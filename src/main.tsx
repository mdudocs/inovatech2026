// Entrada principal do frontend.
// Garante que o tema seja aplicado antes da aplicacao React montar na tela.
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { applyTheme, getStoredTheme } from './theme'

applyTheme(getStoredTheme() ?? 'light')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
