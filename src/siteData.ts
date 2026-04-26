// Base de conteudo do portal publico.
// Reune textos, metricas, comunidades, estudos e configuracoes visuais do site.
export type RiskTone = 'critical' | 'high' | 'medium'
export type SignalTone = 'critical' | 'warning' | 'attention' | 'neutral'
export type AudienceIcon = 'users' | 'flask' | 'bell'
export type MapLegendTone = 'low' | 'medium' | 'high' | 'critical'
export type CommunityRiskTone =
  | 'critical'
  | 'high'
  | 'elevated'
  | 'medium'
  | 'low'
export type StudyStatusTone = 'yes' | 'no' | 'analysis'
export type MethodTone = 'teal' | 'gold' | 'violet' | 'coral'

export type NavItem = {
  to: string
  label: string
  end?: boolean
}

export type QuickAccessCard = {
  title: string
  description: string
}

export type Stat = {
  label: string
  value: string
  note: string
}

export type Signal = {
  title: string
  description: string
  source: string
  tone: SignalTone
}

export type AudienceLayer = {
  title: string
  description: string
  icon: AudienceIcon
  bullets: string[]
}

export type Factor = {
  label: string
  weight: number
  detail: string
}

export type PriorityCommunity = {
  name: string
  area: string
  population: string
  focus: string
  note: string
  risk: RiskTone
}

export type Stop = {
  name: string
  detail: string
  area: string
  population: string
  mercurySignal: string
  exposure: string
  guidance: string
  refs: string
  x: number
  y: number
  risk: RiskTone
  labelX: number
  labelY: number
  labelAnchor?: 'start' | 'middle' | 'end'
}

export type TerritoryMarker = {
  name: string
  detail: string
  area: string
  population: string
  mercurySignal: string
  exposure: string
  guidance: string
  refs: string
  x: number
  y: number
  risk: RiskTone
  labelX: number
  labelY: number
  labelAnchor?: 'start' | 'middle' | 'end'
}

export type ProblemAlert = {
  tone: 'critical' | 'warning' | 'info'
  title: string
  description: string
  source: string
}

export type MonitorStep = {
  number: string
  tone: 'teal' | 'gold' | 'violet'
  title: string
  description: string
  tags: string[]
}

export type MethodField = {
  key: string
  value: string
  badge: 'Req.' | 'Cond.' | 'Opt.'
}

export type MethodAxis = {
  tone: MethodTone
  title: string
  description: string
  fields: MethodField[]
}

export type RiskScaleGuide = {
  label: string
  tone: CommunityRiskTone
  detail: string
}

export type CommunityRow = {
  name: string
  area: string
  population: string
  note?: string
  riskLabel: string
  riskTone: CommunityRiskTone
  species: string
  refs: string
}

export type Study = {
  id: string
  title: string
  authors: string
  year: string
  meta: string[]
  findings: string
  statusLabel: string
  statusTone: StudyStatusTone
}

export type Researcher = {
  initials: string
  name: string
  institution: string
  specialty: string
  period: string
}

export type FooterColumn = {
  title: string
  links: Array<{
    label: string
    to: string
  }>
}

export const navItems: NavItem[] = [
  { to: '/', label: 'Inicio', end: true },
  { to: '/contexto', label: 'Contexto' },
  { to: '/painel', label: 'Painel' },
  { to: '/comunidades', label: 'Comunidades' },
  { to: '/ciencia', label: 'Ciencia' },
]

export const quickAccessCards: QuickAccessCard[] = [
  {
    title: 'Quando procurar atendimento',
    description:
      'Em caso de tremores, dormencia, alteracao visual, dificuldade de coordenacao ou suspeita de exposicao frequente.',
  },
  {
    title: 'Quem deve ter mais atencao',
    description:
      'Gestantes, criancas, familias com alto consumo de peixe e comunidades em seca extrema ou isolamento.',
  },
  {
    title: 'Para que serve este portal',
    description:
      'Acompanhar alertas, entender o risco por comunidade e apoiar orientacao, triagem e vigilancia no territorio.',
  },
]

