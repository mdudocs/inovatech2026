import { Activity, AlertTriangle, Droplets, Fish } from 'lucide-react'
import { Link } from 'react-router-dom'
import { monitoringSteps, problemAlerts, problemNarrative } from '../siteData'

const problemIcons = {
  critical: AlertTriangle,
  warning: Fish,
  info: Droplets,
}

const stepAccents = {
  teal: 'monitor-card-teal',
  gold: 'monitor-card-gold',
  violet: 'monitor-card-violet',
}

export function ContextPage() {
  // Esta pagina traduz o material conceitual do projeto em leitura publica:
  // problema, impacto territorial e desenho do monitoramento.
  return (
    <>
      <section className="page-hero">
        <div className="page-hero-copy">
          <span className="section-kicker">Contexto territorial</span>
          <h1 className="page-title">
            O problema que o observatorio acompanha no Rio Negro.
          </h1>
          <p className="page-summary">
            Esta pagina concentra o pano de fundo do projeto original:
            contaminacao por mercurio, exposicao alimentar, seca extrema e a
            forma como o monitoramento foi desenhado para responder a isso.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="section-intro">
          <span className="section-kicker">O problema</span>
          <h2>Um risco invisivel que atravessa agua, peixe e cuidado em saude.</h2>
        </div>

        <div className="problem-grid">
          <article className="problem-story">
            {problemNarrative.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}

            <blockquote className="context-quote">
              O ponto central do Inovatech original continua valendo: transformar
              dados dispersos em leitura territorial acionavel.
            </blockquote>
          </article>

          <div className="problem-alert-list">
            {problemAlerts.map((item) => {
              const Icon = problemIcons[item.tone]

              return (
                <article
                  key={item.title}
                  className={`problem-alert-card problem-alert-${item.tone}`}
                >
                  <div className="problem-alert-icon">
                    <Icon size={18} />
                  </div>
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                    <small>{item.source}</small>
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      <section className="section" id="monitoramento">
        <div className="section-intro">
          <span className="section-kicker">Como funciona</span>
          <h2>O observatorio junta campo, clinica e leitura preditiva.</h2>
          <p>
            Aqui esta a estrutura principal do projeto original, reorganizada em
            linguagem mais direta para caber no site novo.
          </p>
        </div>

        <div className="monitor-grid">
          {monitoringSteps.map((step) => (
            <article
              key={step.title}
              className={`monitor-card ${stepAccents[step.tone]}`}
            >
              <div className="monitor-head">
                <span className="monitor-number">{step.number}</span>
                <div className="monitor-icon">
                  <Activity size={20} />
                </div>
              </div>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
              <div className="monitor-tags">
                {step.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
            </article>
          ))}
        </div>

        <div className="page-cta-row">
          <Link className="button-primary" to="/painel">
            Ver metodologia no painel
          </Link>
        </div>
      </section>
    </>
  )
}
