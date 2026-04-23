import type { CSSProperties } from 'react'
import type { LucideIcon } from 'lucide-react'
import {
  AlertTriangle,
  ArrowRight,
  BellRing,
  BookOpen,
  FlaskConical,
  MapPinned,
  ShieldAlert,
  Users,
} from 'lucide-react'
import './App.css'

type RiskTone = 'critical' | 'high' | 'medium'

type Stat = {
  label: string
  value: string
  note: string
}

type Signal = {
  title: string
  description: string
  source: string
  tone: 'critical' | 'warning' | 'attention' | 'neutral'
}

type Layer = {
  title: string
  description: string
  icon: LucideIcon
  bullets: string[]
}

type Factor = {
  label: string
  weight: number
  detail: string
}

type Community = {
  name: string
  area: string
  population: string
  focus: string
  note: string
  risk: RiskTone
}

type Stop = {
  name: string
  detail: string
  position: number
  risk: RiskTone
}

type Evidence = {
  title: string
  year: string
  summary: string
}

const navItems = [
  { href: '#alertas', label: 'Alertas' },
  { href: '#orientacoes', label: 'Orientacoes' },
  { href: '#painel', label: 'Painel' },
  { href: '#territorio', label: 'Territorio' },
]

const stats: Stat[] = [
  {
    label: 'Pessoas mais expostas',
    value: '~120 mil',
    note: 'Comunidades ribeirinhas e indigenas em faixa prioritaria.',
  },
  {
    label: 'Trecho observado',
    value: '700 km',
    note: 'Do baixo ao alto Rio Negro na rota inicial de monitoramento.',
  },
  {
    label: 'Seca extrema',
    value: '32/34',
    note: 'Comunidades do baixo Rio Negro sem acesso direto ao rio em 2024.',
  },
  {
    label: 'Base cientifica',
    value: '11 estudos',
    note: 'Referencias ja mapeadas para apoiar o modelo de risco.',
  },
]

const signals: Signal[] = [
  {
    title: 'Jaraqui acima do limite',
    description:
      'Campanhas recentes indicam concentracao proxima ao dobro do limite regulatorio para peixes nao predadores.',
    source: 'OXIOUUWI 2024',
    tone: 'critical',
  },
  {
    title: 'Seca extrema amplia a exposicao',
    description:
      'A perda de acesso ao rio muda a rotina de abastecimento e aumenta a vulnerabilidade em comunidades ja fragilizadas.',
    source: 'Baixo Rio Negro 2024',
    tone: 'warning',
  },
  {
    title: 'Agua acida favorece metilmercurio',
    description:
      'O pH baixo das aguas pretas, em torno de 4.5 em alguns trechos, favorece a forma mais toxica e bioacumulavel.',
    source: 'Referencia historica da bacia',
    tone: 'attention',
  },
  {
    title: 'Monitoramento segue fragmentado',
    description:
      'Sem juntar agua, peixe, biomarcador humano e contexto territorial, o risco chega tarde a gestao publica.',
    source: 'Diagnostico do projeto',
    tone: 'neutral',
  },
]

const layers: Layer[] = [
  {
    title: 'Se voce mora ou trabalha na regiao',
    description:
      'Acompanhe quando o risco aumenta na sua comunidade e quais cuidados ajudam a reduzir a exposicao.',
    icon: Users,
    bullets: [
      'Fique atento aos alertas locais sobre agua, pesca e seca extrema',
      'Procure orientacao na unidade de saude se houver sintomas neurologicos ou suspeita de exposicao',
      'Gestantes, criancas e familias com alto consumo de peixe precisam de atencao especial',
    ],
  },
  {
    title: 'Se voce atende pacientes',
    description:
      'Tenha apoio para triagem, vigilancia e encaminhamento com leitura territorial e contexto de exposicao.',
    icon: FlaskConical,
    bullets: [
      'Considere historico alimentar, comunidade de origem e grupos mais sensiveis',
      'Priorize gestantes, criancas e populacoes com alta dependencia de pescado',
      'Use a leitura do territorio para apoio ao acompanhamento e a vigilancia em saude',
    ],
  },
  {
    title: 'Se voce atua em campo',
    description:
      'Visualize onde a urgencia aumenta e quais comunidades merecem resposta mais rapida.',
    icon: BellRing,
    bullets: [
      'Priorize comunidades com seca extrema, isolamento e maior exposicao alimentar',
      'Cruze acesso a agua, consumo local e distancia da rede assistencial',
      'Use o painel para planejar visita, busca ativa e orientacao comunitaria',
    ],
  },
]

