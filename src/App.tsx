import type { CSSProperties } from 'react'
import type { LucideIcon } from 'lucide-react'
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BellRing,
  Binary,
  BookOpen,
  Database,
  Fish,
  FlaskConical,
  MapPinned,
  Radar,
  ShieldAlert,
  Users,
  Waves,
} from 'lucide-react'
import './App.css'

type Stat = {
  label: string
  value: string
  detail: string
}

type AlertTone = 'critical' | 'warning' | 'watch' | 'info'

type AlertCard = {
  title: string
  description: string
  source: string
  tone: AlertTone
}

type Pillar = {
  title: string
  description: string
  icon: LucideIcon
  tags: string[]
}

type Factor = {
  label: string
  weight: string
  colorClass: string
  description: string
}

type SnapshotCard = {
  label: string
  value: string
  change: string
}

type RiverPoint = {
  name: string
  risk: string
  position: number
  population: string
}

type Community = {
  name: string
  stretch: string
  population: string
  risk: 'muito-alto' | 'alto' | 'moderado'
  species: string
  note: string
}

type Evidence = {
  title: string
  year: string
  summary: string
}

type IntegrationBlock = {
  title: string
  description: string
  icon: LucideIcon
  items: string[]
}

const stats: Stat[] = [
  {
    label: 'Pessoas mais expostas',
    value: '~120 mil',
    detail: 'Comunidades ribeirinhas e indígenas em rota prioritária.',
  },
  {
    label: 'Trecho monitorado',
    value: '700 km',
    detail: 'Eixo Manaus até Santa Isabel do Rio Negro.',
  },
  {
    label: 'Janela crítica observada',
    value: '32/34',
    detail: 'Comunidades do baixo Rio Negro isoladas durante a seca extrema.',
  },
  {
    label: 'Base científica inicial',
    value: '11 estudos',
    detail: 'Referências já mapeadas no material legado do projeto.',
  },
]

const alertCards: AlertCard[] = [
  {
    title: 'Jaraqui acima do limite',
    description:
      'Campanhas recentes apontam jaraqui com concentração próxima ao dobro do limite regulatório para não-predadores.',
    source: 'OXIOUUWI · 2024',
    tone: 'critical',
  },
  {
    title: 'Seca extrema aumenta a exposição',
    description:
      'Com menor volume de água e acesso restrito ao rio, a vulnerabilidade das comunidades cresce e o risco operacional sobe.',
    source: 'Baixo Rio Negro · 2024',
    tone: 'warning',
  },
  {
    title: 'pH ácido favorece metilmercúrio',
    description:
      'As águas pretas do Rio Negro criam condições propícias para a forma mais tóxica e bioacumulável do contaminante.',
    source: 'Bisinoti et al. · Referência histórica',
    tone: 'watch',
  },
  {
    title: 'Monitoramento ainda fragmentado',
    description:
      'Sem integração entre dado ambiental, biomarcador humano e perfil alimentar, o risco segue invisível para parte da rede de saúde.',
    source: 'Diagnóstico do projeto',
    tone: 'info',
  },
]

const pillars: Pillar[] = [
  {
    title: 'Monitoramento ambiental',
    description:
      'Entrada de dados de água, sedimento e solo ripário com histórico de campanha e recorte geográfico.',
    icon: Waves,
    tags: ['Lumex', 'Tekran', 'ICP-MS', 'Coletas sazonais'],
  },
  {
    title: 'Monitoramento clínico',
    description:
      'Biomarcadores, grupos vulneráveis, teletriagem e histórico de sintomas para priorização em campo.',
    icon: FlaskConical,
    tags: ['Hg capilar', 'Gestantes', 'Crianças', 'Telemedicina'],
  },
  {
    title: 'Sistema preditivo',
    description:
      'Camada analítica para combinar variáveis ambientais, alimentares e sociodemográficas em um índice de risco.',
    icon: Radar,
    tags: ['Heatmap', 'Alertas', 'Escalonamento', 'Risco por comunidade'],
  },
]

