import type {
  DashboardByRole,
  DemoAccount,
  RoleMeta,
  UserRole,
} from './portalTypes'

export const roleMeta: Record<UserRole, RoleMeta> = {
  population: {
    label: 'Morador ribeirinho',
    shortLabel: 'Morador',
    credentialLabel: 'CPF, cartao SUS ou celular',
    description:
      'Espaco da familia para ver comunicados, visitas e registros da comunidade.',
    route: '/portal/population',
  },
  doctor: {
    label: 'Medico',
    shortLabel: 'Medico',
    credentialLabel: 'CRM ou matricula institucional',
    description:
      'Painel de decisao rapida para triagem, casos prioritarios e rotina clinica.',
    route: '/portal/doctor',
  },
  collector: {
    label: 'Agente de campo',
    shortLabel: 'Agente',
    credentialLabel: 'Matricula de campo',
    description:
      'Painel pratico para rota, checklist de saida e controle das coletas.',
    route: '/portal/collector',
  },
  admin: {
    label: 'Administrador',
    shortLabel: 'Admin',
    credentialLabel: 'Usuario administrativo',
    description:
      'Painel para acompanhar usuarios, tabelas e o estado geral do banco.',
    route: '/portal/admin',
  },
}

export const demoAccounts: DemoAccount[] = [
  {
    id: 'u-pop-01',
    role: 'population',
    name: 'Maria do Carmo',
    identifier: '111.111.111-11',
    password: 'demo123',
    territory: 'Comunidade Sao Tome - Baixo Rio Negro',
  },
  {
    id: 'u-doc-01',
    role: 'doctor',
    name: 'Dra. Helena Nascimento',
    identifier: 'CRM-AM 10234',
    password: 'medico123',
    territory: 'UBS Fluvial Rio Negro',
  },
  {
    id: 'u-col-01',
    role: 'collector',
    name: 'Joao Batista',
    identifier: 'AGT-204',
    password: 'coleta123',
    territory: 'Equipe de campo - Trecho Manaus / Barcelos',
  },
  {
    id: 'u-admin-01',
    role: 'admin',
    name: 'Administrador do Sistema',
    identifier: 'admin',
    password: 'admin123',
    territory: 'Painel administrativo',
  },
]

export const mysqlBlueprint = [
  {
    title: 'Base preparada',
    description:
      'users, communities, health_alerts, appointments, patient_cases, collection_routes e collection_samples.',
  },
  {
    title: 'Troca simples para API',
    description:
      'Use VITE_DATA_SOURCE=api e VITE_API_BASE_URL=http://localhost:3001 quando seu backend estiver pronto.',
  },
  {
    title: 'Fluxo seguro',
    description:
      'Frontend React -> API Node/Express -> MySQL. Isso evita expor credenciais do banco no navegador.',
  },
]