const factors: Factor[] = [
  {
    label: 'Mercurio em agua',
    weight: 25,
    detail: 'Sinaliza a pressao ambiental de base sobre o territorio.',
  },
  {
    label: 'Mercurio em peixes',
    weight: 40,
    detail: 'Tem maior peso pela relacao direta com a cadeia alimentar local.',
  },
  {
    label: 'Frequencia de consumo',
    weight: 20,
    detail: 'Mostra o quanto a exposicao alimentar e recorrente no cotidiano.',
  },
  {
    label: 'Vulnerabilidade territorial',
    weight: 15,
    detail: 'Considera isolamento, acesso a agua e capacidade de resposta em saude.',
  },
]

const communities: Community[] = [
  {
    name: 'Sao Gabriel da Cachoeira',
    area: 'Alto Rio Negro',
    population: '~47.000',
    focus: 'Consumo intenso de peixe local e maioria indigena',
    note: 'Trecho com alta sensibilidade social e necessidade de cobertura continua.',
    risk: 'critical',
  },
  {
    name: '34 comunidades do baixo Rio Negro',
    area: 'Manaus e entorno',
    population: '~5.000',
    focus: 'Seca extrema e pesca de subsistencia',
    note: '32 dessas comunidades perderam acesso direto ao rio no pico da seca.',
    risk: 'critical',
  },
  {
    name: 'Barcelos',
    area: 'Medio Rio Negro',
    population: '~27.000',
    focus: 'Consumo regular de jaraqui, tucunare e tambaqui',
    note: 'Concentra historico relevante de campanhas e leitura alimentar.',
    risk: 'high',
  },
  {
    name: 'Santa Isabel do Rio Negro',
    area: 'Alto Rio Negro',
    population: '~17.000',
    focus: 'Longa distancia e baixa densidade assistencial',
    note: 'Trecho com extensao grande e resposta mais lenta em situacoes criticas.',
    risk: 'high',
  },
  {
    name: 'Novo Airao',
    area: 'Baixo-medio Rio Negro',
    population: '~18.000',
    focus: 'Ponto relevante para piloto de articulacao municipal',
    note: 'Bom territorio para integrar vigilancia ambiental e atencao em saude.',
    risk: 'medium',
  },
]

const routeStops: Stop[] = [
  {
    name: 'Manaus / Baixo Rio Negro',
    detail: 'Pressao de seca extrema e comunidades isoladas.',
    position: 8,
    risk: 'critical',
  },
  {
    name: 'Novo Airao',
    detail: 'Entrada operacional para articulacao local.',
    position: 28,
    risk: 'medium',
  },
  {
    name: 'Barcelos',
    detail: 'Trecho com leitura alimentar e historico de campanhas.',
    position: 50,
    risk: 'high',
  },
  {
    name: 'Santa Isabel do Rio Negro',
    detail: 'Distancia longa e resposta assistencial mais lenta.',
    position: 73,
    risk: 'high',
  },
  {
    name: 'Sao Gabriel da Cachoeira',
    detail: 'Maior concentracao de vulnerabilidade na rota prioritaria.',
    position: 92,
    risk: 'critical',
  },
]

const evidenceBase: Evidence[] = [
  {
    title: 'Seasonal behavior of mercury species in waters and sediments from the Negro River basin',
    year: '2007',
    summary:
      'Ajuda a entender como as condicoes das aguas pretas alteram o comportamento do mercurio ao longo da bacia.',
  },
  {
    title: 'Primeiro IQA para rios amazonicos de aguas pretas',
    year: '2024',
    summary:
      'Abre caminho para ler qualidade da agua com parametros mais aderentes ao Rio Negro e ao debate sobre mercurio.',
  },
  {
    title: 'Drought forces Amazon Indigenous communities to drink mercury-tainted water',
    year: '2024',
    summary:
      'Reforca a ligacao entre evento extremo, acesso a agua e agravamento do risco em territorios vulneraveis.',
  },
]

