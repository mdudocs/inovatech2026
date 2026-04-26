// Pagina publica de metodologia e leitura tecnica do painel de risco.
import type { CSSProperties } from 'react'
import { factors, methodAxes, panelGapNote, priorityCommunities, riskLabel, riskScaleGuide } from '../siteData'

export function PanelPage() {
  return (
    <>
      <section className="page-hero">
        <div className="page-hero-copy">
          <span className="section-kicker">Painel tecnico</span>
          <h1 className="page-title">
            Metodologia do indice de risco por comunidade.
          </h1>
          <p className="page-summary">
            Esta pagina concentra o conteudo mais tecnico do Inovatech original:
            variaveis, pesos, leitura territorial e prioridades de monitoramento.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="section-intro">
          <span className="section-kicker">Leitura do risco</span>
          <h2>O que aumenta a atencao em cada trecho monitorado.</h2>
        </div>

        <div className="panel-layout">
          <article className="risk-model">
            <div className="card-heading">
              <span className="minor-tag">Indice de risco por comunidade</span>
              <h3>Combinacao principal de sinais</h3>
            </div>

            <div className="formula-line" aria-hidden="true">
              <span>Qualidade da agua</span>
              <span>Peixes consumidos</span>
              <span>Frequencia de consumo</span>
              <span>Acesso a saude</span>
            </div>

            <div className="factor-stack">
              {factors.map((factor) => {
                const factorStyle: CSSProperties = {
                  width: `${factor.weight}%`,
                }

                return (
                  <article key={factor.label} className="factor-row">
                    <div className="factor-copy">
                      <div>
                        <strong>{factor.label}</strong>
                        <p>{factor.detail}</p>
                      </div>
                      <span>{factor.weight}%</span>
                    </div>
                    <div className="factor-bar">
                      <div className="factor-fill" style={factorStyle} />
                    </div>
                  </article>
                )
              })}
            </div>
          </article>

          <article className="priority-card">
            <div className="card-heading">
              <span className="minor-tag">Monitoramento territorial</span>
              <h3>Comunidades com resposta mais urgente</h3>
            </div>

            <div className="priority-list">
              {priorityCommunities.map((community, index) => (
                <article key={community.name} className="priority-item">
                  <span className="priority-rank">0{index + 1}</span>
                  <div className="priority-copy">
                    <div className="priority-head">
                      <div>
                        <strong>{community.name}</strong>
                        <p>{community.area}</p>
                      </div>
                      <span className={`risk-pill risk-${community.risk}`}>
                        {riskLabel[community.risk]}
                      </span>
                    </div>
                    <dl className="priority-meta">
                      <div>
                        <dt>Populacao</dt>
                        <dd>{community.population}</dd>
                      </div>
                      <div>
                        <dt>Foco</dt>
                        <dd>{community.focus}</dd>
                      </div>
                    </dl>
                    <small>{community.note}</small>
                  </div>
                </article>
              ))}
            </div>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="section-intro">
          <span className="section-kicker">Cruzamento de variaveis</span>
          <h2>Os quatro eixos do painel original agora ficam em uma pagina propria.</h2>
          <p>
            Cada eixo organiza as variaveis que alimentam o indice de risco por
            comunidade no observatorio.
          </p>
        </div>

        <div className="method-grid">
          {methodAxes.map((axis) => (
            <article key={axis.title} className={`method-axis method-axis-${axis.tone}`}>
              <div className="method-axis-head">
                <span className="method-axis-dot" />
                <div>
                  <h3>{axis.title}</h3>
                  <p>{axis.description}</p>
                </div>
              </div>

              <div className="method-fields">
                {axis.fields.map((field) => (
                  <div key={field.key} className="method-field-row">
                    <span className="method-field-key">{field.key}</span>
                    <span className="method-field-value">{field.value}</span>
                    <span className="method-field-badge">{field.badge}</span>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>

        <article className="panel-note-card">
          <strong>Lacuna critica da base atual</strong>
          <p>{panelGapNote}</p>
        </article>
      </section>

      <section className="section">
        <div className="section-intro">
          <span className="section-kicker">Escala de resposta</span>
          <h2>Como o painel interpreta o territorio.</h2>
        </div>

        <div className="scale-guide-grid">
          {riskScaleGuide.map((item) => (
            <article key={item.label} className="scale-guide-card">
              <span className={`risk-pill risk-pill-${item.tone}`}>{item.label}</span>
              <p>{item.detail}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  )
}
