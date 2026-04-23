import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Database,
  Map,
  ShieldAlert,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { RiverMapPanel } from '../components/RiverMapPanel'
import {
  priorityCommunities,
  quickAccessCards,
  riskLabel,
  scienceStudies,
  signals,
  signalToneMeta,
  stats,
} from '../siteData'

const homeRoutes = [
  {
    title: 'Contexto do problema',
    description:
      'Explica contaminacao, seca extrema, exposicao alimentar e a logica geral do observatorio.',
    to: '/contexto',
    icon: ShieldAlert,
    tag: 'Contexto',
  },
  {
    title: 'Painel tecnico',
    description:
      'Mostra pesos, variaveis, metodologia do indice de risco e leitura de resposta por territorio.',
    to: '/painel',
    icon: Database,
    tag: 'Painel',
  },
  {
    title: 'Comunidades',
    description:
      'Reune a tabela consolidada do projeto original com filtros e prioridades por trecho monitorado.',
    to: '/comunidades',
    icon: Map,
    tag: 'Territorio',
  },
  {
    title: 'Base cientifica',
    description:
      'Concentra os 11 estudos, referencias tecnicas e a rede de pesquisadores parceiros.',
    to: '/ciencia',
    icon: BookOpen,
    tag: 'Ciencia',
  },
]

