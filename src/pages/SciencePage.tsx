// Pagina publica da base cientifica e da rede de pesquisadores.
import { BookOpen } from 'lucide-react'
import { researchers, scienceStudies } from '../siteData'

export function SciencePage() {
  return (
    <>
      <section className="page-hero">
        <div className="page-hero-copy">
          <span className="section-kicker">Base cientifica</span>
          <h1 className="page-title">
            Evidencias e pesquisadores do Inovatech original reunidos no site novo.
          </h1>
          <p className="page-summary">
            Esta pagina concentra os 11 registros cientificos, a rede de
            pesquisadores e o nucleo tecnico que dava suporte ao projeto
            original.
          </p>
        </div>
      </section>

      <section className="section" id="estudos">
        <div className="section-intro">
          <span className="section-kicker">Literatura cientifica</span>
          <h2>Registros consolidados para leitura tecnica e tomada de decisao.</h2>
          <p>
            O conjunto abaixo foi migrado do HTML original e reorganizado em
            cards mais legiveis, mantendo os 11 registros principais.
          </p>
        </div>

        <div className="study-grid">
          {scienceStudies.map((study) => (
            <article key={study.id} className="study-card">
              <div className="study-head">
                <span className="study-id">{study.id}</span>
                <span className={`study-status study-status-${study.statusTone}`}>
                  {study.statusLabel}
                </span>
              </div>
              <h3>{study.title}</h3>
              <p className="study-authors">{study.authors}</p>
              <div className="study-meta">
                {study.meta.map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </div>
              <div className="study-findings">
                <BookOpen size={16} />
                <p>{study.findings}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section" id="pesquisadores">
        <div className="section-intro">
          <span className="section-kicker">Rede cientifica</span>
          <h2>Pesquisadores parceiros mapeados no projeto original.</h2>
        </div>

        <div className="researcher-grid">
          {researchers.map((researcher) => (
            <article key={researcher.name} className="researcher-card">
              <div className="researcher-avatar">{researcher.initials}</div>
              <strong>{researcher.name}</strong>
              <span className="researcher-inst">{researcher.institution}</span>
              <p>{researcher.specialty}</p>
              <small>{researcher.period}</small>
            </article>
          ))}
        </div>
      </section>
    </>
  )
}
