import { Droplets, LogOut, MoonStar, SunMedium } from 'lucide-react'
import { Link, NavLink } from 'react-router-dom'
import { roleMeta } from '../../mockPortalData'
import type { AuthSession } from '../../portalTypes'
import type { ThemeMode } from '../../theme'

export function TopBar({
  theme,
  session,
  onToggleTheme,
  onLogout,
}: {
  theme: ThemeMode
  session: AuthSession | null
  onToggleTheme: () => void
  onLogout: () => void
}) {
  return (
    <header className="topbar">
      <Link className="brand" to="/">
        <span className="brand-mark">
          <Droplets size={18} />
        </span>
        <span>
          <strong>Inovatech Mercury Care</strong>
          <small>Sistema informativo para populacao, medico e coleta</small>
        </span>
      </Link>

      <nav className="topnav" aria-label="Principal">
        <NavLink to="/">Inicio</NavLink>
        <NavLink to="/login">Entrar</NavLink>
        {session ? <NavLink to={roleMeta[session.user.role].route}>Meu portal</NavLink> : null}
      </nav>

      <div className="topbar-actions">
        <button
          aria-label="Alternar tema"
          className="icon-button"
          onClick={onToggleTheme}
          type="button"
        >
          {theme === 'light' ? <MoonStar size={18} /> : <SunMedium size={18} />}
        </button>

        {session ? (
          <>
            <div className="user-chip">
              <strong>{session.user.name}</strong>
              <small>{session.user.roleLabel}</small>
            </div>
            <button className="icon-button" onClick={onLogout} type="button">
              <LogOut size={18} />
            </button>
          </>
        ) : null}
      </div>
    </header>
  )
}