export const dashboardMocks: DashboardByRole = {
  population: {
    kind: 'population',
    headline: 'Painel da comunidade hoje.',
    summary:
      'Aqui ficam os comunicados, as visitas programadas e os registros mais importantes da comunidade.',
    stats: [
      {
        label: 'Situacao da comunidade',
        value: 'Atencao alta',
        detail: 'A equipe acompanha consumo de peixe e sinais de saude na regiao.',
        tone: 'coral',
      },
      {
        label: 'Proxima visita',
        value: '26 Abr',
        detail: 'A equipe volta para triagem e atualizacao dos registros.',
        tone: 'gold',
      },
      {
        label: 'Unidade de referencia',
        value: 'UBS fluvial',
        detail: 'Atendimento de referencia para os registros da comunidade.',
        tone: 'teal',
      },
      {
        label: 'Familias em retorno',
        value: '12',
        detail: 'Familias da area estao em acompanhamento pela equipe local.',
        tone: 'slate',
      },
    ],
    alerts: [
      {
        id: 'alert-pop-1',
        title: 'Evite peixe grande todos os dias',
        level: 'critical',
        community: 'Baixo Rio Negro',
        updatedAt: '24/04/2026 09:20',
        description:
          'A equipe recomenda reduzir o consumo frequente de peixes grandes ate sair a nova avaliacao da comunidade.',
        action: 'Priorizar o acompanhamento de gestantes, criancas e idosos.',
      },
      {
        id: 'alert-pop-2',
        title: 'Visita da equipe confirmada',
        level: 'attention',
        community: 'Comunidade Sao Tome',
        updatedAt: '23/04/2026 16:10',
        description:
          'A equipe passa na sexta-feira para ouvir a comunidade e atualizar as fichas locais.',
        action: 'Tenha em maos documentos, recados e informacoes sobre consumo de peixe.',
      },
    ],
    todayActions: [
      'Avise a equipe se alguem da casa tiver tontura, tremor ou dormencia.',
      'Conte quantas vezes por semana a familia come peixe.',
      'Leve gestantes, criancas e idosos primeiro para a triagem.',
    ],
    warningSigns: [
      'Tontura frequente ou dor de cabeca repetida.',
      'Dormencia nas maos, nos pes ou tremor.',
      'Mudanca na visao, fala ou equilibrio.',
    ],
    appointments: [
      {
        title: 'Triagem da familia',
        date: '26/04/2026 - 08:30',
        status: 'Confirmado',
        note: 'Atendimento com agente comunitario e registro na UBS fluvial.',
      },
      {
        title: 'Atualizacao alimentar',
        date: '29/04/2026 - 14:00',
        status: 'Pendente',
        note: 'Revisao do consumo de peixe informado pela comunidade.',
      },
    ],
    supportPoints: [
      {
        title: 'Contato principal',
        value: 'Agente Raimunda - Canal 03',
        note: 'Responsavel pelos recados e confirmacoes da comunidade.',
      },
      {
        title: 'Grupo prioritario',
        value: 'Gestantes e criancas',
        note: 'Esses grupos entram primeiro na triagem quando houver alerta.',
      },
      {
        title: 'Ultima coleta',
        value: '18/04 na comunidade',
        note: 'Foram registradas amostras de agua e informacoes sobre consumo de peixe.',
      },
    ],
  },
  doctor: {
    kind: 'doctor',
    headline: 'O que a equipe medica precisa ver primeiro hoje.',
    summary:
      'Painel pensado para triagem rapida, com os pacientes mais sensiveis, conduta resumida e recados do territorio.',
    stats: [
      {
        label: 'Casos para revisar',
        value: '08',
        detail: 'Pacientes com exposicao recorrente ou sintomas em fila de analise.',
        tone: 'coral',
      },
      {
        label: 'Gestantes em atencao',
        value: '13',
        detail: 'Precisam de revisao prioritaria pela equipe clinica.',
        tone: 'gold',
      },
      {
        label: 'Exames pendentes',
        value: '21',
        detail: 'Pedidos aguardando coleta, retorno ou validacao laboratorial.',
        tone: 'teal',
      },
      {
        label: 'Frentes ativas',
        value: '05',
        detail: 'Locais com atendimento, coleta e vigilancia ativos nesta semana.',
        tone: 'slate',
      },
    ],
    alerts: [
      {
        id: 'alert-doc-1',
        title: 'Gestantes com alto consumo de peixe',
        level: 'critical',
        community: 'Barcelos',
        updatedAt: '24/04/2026 08:55',
        description:
          'Grupo precisa de revisao nas proximas 48 horas por exposicao alimentar frequente e sintomas leves.',
        action: 'Abrir protocolo prioritario e decidir necessidade de teleinterconsulta.',
      },
      {
        id: 'alert-doc-2',
        title: 'Resultados laboratoriais disponiveis',
        level: 'stable',
        community: 'Sao Gabriel da Cachoeira',
        updatedAt: '23/04/2026 19:05',
        description:
          'Novos resultados podem ser comparados com sintomas, dieta e historico anterior do paciente.',
        action: 'Revisar biomarcadores antes de fechar ou escalar o caso.',
      },
    ],
    cases: [
      {
        patient: 'A. S. M.',
        community: 'Sao Gabriel da Cachoeira',
        risk: 'Muito alto',
        status: 'Revisao medica hoje',
        nextStep: 'Solicitar biomarcador e revisar dieta da familia.',
      },
      {
        patient: 'L. P. O.',
        community: 'Barcelos',
        risk: 'Alto',
        status: 'Retorno em aberto',
        nextStep: 'Reforcar triagem neurologica e orientar reducao de consumo.',
      },
      {
        patient: 'M. A. C.',
        community: 'Novo Airao',
        risk: 'Moderado',
        status: 'Teleconsulta sugerida',
        nextStep: 'Checar evolucao dos sintomas e alinhar coleta complementar.',
      },
    ],
    agenda: [
      '25/04 - Revisar fila de biomarcadores com laboratorio parceiro',
      '26/04 - Teleatendimento com UBS fluvial e equipe de campo',
      '28/04 - Fechar relacao de casos sensiveis para vigilancia',
    ],
    protocols: [
      'Cruzar sintomas, consumo de peixe e local de moradia antes da conduta.',
      'Priorizar criancas, gestantes e pacientes com sinais neurologicos progressivos.',
      'Registrar retorno e encaminhamento para manter historico unico do paciente.',
    ],
    territoryNotes: [
      'Baixo Rio Negro com maior demanda por revisao alimentar nesta semana.',
      'Barcelos com fila crescente de gestantes em acompanhamento.',
      'Sao Gabriel precisa de conciliacao rapida entre biomarcador e quadro clinico.',
      'Novo Airao com coleta complementar prevista para os proximos dias.',
    ],
  },
  collector: {
    kind: 'collector',
    headline: 'O que a equipe de campo precisa fazer hoje.',
    summary:
      'Painel simples para sair com a rota certa, confirmar checklist e registrar as coletas mais importantes.',
    stats: [
      {
        label: 'Paradas hoje',
        value: '06',
        detail: 'Paradas confirmadas no baixo e medio Rio Negro.',
        tone: 'teal',
      },
      {
        label: 'Coletas previstas',
        value: '42',
        detail: 'Agua, peixe e fichas para acompanhamento clinico.',
        tone: 'gold',
      },
      {
        label: 'Pendencias',
        value: '03',
        detail: 'Etiquetas e temperatura ainda precisam de revisao.',
        tone: 'coral',
      },
      {
        label: 'Ultimo envio',
        value: '07:42',
        detail: 'A base recebeu a ultima atualizacao da equipe nesta manha.',
        tone: 'slate',
      },
    ],
    alerts: [
      {
        id: 'alert-col-1',
        title: 'Conferir etiqueta das amostras de peixe',
        level: 'attention',
        community: 'Novo Airao',
        updatedAt: '24/04/2026 07:50',
        description:
          'A remessa anterior chegou com campos incompletos de especie e ponto de captura.',
        action: 'Conferir antes do embarque e registrar foto da etiqueta final.',
      },
      {
        id: 'alert-col-2',
        title: 'Janela curta por nivel do rio',
        level: 'critical',
        community: 'Baixo Rio Negro',
        updatedAt: '24/04/2026 06:25',
        description:
          'Algumas comunidades so podem ser atendidas ate o meio da tarde por restricao de acesso.',
        action: 'Antecipar agua e sedimento nas primeiras paradas da rota.',
      },
    ],
    checklist: [
      'Conferir gelo, etiquetas, formularios e EPI antes de sair.',
      'Confirmar primeiro as comunidades com acesso mais dificil.',
      'Registrar hora, ponto e responsavel em toda amostra coletada.',
      'Avisar a equipe clinica se houver atraso ou impossibilidade de acesso.',
    ],
    route: [
      {
        stop: 'Manaus',
        eta: '07:30',
        focus: 'Conferencia final de kits e gelo reutilizavel',
        risk: 'Operacional',
      },
      {
        stop: 'Comunidade Sao Tome',
        eta: '09:10',
        focus: 'Agua superficial e questionario familiar',
        risk: 'Alto',
      },
      {
        stop: 'Novo Airao',
        eta: '11:20',
        focus: 'Peixe, sedimento e validacao das etiquetas',
        risk: 'Moderado',
      },
      {
        stop: 'Barcelos',
        eta: '15:40',
        focus: 'Coleta estendida e preparo da remessa final',
        risk: 'Muito alto',
      },
    ],
    tasks: [
      {
        community: 'Comunidade Sao Tome',
        sampleType: 'Agua + formulario familiar',
        window: '08:45 - 09:30',
        owner: 'Joao Batista',
        status: 'Confirmado',
      },
      {
        community: 'Novo Airao',
        sampleType: 'Peixe + sedimento',
        window: '11:10 - 12:30',
        owner: 'Equipe 02',
        status: 'Em preparo',
      },
      {
        community: 'Barcelos',
        sampleType: 'Lote consolidado para laboratorio',
        window: '15:30 - 17:00',
        owner: 'Equipe 01',
        status: 'Preparar embarque',
      },
    ],
    samples: [
      {
        label: 'Agua superficial',
        amount: '18 frascos',
        note: 'Toda amostra deve sair com ponto, hora e responsavel registrados.',
      },
      {
        label: 'Tecido de peixe',
        amount: '14 amostras',
        note: 'Registrar especie, tamanho e local de captura no mesmo momento.',
      },
      {
        label: 'Sedimento',
        amount: '10 amostras',
        note: 'Manter controle de temperatura e sequencia correta da rota.',
      },
    ],
  },
  admin: {
    kind: 'admin',
    headline: 'Visao administrativa do sistema.',
    summary:
      'Painel administrativo para acompanhar usuarios, tabelas e os principais dados do banco.',
    stats: [
      {
        label: 'Usuarios cadastrados',
        value: '4',
        detail: 'Total inicial de acessos cadastrados no sistema.',
        tone: 'teal',
      },
      {
        label: 'Tabelas acompanhadas',
        value: '4',
        detail: 'Tabelas principais lidas pelo painel administrativo.',
        tone: 'gold',
      },
      {
        label: 'Banco conectado',
        value: 'MySQL',
        detail: 'Base principal do sistema em operacao.',
        tone: 'slate',
      },
      {
        label: 'Status geral',
        value: 'Online',
        detail: 'Painel administrativo disponivel para consulta.',
        tone: 'coral',
      },
    ],
    alerts: [
      {
        id: 'alert-admin-1',
        title: 'Conexao com banco disponivel',
        level: 'stable',
        community: 'Sistema',
        updatedAt: '24/04/2026 15:35',
        description:
          'A conexao principal com o banco esta ativa e respondendo normalmente.',
        action: 'Monitorar o crescimento de usuarios e tabelas do sistema.',
      },
    ],
    tables: [
      {
        table: 'usuarios',
        rows: '4',
        detail: 'Tabela principal de acesso ao sistema.',
      },
      {
        table: 'comunidades',
        rows: '7',
        detail: 'Comunidades e municipios cadastrados no banco.',
      },
      {
        table: 'pesquisadores',
        rows: '5',
        detail: 'Referencias de pesquisadores salvas no sistema.',
      },
      {
        table: 'registros_mercuario',
        rows: '4',
        detail: 'Registros relacionados ao mercurio no banco.',
      },
    ],
    users: [
      {
        name: 'Maria do Carmo',
        role: 'population',
        identifier: '111.111.111-11',
        territory: 'Comunidade Sao Tome - Baixo Rio Negro',
        status: 'Ativo',
      },
      {
        name: 'Dra. Helena Nascimento',
        role: 'doctor',
        identifier: 'CRM-AM 10234',
        territory: 'UBS Fluvial Rio Negro',
        status: 'Ativo',
      },
      {
        name: 'Joao Batista',
        role: 'collector',
        identifier: 'AGT-204',
        territory: 'Equipe de campo - Trecho Manaus / Barcelos',
        status: 'Ativo',
      },
      {
        name: 'Administrador do Sistema',
        role: 'admin',
        identifier: 'admin',
        territory: 'Painel administrativo',
        status: 'Ativo',
      },
    ],
    activity: [
      'Acompanhar quantidade total de usuarios cadastrados.',
      'Verificar crescimento das tabelas principais do banco.',
      'Monitorar se o painel e a base continuam respondendo normalmente.',
    ],
  },
}
