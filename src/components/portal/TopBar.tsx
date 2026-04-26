import { LogOut, MoonStar, SunMedium } from 'lucide-react'
import { Link, NavLink } from 'react-router-dom'
import { AquaSafeLogo } from '../AquaSafeLogo'
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
        <AquaSafeLogo />
        <span>
          <strong>AquaSafe</strong>
          <small>Monitoramento de agua, mercurio e cuidado territorial</small>
        </span>
      </Link>

      {session ? (
        <nav className="topnav" aria-label="Principal">
          <NavLink to={roleMeta[session.user.role].route}>Meu portal</NavLink>
          {session.user.role !== 'population' ? (
            <NavLink to="/portal/coletas">Coletas</NavLink>
          ) : null}
        </nav>
      ) : null}

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