export const stats: Stat[] = [
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

export const signals: Signal[] = [
  {
    title: 'Jaraqui acima do limite',
    description:
      'Campanhas recentes indicam concentracao proxima ao dobro do limite regulatorio para peixes nao predadores.',
    source: 'HG-2024-002',
    tone: 'critical',
  },
  {
    title: 'Seca extrema amplia a exposicao',
    description:
      'A perda de acesso ao rio muda a rotina de abastecimento e aumenta a vulnerabilidade em comunidades ja fragilizadas.',
    source: 'HG-2024-011',
    tone: 'warning',
  },
  {
    title: 'Agua acida favorece metilmercurio',
    description:
      'O pH baixo das aguas pretas, em torno de 4.5 em alguns trechos, favorece a forma mais toxica e bioacumulavel.',
    source: 'HG-REF-007',
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

export const signalToneMeta: Record<
  SignalTone,
  { label: string; action: string }
> = {
  critical: {
    label: 'Alerta maximo',
    action:
      'Reforcar triagem imediata, orientar familias com maior consumo de peixe e priorizar busca ativa.',
  },
  warning: {
    label: 'Alerta alto',
    action:
      'Aumentar vigilancia local, revisar acesso a agua segura e comunicar riscos nas comunidades proximas.',
  },
  attention: {
    label: 'Atencao',
    action:
      'Manter coleta e monitoramento frequentes para evitar que o quadro avance sem resposta rapida.',
  },
  neutral: {
    label: 'Em observacao',
    action:
      'Consolidar dados de campo e manter o territorio sob acompanhamento continuo.',
  },
}

export const audienceLayers: AudienceLayer[] = [
  {
    title: 'Se voce mora ou trabalha na regiao',
    description:
      'Acompanhe quando o risco aumenta na sua comunidade e quais cuidados ajudam a reduzir a exposicao.',
    icon: 'users',
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
    icon: 'flask',
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
    icon: 'bell',
    bullets: [
      'Priorize comunidades com seca extrema, isolamento e maior exposicao alimentar',
      'Cruze acesso a agua, consumo local e distancia da rede assistencial',
      'Use o painel para planejar visita, busca ativa e orientacao comunitaria',
    ],
  },
]

export const factors: Factor[] = [
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

export const priorityCommunities: PriorityCommunity[] = [
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

export const routeStops: Stop[] = [
  {
    name: 'Manaus / Baixo Rio Negro',
    detail: 'Pressao de seca extrema e comunidades isoladas.',
    area: 'Baixo Rio Negro',
    population: '~5.000 pessoas nas comunidades priorizadas',
    mercurySignal: 'Seca extrema pode concentrar exposicao por agua e pesca de subsistencia.',
    exposure: 'Familias ribeirinhas com consumo frequente de pescado local.',
    guidance: 'Priorizar orientacao comunitaria, agua segura e triagem de gestantes e criancas.',
    refs: 'HG-2024-011; HG-2024-002',
    x: 122,
    y: 217,
    risk: 'critical',
    labelX: 16,
    labelY: 254,
    labelAnchor: 'start',
  },
  {
    name: 'Novo Airao',
    detail: 'Entrada operacional para articulacao local.',
    area: 'Baixo-medio Rio Negro',
    population: '~18.000 pessoas',
    mercurySignal: 'Ponto de articulacao para cruzar agua, peixe e visitas de campo.',
    exposure: 'Consumo de tucunare, jaraqui, pacu e surubim em rotina local.',
    guidance: 'Manter coletas periodicas e usar o territorio como piloto de vigilancia integrada.',
    refs: 'HG-2023-001; HG-2023-003; HG-2024-010',
    x: 306,
    y: 241,
    risk: 'medium',
    labelX: 306,
    labelY: 278,
  },
  {
    name: 'Barcelos',
    detail: 'Trecho com leitura alimentar e historico de campanhas.',
    area: 'Medio Rio Negro',
    population: '~27.000 pessoas',
    mercurySignal: 'Historico de campanhas com atencao para peixes consumidos na regiao.',
    exposure: 'Consumo regular de jaraqui, tucunare, tambaqui, pacu e aruana.',
    guidance: 'Reforcar comunicacao de risco alimentar e acompanhar grupos com alto consumo de peixe.',
    refs: 'HG-2023-001; HG-2024-002; HG-2024-008',
    x: 572,
    y: 196,
    risk: 'high',
    labelX: 572,
    labelY: 232,
  },
  {
    name: 'Santa Isabel do Rio Negro',
    detail: 'Distancia longa e resposta assistencial mais lenta.',
    area: 'Alto Rio Negro',
    population: '~17.000 pessoas',
    mercurySignal: 'Risco elevado pela combinacao de distancia, baixa densidade assistencial e pescado local.',
    exposure: 'Dependencia de especies locais como tucunare, jaraqui e matrinxa.',
    guidance: 'Planejar visitas com antecedencia e manter alerta para sintomas neurologicos.',
    refs: 'HG-2023-001; HG-2024-008',
    x: 904,
    y: 184,
    risk: 'high',
    labelX: 904,
    labelY: 220,
  },
  {
    name: 'Sao Gabriel da Cachoeira',
    detail: 'Maior concentracao de vulnerabilidade na rota prioritaria.',
    area: 'Alto Rio Negro',
    population: '~47.000 pessoas',
    mercurySignal: 'Area muito sensivel por consumo intenso de peixe local e maioria indigena.',
    exposure: 'Exposicao cronica possivel em familias com alta dependencia de pescado.',
    guidance: 'Priorizar biomarcadores humanos, busca ativa e orientacao para gestantes e criancas.',
    refs: 'HG-2023-009; Fiocruz ENSP 2023',
    x: 1110,
    y: 152,
    risk: 'critical',
    labelX: 990,
    labelY: 196,
    labelAnchor: 'start',
  },
]

export const territoryMarkers: TerritoryMarker[] = [
  {
    name: 'Pres. Figueiredo',
    detail: 'Area complementar de observacao ambiental com sinal de atencao alta.',
    area: 'Afluente Uatuma / Balbina',
    population: '~33.000 pessoas',
    mercurySignal: 'Reservatorio e sedimento com variacao sazonal de mercurio.',
    exposure: 'Consumo de pescado de Balbina e areas proximas.',
    guidance: 'Acompanhar sedimento, especie consumida e sazonalidade durante a seca.',
    refs: 'HG-2021-006',
    x: 238,
    y: 134,
    risk: 'high',
    labelX: 292,
    labelY: 128,
    labelAnchor: 'start',
  },
  {
    name: '34 comunidades',
    detail: 'Nucleo em seca extrema com necessidade de vigilancia territorial reforcada.',
    area: 'Baixo Rio Negro',
    population: '~5.000 pessoas',
    mercurySignal: '32 de 34 comunidades perderam acesso direto ao rio no pico da seca.',
    exposure: 'Risco por agua, isolamento e pesca de subsistencia em periodo critico.',
    guidance: 'Acionar resposta territorial, abastecimento seguro e acompanhamento clinico local.',
    refs: 'HG-2024-011',
    x: 206,
    y: 314,
    risk: 'critical',
    labelX: 206,
    labelY: 342,
  },
  {
    name: 'Manacapuru',
    detail: 'Ponto de transicao entre Manaus e comunidades acessadas por rio.',
    area: 'Baixo Solimoes',
    population: '~100.000 pessoas',
    mercurySignal: 'Pressao alimentar por pescado regional e deslocamento fluvial intenso.',
    exposure: 'Familias ribeirinhas e areas rurais com dependencia de transporte por agua.',
    guidance: 'Monitorar agua, peixe consumido localmente e comunidades isoladas em cheia ou seca.',
    refs: 'HG-2024-002; HG-2024-011',
    x: 170,
    y: 246,
    risk: 'high',
    labelX: 210,
    labelY: 250,
    labelAnchor: 'start',
  },
  {
    name: 'Careiro da Varzea',
    detail: 'Municipio de varzea com risco de isolamento por nivel do rio.',
    area: 'Entorno de Manaus / Rio Amazonas',
    population: '~30.000 pessoas',
    mercurySignal: 'Vulnerabilidade territorial por sazonalidade e dependencia de transporte fluvial.',
    exposure: 'Comunidades de varzea com pesca, agua superficial e acesso variavel a servicos.',
    guidance: 'Priorizar registros de coordenada, fotos de acesso e situacao de abastecimento.',
    refs: 'HG-2024-011',
    x: 158,
    y: 292,
    risk: 'high',
    labelX: 208,
    labelY: 292,
    labelAnchor: 'start',
  },
  {
    name: 'Autazes',
    detail: 'Territorio com comunidades dispersas e deslocamento sensivel na seca.',
    area: 'Madeira / Amazonas',
    population: '~40.000 pessoas',
    mercurySignal: 'Acompanhamento indicado por consumo local de pescado e vulnerabilidade de acesso.',
    exposure: 'Familias ribeirinhas, pescadores e comunidades rurais afastadas.',
    guidance: 'Mapear pontos de coleta em agua, peixe e relatos de acesso assistencial.',
    refs: 'HG-2024-002; HG-2024-011',
    x: 190,
    y: 332,
    risk: 'high',
    labelX: 236,
    labelY: 334,
    labelAnchor: 'start',
  },
  {
    name: 'Coari',
    detail: 'Polo do medio Solimoes com grande rede de comunidades fluviais.',
    area: 'Medio Solimoes',
    population: '~85.000 pessoas',
    mercurySignal: 'Trecho estrategico para leitura de pescado, agua e deslocamento assistencial.',
    exposure: 'Comunidades ribeirinhas com consumo frequente de peixe e longas rotas ate a sede.',
    guidance: 'Acompanhar coletas de peixe, agua superficial e registros de isolamento sazonal.',
    refs: 'HG-2023-001; HG-2024-010',
    x: 430,
    y: 286,
    risk: 'high',
    labelX: 474,
    labelY: 286,
    labelAnchor: 'start',
  },
  {
    name: 'Tefe',
    detail: 'Referência regional do medio Solimoes com conexao para areas remotas.',
    area: 'Medio Solimoes',
    population: '~75.000 pessoas',
    mercurySignal: 'Ponto de apoio para vigilancia integrada em comunidades de rio e lago.',
    exposure: 'Populacao ribeirinha com consumo de pescado e dependencia de rota fluvial.',
    guidance: 'Usar como base para campanhas em comunidades proximas e registros de biota.',
    refs: 'HG-2024-002; HG-2023-004',
    x: 522,
    y: 304,
    risk: 'high',
    labelX: 564,
    labelY: 306,
    labelAnchor: 'start',
  },
  {
    name: 'Fonte Boa',
    detail: 'Municipio do alto Solimoes com deslocamento longo e comunidades isolaveis.',
    area: 'Alto Solimoes',
    population: '~23.000 pessoas',
    mercurySignal: 'Risco operacional por distancia, sazonalidade e exposicao alimentar local.',
    exposure: 'Comunidades dependentes de peixe e transporte fluvial para assistencia.',
    guidance: 'Registrar status de acesso, consumo de peixe e necessidade de retorno clinico.',
    refs: 'HG-2024-011; HG-2023-009',
    x: 692,
    y: 286,
    risk: 'high',
    labelX: 732,
    labelY: 286,
    labelAnchor: 'start',
  },
  {
    name: 'Jutai',
    detail: 'Area fluvial extensa com comunidades de acesso demorado.',
    area: 'Alto Solimoes / Jurua',
    population: '~18.000 pessoas',
    mercurySignal: 'Sensibilidade por isolamento e consumo alimentar baseado em pescado.',
    exposure: 'Familias ribeirinhas com deslocamento longo ate unidade de referencia.',
    guidance: 'Priorizar coleta georreferenciada e fotos do acesso durante seca ou cheia.',
    refs: 'HG-2024-011',
    x: 760,
    y: 326,
    risk: 'high',
    labelX: 800,
    labelY: 326,
    labelAnchor: 'start',
  },
  {
    name: 'Maraa',
    detail: 'Ponto sensivel entre Solimoes e Japura, com comunidades distantes.',
    area: 'Medio Japura',
    population: '~18.000 pessoas',
    mercurySignal: 'Necessidade de acompanhar peixe local, agua e sinais de isolamento.',
    exposure: 'Comunidades ribeirinhas e extrativistas com acesso assistencial limitado.',
    guidance: 'Planejar coleta por rota e manter leitura de risco por comunidade.',
    refs: 'HG-2023-001; HG-2024-010',
    x: 742,
    y: 238,
    risk: 'high',
    labelX: 780,
    labelY: 238,
    labelAnchor: 'start',
  },
  {
    name: 'Japura',
    detail: 'Municipio remoto com alto risco operacional por distancia e acesso fluvial.',
    area: 'Alto Japura',
    population: '~9.000 pessoas',
    mercurySignal: 'Territorio de alta sensibilidade para vigilancia por isolamento prolongado.',
    exposure: 'Comunidades ribeirinhas e indigenas com grande dependencia de pescado.',
    guidance: 'Priorizar biomarcadores, relato alimentar e coordenadas de comunidades remotas.',
    refs: 'HG-2023-009; HG-2024-011',
    x: 870,
    y: 228,
    risk: 'critical',
    labelX: 910,
    labelY: 228,
    labelAnchor: 'start',
  },
  {
    name: 'Tabatinga',
    detail: 'Fronteira do alto Solimoes com fluxo fluvial e assistencial complexo.',
    area: 'Alto Solimoes / Fronteira',
    population: '~70.000 pessoas',
    mercurySignal: 'Ponto de vigilancia para rotas de peixe, agua e populacoes transfronteiricas.',
    exposure: 'Familias ribeirinhas, indigenas e moradores de fronteira com consumo de pescado.',
    guidance: 'Integrar coletas com triagem de grupos vulneraveis e registro de origem do pescado.',
    refs: 'HG-2023-009; HG-2024-002',
    x: 1030,
    y: 386,
    risk: 'high',
    labelX: 1070,
    labelY: 386,
    labelAnchor: 'start',
  },
  {
    name: 'Atalaia do Norte',
    detail: 'Territorio remoto do Vale do Javari com acesso complexo e comunidades indigenas.',
    area: 'Vale do Javari',
    population: '~20.000 pessoas',
    mercurySignal: 'Alta vulnerabilidade territorial por isolamento, distancia e sensibilidade indigena.',
    exposure: 'Comunidades indigenas e ribeirinhas com deslocamento prolongado ate atendimento.',
    guidance: 'Priorizar busca ativa, biomarcadores e plano de retorno assistencial.',
    refs: 'HG-2023-009; HG-2024-011',
    x: 1088,
    y: 432,
    risk: 'critical',
    labelX: 1126,
    labelY: 432,
    labelAnchor: 'start',
  },
  {
    name: 'Eirunepe',
    detail: 'Municipio do Jurua com longas rotas fluviais e isolamento sazonal.',
    area: 'Rio Jurua',
    population: '~36.000 pessoas',
    mercurySignal: 'Risco territorial associado a deslocamento, consumo de pescado e baixa conectividade.',
    exposure: 'Familias ribeirinhas em comunidades distantes da sede municipal.',
    guidance: 'Registrar coleta por comunidade, condicao da rota e sinais clinicos relatados.',
    refs: 'HG-2023-009; HG-2024-011',
    x: 920,
    y: 516,
    risk: 'high',
    labelX: 958,
    labelY: 516,
    labelAnchor: 'start',
  },
  {
    name: 'Boca do Acre',
    detail: 'Ponto no Purus/Acre com comunidades afastadas e rotas sensiveis.',
    area: 'Purus / Acre',
    population: '~35.000 pessoas',
    mercurySignal: 'Monitoramento indicado por vulnerabilidade territorial e exposicao alimentar.',
    exposure: 'Comunidades ribeirinhas com acesso sazonal e consumo local de peixe.',
    guidance: 'Acompanhar seca, qualidade da agua, especie de peixe e retorno assistencial.',
    refs: 'HG-2024-011; HG-2023-004',
    x: 702,
    y: 574,
    risk: 'high',
    labelX: 742,
    labelY: 574,
    labelAnchor: 'start',
  },
]

export const mapLegend = [
  { key: 'low', label: 'Baixo' },
  { key: 'medium', label: 'Moderado' },
  { key: 'high', label: 'Alto' },
  { key: 'critical', label: 'Muito alto' },
] as const satisfies ReadonlyArray<{
  key: MapLegendTone
  label: string
}>

export const riskLabel: Record<RiskTone, string> = {
  critical: 'Muito alto',
  high: 'Alto',
  medium: 'Moderado',
}

export const problemNarrative = [
  'A mineracao ilegal de ouro no arco sul da Amazonia libera toneladas de mercurio por ano nos rios. O Rio Negro, mesmo sendo considerado menos impactado diretamente, recebe mercurio via tributarios contaminados e pela bioacumulacao na cadeia trofica.',
  'As comunidades ribeirinhas e indigenas dependem do peixe como principal fonte proteica. Em alguns grupos, ele representa quase toda a dieta semanal, aumentando a exposicao cronica ao mercurio.',
  'Sem um sistema integrado de monitoramento e alerta, essas populacoes ficam invisiveis para os servicos de saude. O objetivo do observatorio e transformar evidencia dispersa em leitura territorial acionavel.',
]

export const problemAlerts: ProblemAlert[] = [
  {
    tone: 'critical',
    title: 'Jaraqui quase 2x acima do limite',
    description:
      'Jaraqui com cerca de 0,95 ug/g, quase o dobro do limite ANVISA para especie nao predadora e base alimentar da regiao.',
    source: 'HG-2024-002 · UEA / Harvard',
  },
  {
    tone: 'warning',
    title: 'Seca extrema agrava a exposicao',
    description:
      'Em set/2024, 32 das 34 comunidades do baixo Rio Negro ficaram sem acesso direto ao rio, ampliando a vulnerabilidade hidrica.',
    source: 'HG-2024-011 · UEA / Fiocruz',
  },
  {
    tone: 'warning',
    title: 'Sao Gabriel pede cobertura continua',
    description:
      'Maioria indigena, alto consumo de peixe local e historico de biomarcadores humanos tornam a vigilancia insuficiente um risco real.',
    source: 'Fiocruz · Nota Tecnica ENSP 2023',
  },
  {
    tone: 'info',
    title: 'Aguas pretas favorecem metilacao',
    description:
      'No alto Rio Negro, aguas com pH em torno de 4,5 favorecem a formacao de metilmercurio, a forma mais toxica e bioacumulavel.',
    source: 'HG-REF-007 · Bisinoti / Jardim / Sargentini Jr.',
  },
]

export const monitoringSteps: MonitorStep[] = [
  {
    number: '01',
    tone: 'teal',
    title: 'Monitoramento ambiental em campo',
    description:
      'Coleta de agua, sedimento e peixes ao longo do eixo Manaus-Sao Gabriel para ler sazonalidade, contaminacao e qualidade da agua.',
    tags: ['Lumex', 'Tekran', 'CV-AFS', 'ICP-MS', '50 pontos', '700 km'],
  },
  {
    number: '02',
    tone: 'gold',
    title: 'Vigilancia clinica e biomarcadores',
    description:
      'Coleta de biomarcadores humanos, historico alimentar e sinais neurologicos em comunidades ribeirinhas e indigenas priorizadas.',
    tags: ['Hg capilar', 'Biomarcadores', 'Telemedicina', 'Gestantes', 'Criancas'],
  },
  {
    number: '03',
    tone: 'violet',
    title: 'Indice de risco e alertas',
    description:
      'Cruzamento dos eixos ambientais, sociais e clinicos para gerar mapas de risco, leitura territorial e alertas de acompanhamento.',
    tags: ['Heat maps', 'ML preditivo', 'Alertas', 'IRC', 'Tempo real'],
  },
]

export const methodAxes: MethodAxis[] = [
  {
    tone: 'teal',
    title: 'Eixo 1 - Agua, sedimento e sazonalidade',
    description:
      'Base ambiental usada para localizar pressao de contaminacao e variacao entre seca e cheia.',
    fields: [
      { key: 'Hg Total (ng/L)', value: 'Concentracao em agua superficial', badge: 'Req.' },
      { key: 'MeHg (ng/L)', value: 'Metilmercurio especiado', badge: 'Cond.' },
      { key: 'Sazonalidade', value: 'Seca / cheia como fator multiplicador', badge: 'Req.' },
      { key: 'Hg sedimento (ug/g)', value: 'Reservatorio de longo prazo', badge: 'Opt.' },
      { key: 'Lat/Long', value: 'Chave de juncao geografica', badge: 'Req.' },
    ],
  },
  {
    tone: 'gold',
    title: 'Eixo 2 - Biota e cadeia trofica',
    description:
      'Traduz o risco para a alimentacao local e a dependencia de especies mais consumidas.',
    fields: [
      { key: 'Hg em peixe (ug/g)', value: 'Musculo em peso seco', badge: 'Req.' },
      { key: 'Especie / nivel trofico', value: 'Predador vs herbivoro', badge: 'Req.' },
      { key: 'Supera OMS/ANVISA?', value: '0,5 mg/kg ou 1 mg/kg', badge: 'Req.' },
      { key: 'Freq. de consumo', value: 'Dose acumulada estimada', badge: 'Cond.' },
      { key: 'BMF', value: 'Fator de biomagnificacao trofica', badge: 'Opt.' },
    ],
  },
  {
    tone: 'violet',
    title: 'Eixo 3 - Territorio e populacao',
    description:
      'Le a populacao exposta, o isolamento e o acesso a servicos para graduar a resposta.',
    fields: [
      { key: 'Municipio / comunidade', value: 'Chave principal de juncao', badge: 'Req.' },
      { key: 'Pop. exposta', value: 'IBGE ou estudo especifico', badge: 'Req.' },
      { key: 'Grupos indigenas', value: 'Peso adicional na vulnerabilidade', badge: 'Req.' },
      { key: 'Acesso a saude', value: 'Distancia a UBS ou cobertura DSEI', badge: 'Cond.' },
      { key: 'Isolamento hidrico', value: 'Distancia ao rio na seca', badge: 'Opt.' },
    ],
  },
  {
    tone: 'coral',
    title: 'Eixo 4 - Biomarcadores e sinais clinicos',
    description:
      'Fortalece a leitura de exposicao humana cronica e melhora a resposta assistencial.',
    fields: [
      { key: 'Hg capilar (ug/g)', value: 'Exposicao cronica de cerca de 3 meses', badge: 'Cond.' },
      { key: 'Hg urinario', value: 'Exposicao recente a Hg inorganico', badge: 'Opt.' },
      { key: 'Sintomas neurologicos', value: 'Tremor, parestesia, deficit cognitivo', badge: 'Opt.' },
      { key: 'Gestantes / criancas', value: 'Grupos de maior vulnerabilidade', badge: 'Cond.' },
    ],
  },
]

export const panelGapNote =
  'Dados clinicos humanos por comunidade e medicoes na estacao cheia ainda sao as lacunas que mais fortalecem o modelo preditivo.'

export const riskScaleGuide: RiskScaleGuide[] = [
  {
    label: 'Baixo',
    tone: 'low',
    detail: 'Sem sinal relevante acima da linha de base e com baixa vulnerabilidade territorial.',
  },
  {
    label: 'Moderado',
    tone: 'medium',
    detail: 'Sinal de pressao localizada ou exposicao alimentar com necessidade de observacao.',
  },
  {
    label: 'Alto',
    tone: 'high',
    detail: 'Combinacao de peixes contaminados, consumo recorrente ou acesso assistencial limitado.',
  },
  {
    label: 'Muito alto',
    tone: 'critical',
    detail: 'Exposicao recorrente associada a seca extrema, isolamento ou grande dependencia de peixe local.',
  },
]

export const communityRows: CommunityRow[] = [
  {
    name: 'Sao Gabriel da Cachoeira (TI Alto Rio Negro)',
    area: 'Alto · ~850 km',
    population: '~47.000',
    note: 'Maioria indigena',
    riskLabel: 'Muito alto',
    riskTone: 'critical',
    species: 'Peixes locais de consumo comunitario',
    refs: 'HG-2023-009',
  },
  {
    name: '34 comunidades do Baixo Rio Negro',
    area: 'Baixo · Manaus',
    population: '~5.000',
    note: '32/34 isoladas na seca',
    riskLabel: 'Muito alto (seca)',
    riskTone: 'critical',
    species: 'Pesca de subsistencia',
    refs: 'HG-2024-011',
  },
  {
    name: 'Barcelos',
    area: 'Medio · ~400 km',
    population: '~27.000',
    riskLabel: 'Alto',
    riskTone: 'high',
    species: 'Jaraqui, tucunare, pacu, aruana, tambaqui',
    refs: 'HG-2023-001; HG-2024-002; HG-2024-008',
  },
  {
    name: 'Santa Isabel do Rio Negro',
    area: 'Alto · ~750 km',
    population: '~17.000',
    note: '98% floresta primaria',
    riskLabel: 'Alto',
    riskTone: 'high',
    species: 'Tucunare, jaraqui, matrinxa e especies locais',
    refs: 'HG-2023-001; HG-2024-008',
  },
  {
    name: 'Novo Airao',
    area: 'Baixo-medio · ~200 km',
    population: '~18.000',
    riskLabel: 'Alto',
    riskTone: 'high',
    species: 'Tucunare, jaraqui, pacu, surubim',
    refs: 'HG-2023-001; HG-2023-003; HG-2024-010',
  },
  {
    name: 'Manaus / confluencia do Negro',
    area: 'Baixo · confluencia',
    population: '2.219.580',
    note: 'Fracao exposta',
    riskLabel: 'Medio-alto',
    riskTone: 'elevated',
    species: 'Tucunare, jaraqui, tambaqui, matrinxa',
    refs: 'HG-2023-004; HG-2024-002; HG-2024-008',
  },
  {
    name: 'Presidente Figueiredo / Balbina',
    area: 'Afluente Uatuma',
    population: '~33.000',
    riskLabel: 'Moderado',
    riskTone: 'medium',
    species: 'Tucunare, jaraqui e tambaqui de Balbina',
    refs: 'HG-2021-006',
  },
]

export const scienceStudies: Study[] = [
  {
    id: 'HG-2023-001',
    year: '2023',
    title:
      'Campanha OXIOUUWI - 1a Expedicao de Monitoramento da Qualidade das Aguas do Rio Negro',
    authors:
      'Duvoisin Jr., S.; Routhier, E.; Haque, F.; Sunderland, E.; Souza, R. (UEA/Harvard)',
    meta: ['Agua superficial', 'Sedimento', 'Peixe', '50 pontos · 700 km', 'Set/2023'],
    findings:
      'Primeira leitura integrada do eixo Manaus-Santa Isabel com agua, sedimento e peixe em escala sazonal de seca extrema.',
    statusLabel: 'Dados preliminares - limites nao publicados',
    statusTone: 'analysis',
  },
  {
    id: 'HG-2024-002',
    year: '2024',
    title:
      '4a Expedicao OXIOUUWI - IQA Rios Amazonicos: Contaminacao por Hg no Madeira e Negro',
    authors: 'Duvoisin Jr., S.; Nobre, A.; Vieira, F.; Equipe GP-QAT/UEA',
    meta: ['Peixe (musculo)', 'Jaraqui', '~200 peixes · Set/2024'],
    findings:
      'Jaraqui com cerca de 0,95 ug/g, quase 2x o limite ANVISA de 0,5 mg/kg para especie nao predadora.',
    statusLabel: 'SIM - supera limite OMS/ANVISA',
    statusTone: 'yes',
  },
  {
    id: 'HG-2023-003',
    year: '2023',
    title:
      'Mercury and selenium in muscle tissue of Cichla ssp. and Mylossoma spp. from the middle Rio Negro/AM',
    authors: 'Camargo Filho, R.F.; Padilha, P.M. et al. (UNESP Botucatu / FINEP)',
    meta: ['Tucunare (Cichla)', 'Pacu', '~80 amostras · 2022-2023'],
    findings:
      'Magnificacao trofica confirmada: tucunare predador acima de pacu herbivoro no medio Rio Negro.',
    statusLabel: 'SIM - tucunare adulto > 0,5 mg/kg',
    statusTone: 'yes',
  },
  {
    id: 'HG-2023-004',
    year: '2023',
    title:
      'Estudo analisa mercurio em organismos contaminados na Amazonia - resultados parciais',
    authors: 'Padilha, P.M. (coord.); colaboradores FINEP/UNESP',
    meta: ['Peixe · multiplas especies', 'N grande · 2021-2023', 'Escala bacia'],
    findings:
      'Cerca de 20% das amostras de peixe acima do limite OMS/ANVISA, incluindo o eixo Rio Negro.',
    statusLabel: 'SIM - 20% das amostras acima',
    statusTone: 'yes',
  },
  {
    id: 'HG-2023-005',
    year: '2022',
    title:
      'Bioaccumulation of trace metals in Neoechinorhynchus buttnerae and in its fish host tambaqui',
    authors: 'Jeronimo, G.T.; Bolson, M.A.; Sargentini Jr., E. et al.',
    meta: ['Tambaqui', '36 amostras · 2022', 'Piscicultura'],
    findings:
      'Bioacumulacao de metais-traco em tambaqui de piscicultura, relevante para consumidores de pescado cultivado.',
    statusLabel: 'Variavel por metal e tecido',
    statusTone: 'analysis',
  },
  {
    id: 'HG-2021-006',
    year: '2021',
    title:
      'Influence of environmental conditions on mercury levels of sediment along Balbina Reservoir',
    authors: 'Oliveira, C.A.S.; Kasper, D.; Sargentini Jr., E.; Zara, L.F. et al.',
    meta: ['Sedimento', '120 pontos · 2016-2019', 'Balbina'],
    findings:
      'Hg em sedimento entre 0,03 e 0,28 ug/g, com variacao sazonal e pico na seca no sistema Balbina.',
    statusLabel: 'Valores naturais - sazonal',
    statusTone: 'no',
  },
  {
    id: 'HG-REF-007',
    year: '2007',
    title:
      'Seasonal behavior of mercury species in waters and sediments from the Negro River basin, Amazon, Brazil',
    authors: 'Bisinoti, M.C.; Sargentini Jr., E.; Jardim, W.F. et al. (UNICAMP/INPA)',
    meta: ['Agua + sedimento', '~60 pontos · 2004-2005', 'Referencia seminal'],
    findings:
      'Linha de base historica do Rio Negro com sazonalidade comprovada para Hg total e MeHg.',
    statusLabel: 'Valores de fundo - referencia',
    statusTone: 'no',
  },
  {
    id: 'HG-2024-008',
    year: '2024',
    title:
      'Primeiro Indice de Qualidade de Agua (IQA) para rios amazonicos de aguas pretas - Rio Negro',
    authors: 'Duvoisin Jr., S.; Nobre, A.; Arcos, A.N. et al. (QAT/UEA)',
    meta: ['138 parametros', 'IQA', '50 pontos · Set/2023 + cheia 2024'],
    findings:
      'Primeiro IQA adaptado para aguas pretas amazonicas, com Hg proposto como parametro incorporado.',
    statusLabel: 'Em validacao - expansao prevista',
    statusTone: 'analysis',
  },
  {
    id: 'HG-2023-009',
    year: '2023',
    title:
      'Analise regional dos niveis de mercurio em peixes consumidos pela populacao da Amazonia - Nota Tecnica ENSP',
    authors: 'Fiocruz (Arrifano, G.P.; Hacon, S.S.; Yokota, D. et al.)',
    meta: ['~2.000 amostras', '6 estados · 2021-2022', 'Escala regional'],
    findings:
      'Alerta de saude publica para gestantes e criancas, com ate 1 milhao de pessoas expostas na Amazonia.',
    statusLabel: 'SIM - alerta de saude publica Fiocruz',
    statusTone: 'yes',
  },
  {
    id: 'HG-2024-010',
    year: '2024',
    title:
      'Mercury cycle in the Rio Negro, Amazon: sources, methylation, and food web exposure',
    authors: 'Routhier, E.; Haque, F.; Sunderland, E.; Duvoisin Jr., S. (Harvard SEAS / UEA)',
    meta: ['Isotopos de Hg', 'MC-ICP-MS', 'Multiplos pontos'],
    findings:
      'Ciclo completo do mercurio no Rio Negro com foco em fontes, metilacao e exposicao pela cadeia alimentar.',
    statusLabel: 'Em analise - publicacao esperada',
    statusTone: 'analysis',
  },
  {
    id: 'HG-2024-011',
    year: '2024',
    title: 'Drought forces Amazon Indigenous communities to drink mercury-tainted water',
    authors: 'Mongabay / Ambiental Media (dados UEA/Harvard + Fiocruz)',
    meta: ['Consumo hidrico', '34 comunidades', 'Seca Set/2024'],
    findings:
      'Seca extrema de 2024 deixou 32 de 34 comunidades sem acesso direto ao rio, ampliando exposicao hidrica ao Hg.',
    statusLabel: 'SIM - contaminacao direta por consumo hidrico',
    statusTone: 'yes',
  },
]

export const researchers: Researcher[] = [
  {
    initials: 'PMP',
    name: 'Pedro de Magalhaes Padilha',
    institution: 'UNESP Botucatu / FINEP',
    specialty:
      'Metaloproteomica do Hg em peixes amazonicos, biomarcadores de toxicidade e especies do medio Rio Negro.',
    period: 'Ativo: 2015-2025 · Projeto FINEP em andamento',
  },
  {
    initials: 'ESJ',
    name: 'Ezio Sargentini Junior',
    institution: 'INPA / UFAM',
    specialty:
      'Substancias humicas aquaticas, dinamica do Hg em rios e reservatorios e bioacumulacao de metais-traco.',
    period: 'Ativo: 2000-presente · Pesquisador senior INPA',
  },
  {
    initials: 'LFZ',
    name: 'Luiz Fabricio Zara',
    institution: 'UnB / UFAM (colaborador)',
    specialty:
      'Especiacao de Hg, interacoes Hg-substancias humicas e estudos em Balbina, Madeira e Rio Negro.',
    period: 'Ativo: 2001-presente',
  },
  {
    initials: 'WFJ',
    name: 'Wilson de Figueiredo Jardim',
    institution: 'UNICAMP',
    specialty:
      'Quimica ambiental do Hg, fotoquimica redox em aguas pretas e ciclo do mercurio na bacia do Rio Negro.',
    period: 'Referencia: 1998-2017 · Dezenas de publicacoes',
  },
  {
    initials: 'SDJ',
    name: 'Sergio Duvoisin Junior',
    institution: 'UEA - Universidade do Estado do Amazonas',
    specialty:
      'Qualidade de agua, IQA para rios de aguas pretas e lideranca das campanhas OXIOUUWI com parceiros nacionais e internacionais.',
    period: 'Ativo: 2019-presente · Expedicoes 2023 e 2024',
  },
]

export const institutionalPartners = [
  'FIOCRUZ AMAZONIA',
  'INPA',
  'UFAM',
  'UEA',
  'UNESP',
  'HARVARD SEAS',
  'UNICAMP',
  'CONECTHUS',
]

export const footerColumns: FooterColumn[] = [
  {
    title: 'Acesso rapido',
    links: [
      { label: 'Inicio', to: '/' },
      { label: 'Contexto', to: '/contexto' },
      { label: 'Painel', to: '/painel' },
      { label: 'Comunidades', to: '/comunidades' },
    ],
  },
  {
    title: 'Informacoes',
    links: [
      { label: 'Ciencia', to: '/ciencia' },
      { label: 'O problema', to: '/contexto' },
      { label: 'Mapa do rio', to: '/' },
      { label: 'Orientacoes', to: '/' },
    ],
  },
]
