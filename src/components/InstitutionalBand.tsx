import { Link } from 'react-router-dom'
import { footerColumns, institutionalPartners } from '../siteData'

export function InstitutionalBand() {
  return (
    <section className="institutional-band" id="parceiros">
      <div className="partners-panel">
        <span className="partners-kicker">Parceiros institucionais</span>
        <div className="partners-grid">
          {institutionalPartners.map((partner) => (
            <article
              key={partner}
              className={`partner-chip ${
                partner === 'CONECTHUS' ? 'partner-chip-highlight' : ''
              }`}
            >
              {partner}
            </article>
          ))}
        </div>
      </div>

      <footer className="site-footer">
        <div className="footer-brand">
          <strong>AquaSafe</strong>
          <p>
            Plataforma preditiva de saude publica para monitoramento de
            mercurio e analise de risco de intoxicacao em comunidades
            ribeirinhas e indigenas da Amazonia Brasileira.
          </p>

          <div className="footer-tags">
            <span>conecthus.org.br</span>
            <span>Rio Negro | AM</span>
            <span>2023-2026</span>
          </div>
        </div>

        <div className="footer-columns">
          {footerColumns.map((column) => (
            <div key={column.title} className="footer-column">
              <h3>{column.title}</h3>
              <ul>
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.to}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </footer>
    </section>
  )
}