const riskFactors: Factor[] = [
  {
    label: 'Mercúrio ambiental',
    weight: '25%',
    colorClass: 'factor-teal',
    description: 'Mede a pressão inicial sobre água e sedimento.',
  },
  {
    label: 'Mercúrio em peixes',
    weight: '40%',
    colorClass: 'factor-amber',
    description: 'Foco principal pela relevância na bioacumulação e na dieta local.',
  },
  {
    label: 'Frequência de consumo',
    weight: '20%',
    colorClass: 'factor-cyan',
    description: 'Diferencia comunidades com dependência alimentar mais intensa do pescado.',
  },
  {
    label: 'Vulnerabilidade social',
    weight: '15%',
    colorClass: 'factor-coral',
    description: 'Considera isolamento, acesso à saúde e presença de grupos prioritários.',
  },
]

const snapshotCards: SnapshotCard[] = [
  {
    label: 'Alertas em aberto',
    value: '08',
    change: '+3 após seca extrema',
  },
  {
    label: 'Campanhas consolidadas',
    value: '14',
    change: '4 prontas para ingestão por API',
  },
  {
    label: 'Comunidades em risco alto',
    value: '05',
    change: 'priorização ativa',
  },
  {
    label: 'Fontes de dados previstas',
    value: '03',
    change: 'ambiental, clínica e territorial',
  },
]

const riverPoints: RiverPoint[] = [
  {
    name: 'Manaus / Baixo Rio Negro',
    risk: 'Muito alto na seca',
    position: 9,
    population: '34 comunidades afetadas',
  },
  {
    name: 'Novo Airão',
    risk: 'Moderado',
    position: 27,
    population: '~18 mil pessoas',
  },
  {
    name: 'Barcelos',
    risk: 'Alto',
    position: 48,
    population: '~27 mil pessoas',
  },
  {
    name: 'Santa Isabel do Rio Negro',
    risk: 'Alto',
    position: 72,
    population: '~17 mil pessoas',
  },
  {
    name: 'São Gabriel da Cachoeira',
    risk: 'Muito alto',
    position: 92,
    population: '~47 mil pessoas',
  },
]

const communities: Community[] = [
  {
    name: 'São Gabriel da Cachoeira',
    stretch: 'Alto Rio Negro',
    population: '~47.000',
    risk: 'muito-alto',
    species: 'Peixes locais consumidos diariamente',
    note: 'Maioria indígena e necessidade de cobertura contínua.',
  },
  {
    name: '34 comunidades do Baixo Rio Negro',
    stretch: 'Manaus e entorno',
    population: '~5.000',
    risk: 'muito-alto',
    species: 'Pesca de subsistência',
    note: '32 delas ficaram isoladas no pico da seca extrema.',
  },
  {
    name: 'Barcelos',
    stretch: 'Médio Rio Negro',
    population: '~27.000',
    risk: 'alto',
    species: 'Jaraqui, tucunaré, pacu, aruanã, tambaqui',
    note: 'Concentra histórico relevante de estudos e consumo local.',
  },
  {
    name: 'Santa Isabel do Rio Negro',
    stretch: 'Alto Rio Negro',
    population: '~17.000',
    risk: 'alto',
    species: 'Tucunaré, jaraqui e matrinxã',
    note: 'Trecho extenso com baixa densidade assistencial.',
  },
  {
    name: 'Novo Airão',
    stretch: 'Baixo-médio Rio Negro',
    population: '~18.000',
    risk: 'moderado',
    species: 'Pescado variado de abastecimento local',
    note: 'Bom ponto para piloto de integração com rede municipal.',
  },
]

const evidenceBase: Evidence[] = [
  {
    title: 'Seasonal behavior of mercury species in waters and sediments from the Negro River basin',
    year: '2007',
    summary:
      'Base importante para entender como as condições ambientais do Rio Negro influenciam a dinâmica do mercúrio.',
  },
  {
    title: 'Primeiro IQA para rios amazônicos de águas pretas',
    year: '2024',
    summary:
      'Abre espaço para incorporar mercúrio como parâmetro relevante em uma leitura mais realista da qualidade da água local.',
  },
  {
    title: 'Drought forces Amazon Indigenous communities to drink mercury-tainted water',
    year: '2024',
    summary:
      'Reforça a urgência de cruzar evento climático, acesso à água e vulnerabilidade humana no mesmo painel.',
  },
]

