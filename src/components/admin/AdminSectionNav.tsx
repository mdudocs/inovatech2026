// Navegacao entre as secoes da area administrativa.
import { Database, LayoutDashboard, Users, type LucideIcon } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import type { AdminSection } from '../../portalTypes'

const sectionMeta: Record<
  AdminSection,
  { label: string; icon: LucideIcon }
> = {
  'visao-geral': {
    label: 'Visao geral',
    icon: LayoutDashboard,
  },
  usuarios: {
    label: 'Usuarios',
    icon: Users,
  },
  banco: {
    label: 'Banco',
    icon: Database,
  },
}

export function AdminSectionNav() {
  return (
    <nav className="admin-nav" aria-label="Secoes administrativas">
      {(Object.keys(sectionMeta) as AdminSection[]).map((section) => {
        const Icon = sectionMeta[section].icon

        return (
          <NavLink
            className={({ isActive }) =>
              `admin-nav-link ${isActive ? 'admin-nav-link-active' : ''}`
            }
            key={section}
            to={`/portal/admin/${section}`}
          >
            <Icon size={18} />
            <span>{sectionMeta[section].label}</span>
          </NavLink>
        )
      })}
    </nav>
  )
}
