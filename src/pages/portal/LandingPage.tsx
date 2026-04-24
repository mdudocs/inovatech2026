import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { roleIcons } from '../../components/portal/roleIcons'
import { roleMeta } from '../../mockPortalData'
import { landingCards } from '../../portalContent'
import type { AuthSession } from '../../portalTypes'

export function LandingPage({ session }: { session: AuthSession | null }) {
  return (
    <div className="page-stack">
      <section className="simple-card system-hero">
        <span className="section-badge">Sistema</span>
        <h1 className="section-title">Acesso direto aos paineis do sistema.</h1>
        <p className="section-text">
          Escolha o perfil e entre. Cada area foi organizada para mostrar apenas o que
          precisa ser acompanhado no dia.
        </p>
        <div className="hero-actions">
          <Link
            className="button button-primary"
            to={session ? roleMeta[session.user.role].route : '/login'}
          >
            {session ? 'Abrir meu painel' : 'Entrar no sistema'}
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      <section className="section-grid">
        <div className="section-heading">
          <span className="section-badge">Perfis</span>
          <h2>Entradas do sistema.</h2>
        </div>

        <div className="access-grid">
          {landingCards.map((item) => {
            const Icon = roleIcons[item.role]

            return (
              <article className="access-card" key={item.role}>
                <div className="card-head">
                  <span className="feature-icon">
                    <Icon size={20} />
                  </span>
                  <div>
                    <strong>{roleMeta[item.role].label}</strong>
                    <p>{roleMeta[item.role].description}</p>
                  </div>
                </div>

                <ul className="clean-list">
                  {item.points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>

                <Link className="button button-secondary full-width" to={`/login?role=${item.role}`}>
                  Entrar como {roleMeta[item.role].shortLabel}
                </Link>
              </article>
            )
          })}
        </div>
      </section>
    </div>
  )
}
