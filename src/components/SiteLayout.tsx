import { MapPinned, Moon, ShieldAlert, SunMedium } from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'
import { navItems } from '../siteData'
import { InstitutionalBand } from './InstitutionalBand'

type SiteLayoutProps = {
  theme: 'light' | 'dark'
  onToggleTheme: () => void
}

export function SiteLayout({ theme, onToggleTheme }: SiteLayoutProps) {
  const nextThemeLabel = theme === 'light' ? 'Modo escuro' : 'Modo claro'

  return (
    <div className="page-shell">
      <header className="site-header">
        <div className="brand-block">
          <div className="brand-mark">
            <ShieldAlert size={18} strokeWidth={2.2} />
          </div>
          <div>
            <p className="brand-chip">Inovatech 2026</p>
            <strong className="brand-title">Observatorio Mercurio Rio Negro</strong>
          </div>
        </div>

        <nav className="site-nav" aria-label="Navegacao principal">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="header-actions">
          <button
            type="button"
            className="theme-toggle"
            onClick={onToggleTheme}
            aria-label={nextThemeLabel}
            aria-pressed={theme === 'dark'}
            title={nextThemeLabel}
          >
            {theme === 'light' ? <Moon size={16} /> : <SunMedium size={16} />}
            {nextThemeLabel}
          </button>

          <div className="header-badge">
            <MapPinned size={16} />
            Amazonas | eixo Rio Negro
          </div>
        </div>
      </header>

      <main className="site-main">
        <Outlet />
        <InstitutionalBand />
      </main>
    </div>
  )
}