const institutionalPartners = [
  'FIOCRUZ AMAZONIA',
  'INPA',
  'UFAM',
  'UEA',
  'UNESP',
  'HARVARD SEAS',
  'UNICAMP',
  'CONECTHUS',
]

const footerColumns = [
  {
    title: 'Acesso rapido',
    links: ['Como funciona', 'Mapa de risco', 'Comunidades', 'Parceiros'],
  },
  {
    title: 'Informacoes',
    links: ['Base cientifica', 'O problema', 'Risco no territorio', 'Orientacoes'],
  },
]

const riskLabel: Record<RiskTone, string> = {
  critical: 'Muito alto',
  high: 'Alto',
  medium: 'Moderado',
}

function App() {
  const heroWatch = communities.slice(0, 3)

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
            <a key={item.href} href={item.href}>
              {item.label}
            </a>
          ))}
        </nav>

        <div className="header-badge">
          <MapPinned size={16} />
          Amazonas | eixo Rio Negro
        </div>
      </header>

      <main className="site-main">
        <section className="hero" id="inicio">
          <div className="hero-copy">
            <span className="hero-eyebrow">Vigilancia ambiental e saude publica</span>
            <h1>
              O Rio Negro precisa de uma sala de situacao para o mercurio.
            </h1>
            <p className="hero-summary">
              Este portal reune alertas, orientacoes e leitura territorial para
              apoiar a populacao, profissionais de saude e agentes de campo no
              acompanhamento do risco por mercurio ao longo do Rio Negro.
            </p>

            <div className="hero-actions">
              <a className="button-primary" href="#painel">
                Ver painel de risco
                <ArrowRight size={18} />
              </a>
              <a className="button-secondary" href="#territorio">
                Explorar territorios
              </a>
            </div>

            <div className="hero-notes" aria-label="Dimensoes monitoradas">
              <span>Agua e sedimento</span>
              <span>Peixes consumidos</span>
              <span>Biomarcadores humanos</span>
              <span>Resposta territorial</span>
            </div>
          </div>

          <aside className="hero-board" aria-label="Radar imediato">
            <div className="board-top">
              <span className="board-tag">Radar imediato</span>
              <h2>Trechos que pedem leitura continua</h2>
              <p>
                A priorizacao combina contaminacao ambiental, dieta baseada em
                pescado e vulnerabilidade de acesso a saude e agua.
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
              <span>Biomarcador</span>
              <span>Territorio</span>
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
            <h2>O que esta em observacao agora no territorio.</h2>
            <p>
              Este painel resume os sinais que pedem mais atencao no Rio Negro
              e ajuda a identificar onde a vigilancia precisa ser reforcada.
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
                <article
                  key={signal.title}
                  className={`signal-card signal-${signal.tone}`}
                >
                  <div className="signal-head">
                    <div className="signal-icon">
                      <AlertTriangle size={18} />
                    </div>
                    <span>{signal.source}</span>
                  </div>
                  <h3>{signal.title}</h3>
                  <p>{signal.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section" id="orientacoes">
          <div className="section-intro">
            <span className="section-kicker">Orientacoes rapidas</span>
            <h2>Informacao util para quem vive, atende e atua no territorio.</h2>
            <p>
              Esta parte foi pensada para uso direto: apoio para a populacao,
              para profissionais de saude e para agentes que precisam agir no
              territorio.
            </p>
          </div>

          <div className="layer-grid">
            {layers.map((layer, index) => {
              const Icon = layer.icon

              return (
                <article key={layer.title} className="layer-card">
                  <div className="layer-head">
                    <span className="layer-number">0{index + 1}</span>
                    <div className="layer-icon">
                      <Icon size={22} />
                    </div>
                  </div>
                  <h3>{layer.title}</h3>
                  <p>{layer.description}</p>
                  <ul className="layer-list">
                    {layer.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                </article>
              )
            })}
          </div>
        </section>

        <section className="section" id="painel">
          <div className="section-intro">
            <span className="section-kicker">Painel de risco</span>
            <h2>Comunidades em observacao e sinais que elevam o risco.</h2>
            <p>
              O objetivo aqui e ajudar a leitura do territorio: quais sinais
              aumentam a preocupacao e quais comunidades pedem resposta mais
              rapida.
            </p>
          </div>

          <div className="panel-layout">
            <article className="risk-model">
              <div className="card-heading">
                <span className="minor-tag">Sinais acompanhados</span>
                <h3>O que aumenta a atencao em cada comunidade</h3>
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

              <div className="scale-row" aria-label="Escala de risco">
                <span className="scale-pill scale-medium">Moderado</span>
                <span className="scale-pill scale-high">Alto</span>
                <span className="scale-pill scale-critical">Muito alto</span>
              </div>
            </article>

            <article className="priority-card">
              <div className="card-heading">
                <span className="minor-tag">Monitoramento territorial</span>
                <h3>Comunidades que pedem mais atencao</h3>
              </div>

              <div className="priority-list">
                {communities.map((community, index) => (
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

        <section className="section" id="territorio">
          <div className="section-intro">
            <span className="section-kicker">Territorio priorizado</span>
            <h2>O Rio Negro aparece como corredor vivo, nao como detalhe visual.</h2>
            <p>
              O risco muda ao longo do rio. Por isso o layout agora usa o eixo
              territorial como parte central da experiencia, e nao como enfeite.
            </p>
          </div>

          <article className="corridor-card">
            <div className="corridor-head">
              <div>
                <span className="minor-tag">Eixo principal</span>
                <h3>Manaus, Novo Airao, Barcelos, Santa Isabel e Sao Gabriel</h3>
              </div>
              <p>700 km de monitoramento prioritario</p>
            </div>

            <div className="corridor-track">
              <div className="corridor-line" />
              {routeStops.map((stop) => {
                const stopStyle: CSSProperties = {
                  left: `${stop.position}%`,
                }

                return (
                  <article key={stop.name} className="corridor-stop" style={stopStyle}>
                    <div className={`corridor-dot dot-${stop.risk}`} />
                    <div className="corridor-cardlet">
                      <strong>{stop.name}</strong>
                      <span className={`risk-pill risk-${stop.risk}`}>
                        {riskLabel[stop.risk]}
                      </span>
                      <p>{stop.detail}</p>
                    </div>
                  </article>
                )
              })}
            </div>
          </article>
        </section>

        <section className="section" id="ciencia">
          <div className="section-intro">
            <span className="section-kicker">Base cientifica</span>
            <h2>Informacao forte continua no centro do site.</h2>
            <p>
              As referencias abaixo ajudam profissionais e gestores a entender o
              contexto ambiental e sanitario por tras dos alertas.
            </p>
          </div>

          <div className="evidence-grid">
            {evidenceBase.map((item) => (
              <article key={item.title} className="evidence-card">
                <div className="evidence-head">
                  <BookOpen size={18} />
                  <span>{item.year}</span>
                </div>
                <h3>{item.title}</h3>
                <p>{item.summary}</p>
              </article>
            ))}
          </div>
        </section>

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
              <strong>Inovatech 2026</strong>
              <p>
                Plataforma preditiva de saude publica para monitoramento de
                mercurio e analise de risco de intoxicacao em comunidades
                ribeirinhas e indigenas da Amazonia Brasileira.
              </p>

              <div className="footer-tags">
                <span>conecthus.org.br</span>
                <span>Rio Negro · AM</span>
                <span>2023-2026</span>
              </div>
            </div>

            <div className="footer-columns">
              {footerColumns.map((column) => (
                <div key={column.title} className="footer-column">
                  <h3>{column.title}</h3>
                  <ul>
                    {column.links.map((link) => (
                      <li key={link}>{link}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </footer>
        </section>
      </main>
    </div>
  )
}

export default App