const integrationBlocks: IntegrationBlock[] = [
  {
    title: 'Camada de ingestão',
    description:
      'Estruturei o frontend para receber listas de campanhas, comunidades, alertas e medições sem reescrever a interface.',
    icon: Database,
    items: [
      '`GET /communities` para cards e mapa',
      '`GET /alerts` para painel operacional',
      '`GET /measurements` para séries e filtros',
    ],
  },
  {
    title: 'Modelo analítico',
    description:
      'O índice de risco está representado visualmente e pode ser recalculado no backend quando a equipe de dados ligar banco e regras.',
    icon: Binary,
    items: [
      'Peso por variável',
      'Faixas de classificação',
      'Multiplicadores por grupo prioritário',
    ],
  },
  {
    title: 'Acionamento da saúde',
    description:
      'A seção de status já comunica prioridades operacionais e pode evoluir para notificações reais e rotas de intervenção.',
    icon: BellRing,
    items: [
      'Fila de alertas por município',
      'Histórico de respostas em campo',
      'Encaminhamento para teleatendimento',
    ],
  },
]

const navItems = [
  { href: '#contexto', label: 'Contexto' },
  { href: '#arquitetura', label: 'Sistema' },
  { href: '#indicadores', label: 'Indicadores' },
  { href: '#territorio', label: 'Território' },
]