export function HomePage() {
  const heroWatch = priorityCommunities.slice(0, 3)
  const featuredStudies = scienceStudies.slice(0, 2)

  return (
    <>
      <section className="hero" id="inicio">
        <div className="hero-copy">
          <span className="hero-eyebrow">
            Informacao para populacao, medicos e agentes
          </span>
          <h1>Boletim de monitoramento do mercurio no Rio Negro.</h1>
          <p className="hero-summary">
            Alertas ambientais, comunidades em observacao, orientacoes
            imediatas e leitura territorial reunidos em um unico lugar para
            apoiar prevencao, cuidado e vigilancia ao longo do Rio Negro.
          </p>

          <div className="hero-actions">
            <Link className="button-primary" to="/painel">
              Ver painel de risco
              <ArrowRight size={18} />
            </Link>
            <Link className="button-secondary" to="/comunidades">
              Explorar comunidades
            </Link>
          </div>

          <div className="hero-guides" aria-label="Acessos rapidos">
            {quickAccessCards.map((item) => (
              <article key={item.title} className="hero-guide-card">
                <strong>{item.title}</strong>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
        </div>

        <aside className="hero-board" aria-label="Radar imediato">
          <div className="board-top">
            <span className="board-tag">Prioridades territoriais</span>
            <h2>Comunidades que pedem acompanhamento mais atento</h2>
            <p>
              A leitura abaixo cruza sinais ambientais, consumo de pescado,
              isolamento e acesso a saude para destacar onde a vigilancia deve
              ser mais rapida.
            </p>
          </div>

          <div className="board-watchlist">
            {heroWatch.map((community, index) => (
              <article key={community.name} className="board-watch">
                <span className="board-rank">0{index + 1}</span>
                <div className="board-watch-copy">
                  <div className="board-watch-head">
                    <strong>{community.name}</strong>
                    <span className={`risk-pill risk-${community.risk}`}>
                      {riskLabel[community.risk]}
                    </span>
                  </div>
                  <p>{community.focus}</p>
                  <small>{community.population}</small>
                </div>
              </article>
            ))}
          </div>

          <div className="board-bottom">
            <span>Agua</span>
            <span>Peixe</span>
            <span>Sintomas</span>
            <span>Acesso</span>
          </div>
        </aside>
      </section>

      <section className="stat-band" aria-label="Indicadores principais">
        {stats.map((stat) => (
          <article key={stat.label} className="stat-card">
            <span className="stat-label">{stat.label}</span>
            <strong className="stat-value">{stat.value}</strong>
            <p>{stat.note}</p>
          </article>
        ))}
      </section>

      <section className="section" id="alertas">
        <div className="section-intro">
          <span className="section-kicker">Alertas do momento</span>
          <h2>Situacao atual do monitoramento no territorio.</h2>
          <p>
            Este painel resume os sinais mais relevantes no Rio Negro e ajuda
            a identificar onde a orientacao, a triagem e a vigilancia precisam
            ser reforcadas.
          </p>
        </div>

        <div className="context-layout">
          <article className="context-story">
            <p>
              Os alertas atuais combinam seca extrema, qualidade da agua,
              dependencia de pescado e dificuldade de acesso a servicos de
              saude em parte das comunidades monitoradas.
            </p>
            <p>
              Gestantes, criancas, familias com alto consumo de peixe e
              comunidades isoladas merecem acompanhamento mais atento,
              especialmente durante periodos de seca severa.
            </p>

            <blockquote className="context-quote">
              Em caso de alerta local, mudanca na agua consumida ou sintomas
              neurologicos, procure orientacao da equipe de saude.
            </blockquote>
          </article>

          <div className="signal-grid">
            {signals.map((signal) => (
              <article key={signal.title} className={`signal-card signal-${signal.tone}`}>
                <div className="signal-head">
                  <div className="signal-alert-title">
                    <div className="signal-icon">
                      <AlertTriangle size={18} />
                    </div>
                    <div className="signal-copy">
                      <span className={`signal-level signal-level-${signal.tone}`}>
                        {signalToneMeta[signal.tone].label}
                      </span>
                      <h3>{signal.title}</h3>
                    </div>
                  </div>
                  <span className="signal-source">{signal.source}</span>
                </div>
                <p>{signal.description}</p>
                <div className="signal-footer">
                  <span>Acao recomendada</span>
                  <strong>{signalToneMeta[signal.tone].action}</strong>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="paginas">
        <div className="section-intro">
          <span className="section-kicker">Acesso por pagina</span>
          <h2>O site agora esta melhor distribuido em areas proprias.</h2>
          <p>
            A home virou um resumo do que importa agora. Os blocos abaixo levam
            para as paginas onde cada assunto ficou organizado com mais calma.
          </p>
        </div>

        <div className="home-route-grid">
          {homeRoutes.map((item) => {
            const Icon = item.icon

            return (
              <Link key={item.title} className="home-route-card" to={item.to}>
                <div className="home-route-head">
                  <span className="home-route-tag">{item.tag}</span>
                  <div className="home-route-icon">
                    <Icon size={22} />
                  </div>
                </div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
                <span className="home-route-link">
                  Abrir pagina
                  <ArrowRight size={16} />
                </span>
              </Link>
            )
          })}
        </div>
      </section>

      <section className="section" id="territorio">
        <div className="section-intro">
          <span className="section-kicker">Mapa do rio</span>
          <h2>O monitoramento acompanha o curso do Rio Negro em pontos prioritarios.</h2>
          <p>
            Os pontos abaixo mostram comunidades e trechos em observacao ao
            longo do leito do rio, com destaque para areas que pedem mais
            atencao.
          </p>
        </div>

        <RiverMapPanel />
      </section>

      <section className="section" id="ciencia">
        <div className="section-intro">
          <span className="section-kicker">Destaques cientificos</span>
          <h2>Dois registros-chave na home, com o acervo completo em outra pagina.</h2>
          <p>
            Assim a tela inicial continua leve, mas sem perder o contexto
            tecnico mais importante.
          </p>
        </div>

        <div className="evidence-grid">
          {featuredStudies.map((item) => (
            <article key={item.id} className="evidence-card">
              <div className="evidence-head">
                <BookOpen size={18} />
                <span>{item.id}</span>
              </div>
              <h3>{item.title}</h3>
              <p>{item.findings}</p>
            </article>
          ))}
        </div>

        <div className="page-cta-row">
          <Link className="button-secondary" to="/ciencia">
            Ver toda a base cientifica
          </Link>
        </div>
      </section>
    </>
  )
}
