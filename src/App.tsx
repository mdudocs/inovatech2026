import type { CSSProperties } from 'react'
import type { LucideIcon } from 'lucide-react'
import {
  AlertTriangle,
  ArrowRight,
  BellRing,
  BookOpen,
  Fish,
  FlaskConical,
  MapPinned,
  Radar,
  ShieldAlert,
  Users,
  Waves,
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

type Module = {
  title: string
  description: string
  icon: LucideIcon
  items: string[]
}

const navItems = [
  { href: '#contexto', label: 'Contexto' },
  { href: '#painel', label: 'Painel' },
  { href: '#territorio', label: 'Territorio' },
  { href: '#ciencia', label: 'Ciencia' },
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
    title: 'Observacao ambiental',
    description:
      'Coleta e leitura de agua, sedimento e solo ripario para entender pressao ambiental e sazonalidade.',
    icon: Waves,
    bullets: [
      'Campanhas por trecho e por periodo de seca ou cheia',
      'Historico de mercurio em agua e sedimento',
      'Pontos fixos para comparacao ao longo do tempo',
    ],
  },
  {
    title: 'Vigilancia clinica',
    description:
      'Biomarcadores, grupos sensiveis e registro de sintomas para aproximar a ciencia do cuidado.',
    icon: FlaskConical,
    bullets: [
      'Hg capilar, urinario e outros biomarcadores',
      'Priorizacao de gestantes, criancas e comunidades isoladas',
      'Triagem e acompanhamento em articulacao com a rede local',
    ],
  },
  {
    title: 'Inteligencia territorial',
    description:
      'Cruza exposicao ambiental, dieta, vulnerabilidade e acesso a servicos para gerar prioridade real.',
    icon: Radar,
    bullets: [
      'Indice de risco por comunidade',
      'Watchlist para leitura rapida do territorio',
      'Alertas para apoiar resposta de campo e saude publica',
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

const modules: Module[] = [
  {
    title: 'Coleta em campo',
    description:
      'A camada que reune campanhas ambientais, pontos de amostragem e historico por trecho.',
    icon: Waves,
    items: [
      'Agua superficial, sedimento e solo ripario',
      'Leitura por campanha e por sazonalidade',
      'Rastro temporal para comparacao de risco',
    ],
  },
  {
    title: 'Leitura de risco',
    description:
      'A parte do sistema que transforma variaveis dispersas em prioridade objetiva por comunidade.',
    icon: BellRing,
    items: [
      'Indice por peso de exposicao e vulnerabilidade',
      'Watchlist de comunidades mais sensiveis',
      'Historico de sinais que acenderam o alerta',
    ],
  },
  {
    title: 'Resposta em saude',
    description:
      'O modulo pensado para ligar vigilancia, cuidado e acao no territorio.',
    icon: Users,
    items: [
      'Triagem de grupos prioritarios',
      'Acompanhamento de biomarcadores humanos',
      'Encaminhamento para equipes locais e teleapoio',
    ],
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
              O site foi reorganizado como plataforma de observacao: agua, peixe,
              biomarcadores humanos e vulnerabilidade territorial aparecem juntos
              para mostrar onde o risco cresce primeiro e onde a resposta precisa
              chegar antes.
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

        <section className="section" id="contexto">
          <div className="section-intro">
            <span className="section-kicker">Por que existe</span>
            <h2>Sem juntar territorio e saude, o risco fica invisivel.</h2>
            <p>
              O projeto faz sentido quando a leitura ambiental deixa de ser uma
              planilha isolada e passa a conversar com dieta, distancia, seca
              extrema e resposta assistencial.
            </p>
          </div>

          <div className="context-layout">
            <article className="context-story">
              <p>
                A presenca de mercurio na Amazonia nao e apenas um problema de
                laboratorio. Ela entra no cotidiano das comunidades pela agua,
                pela cadeia trofica e pela dependencia do peixe como principal
                fonte proteica.
              </p>
              <p>
                Em alguns grupos, o pescado responde por quase toda a dieta. Por
                isso, quando o sistema cruza mercurio em agua, especies consumidas
                e grupos mais sensiveis, ele deixa de ser um painel tecnico e vira
                ferramenta de decisao.
              </p>

              <blockquote className="context-quote">
                Sem integrar agua, peixe, biomarcadores e distancia da rede de
                saude, a prioridade chega tarde demais.
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

        <section className="section" id="sistema">
          <div className="section-intro">
            <span className="section-kicker">Camadas do sistema</span>
            <h2>O site agora fala a lingua do produto, nao a lingua do template.</h2>
            <p>
              Em vez de uma landing generica, a estrutura foi organizada em tres
              blocos que refletem a logica real do projeto: observar, interpretar
              e agir.
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
            <h2>O indice vira leitura clara, e nao formula escondida.</h2>
            <p>
              O painel mostra como o risco por comunidade e construido e onde a
              equipe deve olhar primeiro. Isso preserva o conteudo importante e
              melhora muito a leitura do site.
            </p>
          </div>

          <div className="panel-layout">
            <article className="risk-model">
              <div className="card-heading">
                <span className="minor-tag">IRC v1.0</span>
                <h3>Composicao do indice de risco</h3>
              </div>

              <div className="formula-line" aria-hidden="true">
                <span>IRC</span>
                <span>=</span>
                <span>agua</span>
                <span>+</span>
                <span>peixe</span>
                <span>+</span>
                <span>consumo</span>
                <span>+</span>
                <span>territorio</span>
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
                <span className="minor-tag">Watchlist territorial</span>
                <h3>Comunidades que concentram urgencia</h3>
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
              As referencias continuam presentes, mas agora entram como parte da
              narrativa do observatorio e nao como bloco solto no fim da pagina.
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

        <section className="section section-modules" id="modulos">
          <div className="section-intro">
            <span className="section-kicker">Como o ecossistema evolui</span>
            <h2>Coleta, leitura e resposta continuam claros no desenho do site.</h2>
            <p>
              Essas frentes mantem a proposta coerente com o projeto e deixam a
              experiencia pronta para crescer depois sem perder direcao.
            </p>
          </div>

          <div className="module-grid">
            {modules.map((module) => {
              const Icon = module.icon

              return (
                <article key={module.title} className="module-card">
                  <div className="module-head">
                    <div className="module-icon">
                      <Icon size={22} />
                    </div>
                    <h3>{module.title}</h3>
                  </div>
                  <p>{module.description}</p>
                  <ul className="module-list">
                    {module.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </article>
              )
            })}
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div>
          <strong>Inovatech 2026</strong>
          <p>
            Plataforma para monitoramento territorial do mercurio no Rio Negro.
          </p>
        </div>
        <div className="footer-badge" aria-hidden="true">
          <Fish size={18} />
          <Users size={18} />
          <Waves size={18} />
        </div>
      </footer>
    </div>
  )
}

export default App