function App() {
  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">
            <ShieldAlert size={18} strokeWidth={2.2} />
          </div>
          <div>
            <p className="brand-kicker">Inovatech 2026</p>
            <strong>Mercúrio no Rio Negro</strong>
          </div>
        </div>

        <nav className="topnav" aria-label="Seções principais">
          {navItems.map((item) => (
            <a key={item.href} href={item.href}>
              {item.label}
            </a>
          ))}
        </nav>

        <div className="status-pill">
          <Activity size={16} />
          Visão demonstrativa
        </div>
      </header>

      <main>
        <section className="hero-section" id="inicio">
          <div className="hero-copy">
            <span className="eyebrow">Plataforma preditiva de saúde pública</span>
            <h1>
              Plataforma de vigilância do mercúrio no Rio Negro.
            </h1>
            <p className="hero-text">
              Um sistema para integrar medições ambientais, biomarcadores humanos,
              consumo de pescado e vulnerabilidade territorial em um painel único de
              decisão para comunidades ribeirinhas e indígenas.
            </p>

            <div className="hero-actions">
              <a className="primary-action" href="#indicadores">
                Ver painel de risco
                <ArrowRight size={18} />
              </a>
              <a className="secondary-action" href="#integracao">
                Ver pontos de integração
              </a>
            </div>

            <div className="stats-grid">
              {stats.map((stat) => (
                <article key={stat.label} className="stat-card">
                  <span className="stat-label">{stat.label}</span>
                  <strong className="stat-value">{stat.value}</strong>
                  <p>{stat.detail}</p>
                </article>
              ))}
            </div>
          </div>

          <aside className="hero-panel" aria-label="Resumo operacional">
            <div className="panel-header">
              <span className="panel-tag">Painel de risco</span>
              <span className="panel-badge">Demo funcional</span>
            </div>

            <div className="signal-core">
              <div>
                <p className="signal-kicker">Leitura prioritária</p>
                <h2>Comunidades com maior pressão ambiental e social</h2>
              </div>
              <p className="signal-summary">
                A priorização combina mercúrio em água e peixes, dependência alimentar,
                isolamento territorial e acesso à rede de saúde.
              </p>
            </div>

            <div className="snapshot-grid">
              {snapshotCards.map((card) => (
                <article key={card.label} className="snapshot-card">
                  <span>{card.label}</span>
                  <strong>{card.value}</strong>
                  <p>{card.change}</p>
                </article>
              ))}
            </div>

            <div className="flow-card">
              <div className="flow-head">
                <Database size={18} />
                <span>Cadeia de decisão</span>
              </div>
              <div className="flow-steps" aria-hidden="true">
                <span>coleta</span>
                <span>normalização</span>
                <span>risco</span>
                <span>alerta</span>
              </div>
            </div>
          </aside>
        </section>

        <section className="content-section" id="contexto">
          <div className="section-heading">
            <span className="section-tag">Contexto do problema</span>
            <h2>O risco fica invisível quando os dados estão soltos.</h2>
            <p>
              O projeto faz sentido quando território, saúde e meio ambiente aparecem
              juntos. A proposta do site é mostrar essa conexão de forma clara para
              pesquisa, gestão e ação em campo.
            </p>
          </div>

          <div className="alert-grid">
            {alertCards.map((alert) => (
              <article key={alert.title} className={`alert-card tone-${alert.tone}`}>
                <div className="alert-icon">
                  <AlertTriangle size={18} />
                </div>
                <div>
                  <h3>{alert.title}</h3>
                  <p>{alert.description}</p>
                  <span>{alert.source}</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="content-section" id="arquitetura">
          <div className="section-heading">
            <span className="section-tag">Arquitetura do sistema</span>
            <h2>Três camadas para monitorar, analisar e agir.</h2>
            <p>
              A solução foi organizada como produto: entrada de dados, leitura de risco
              e resposta operacional dentro do mesmo ecossistema.
            </p>
          </div>

          <div className="pillar-grid">
            {pillars.map((pillar) => {
              const Icon = pillar.icon

              return (
                <article key={pillar.title} className="pillar-card">
                  <div className="pillar-head">
                    <div className="pillar-icon">
                      <Icon size={22} />
                    </div>
                    <h3>{pillar.title}</h3>
                  </div>
                  <p>{pillar.description}</p>
                  <div className="tag-list">
                    {pillar.tags.map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </div>
                </article>
              )
            })}
          </div>
        </section>

        <section className="content-section intelligence-section" id="indicadores">
          <div className="section-heading">
            <span className="section-tag">Lógica analítica</span>
            <h2>O painel traduz variáveis dispersas em prioridade de intervenção.</h2>
            <p>
              O índice de risco organiza o raciocínio da plataforma: primeiro mede a
              pressão ambiental, depois estima exposição alimentar e cruza isso com
              fatores de vulnerabilidade.
            </p>
          </div>

          <div className="intelligence-grid">
            <article className="formula-card">
              <div className="formula-head">
                <div>
                  <span className="mini-tag">IRC v1.0</span>
                  <h3>Índice de risco por comunidade</h3>
                </div>
                <div className="formula-badge">
                  <Radar size={18} />
                  Modelo inicial
                </div>
              </div>

              <div className="formula-expression">
                <span>IRC</span>
                <span>=</span>
                <span>Hg_água</span>
                <span>+</span>
                <span>Hg_peixe</span>
                <span>+</span>
                <span>consumo</span>
                <span>+</span>
                <span>vulnerabilidade</span>
              </div>

              <div className="factor-list">
                {riskFactors.map((factor) => (
                  <article key={factor.label} className="factor-card">
                    <div className="factor-meta">
                      <div className={`factor-dot ${factor.colorClass}`} />
                      <strong>{factor.label}</strong>
                      <span>{factor.weight}</span>
                    </div>
                    <p>{factor.description}</p>
                  </article>
                ))}
              </div>
            </article>

            <article className="support-card">
              <div className="support-head">
                <MapPinned size={20} />
                <h3>Quais sinais alimentam a leitura territorial</h3>
              </div>
              <div className="support-list">
                <div>
                  <span>Ambiental</span>
                  <p>Concentração em água, solo ripário, sedimento e sazonalidade.</p>
                </div>
                <div>
                  <span>Biota</span>
                  <p>Espécies consumidas, frequência alimentar e bioacumulação.</p>
                </div>
                <div>
                  <span>Clínico</span>
                  <p>Hg capilar, urinário, sintomas, gestação e idade sensível.</p>
                </div>
                <div>
                  <span>Territorial</span>
                  <p>Isolamento, acesso à água, cobertura assistencial e evento extremo.</p>
                </div>
              </div>
            </article>
          </div>
        </section>

        <section className="content-section territory-section" id="territorio">
          <div className="section-heading">
            <span className="section-tag">Distribuição territorial</span>
            <h2>O eixo do Rio Negro organiza a narrativa territorial da plataforma.</h2>
            <p>
              O território não entra como detalhe visual. Ele é a estrutura central da
              experiência, porque o risco muda conforme distância, sazonalidade e acesso.
            </p>
          </div>

          <div className="river-card">
            <div className="river-head">
              <div>
                <span className="mini-tag">Trecho monitorado</span>
                <h3>Manaus até São Gabriel da Cachoeira</h3>
              </div>
              <div className="river-scale">
                <MapPinned size={18} />
                700 km priorizados
              </div>
            </div>

            <div className="river-track">
              <div className="river-line" />
              {riverPoints.map((point, index) => {
                const pointStyle: CSSProperties = {
                  left: `${point.position}%`,
                  top: index % 2 === 0 ? '34%' : '68%',
                }

                return (
                  <article key={point.name} className="river-point" style={pointStyle}>
                    <div className="river-node" />
                    <div className="river-label">
                      <strong>{point.name}</strong>
                      <span>{point.risk}</span>
                      <p>{point.population}</p>
                    </div>
                  </article>
                )
              })}
            </div>
          </div>

          <div className="community-grid">
            {communities.map((community) => (
              <article key={community.name} className="community-card">
                <div className="community-head">
                  <div>
                    <h3>{community.name}</h3>
                    <p>{community.stretch}</p>
                  </div>
                  <span className={`risk-chip risk-${community.risk}`}>
                    {community.risk === 'muito-alto'
                      ? 'Muito alto'
                      : community.risk === 'alto'
                        ? 'Alto'
                        : 'Moderado'}
                  </span>
                </div>

                <dl className="community-meta">
                  <div>
                    <dt>População estimada</dt>
                    <dd>{community.population}</dd>
                  </div>
                  <div>
                    <dt>Espécies / consumo</dt>
                    <dd>{community.species}</dd>
                  </div>
                </dl>

                <p className="community-note">{community.note}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="content-section evidence-section" id="evidencias">
          <div className="section-heading">
            <span className="section-tag">Base de evidências</span>
            <h2>Ciência, campo e contexto social sustentam a proposta do sistema.</h2>
            <p>
              A plataforma se apoia em estudos sobre comportamento do mercúrio, qualidade
              da água, eventos extremos e impactos sobre povos da Amazônia.
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

        <section className="content-section integration-section" id="integracao">
          <div className="section-heading">
            <span className="section-tag">Expansão do sistema</span>
            <h2>Estrutura pronta para crescer com backend, banco e automações.</h2>
            <p>
              A experiência visual já separa entidades, fluxos e módulos de decisão para
              facilitar a próxima etapa de desenvolvimento com API e persistência real.
            </p>
          </div>

          <div className="integration-grid">
            {integrationBlocks.map((block) => {
              const Icon = block.icon

              return (
                <article key={block.title} className="integration-card">
                  <div className="integration-head">
                    <div className="integration-icon">
                      <Icon size={20} />
                    </div>
                    <h3>{block.title}</h3>
                  </div>
                  <p>{block.description}</p>
                  <ul>
                    {block.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </article>
              )
            })}
          </div>
        </section>
      </main>

      <footer className="page-footer">
        <div>
          <strong>Inovatech 2026</strong>
          <p>Plataforma de vigilância e priorização de risco por mercúrio no Rio Negro.</p>
        </div>
        <div className="footer-icons" aria-hidden="true">
          <Users size={18} />
          <Fish size={18} />
          <Waves size={18} />
        </div>
      </footer>
    </div>
  )
}

export default App
