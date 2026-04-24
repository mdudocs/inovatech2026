import crypto from 'node:crypto'
import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import mysql from 'mysql2/promise'

dotenv.config({ path: new URL('./.env', import.meta.url).pathname })
dotenv.config()

const roleLabels = {
  population: 'Morador ribeirinho',
  doctor: 'Medico',
  collector: 'Agente de campo',
  admin: 'Administrador',
}

const app = express()
const sessions = new Map()

const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'banco',
  password: process.env.DB_PASSWORD || '1234',
  database: process.env.DB_NAME || 'mercuriorionegro',
}

const pool = mysql.createPool({
  ...dbConfig,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
})

app.use(cors())
app.use(express.json())

function formatDate(value = new Date()) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(value)
}

function buildBaseDashboard(role, userName, territory) {
  if (role === 'population') {
    return {
      kind: 'population',
      headline: `Painel da comunidade para ${userName}.`,
      summary:
        'Comunicados, visitas e registros da comunidade em uma tela unica.',
      stats: [
        {
          label: 'Situacao da comunidade',
          value: 'Atencao alta',
          detail: 'Monitoramento ativo pela equipe local.',
          tone: 'coral',
        },
        {
          label: 'Proxima visita',
          value: '26 Abr',
          detail: 'Visita prevista para atualizacao dos registros.',
          tone: 'gold',
        },
        {
          label: 'Unidade de referencia',
          value: 'UBS fluvial',
          detail: 'Atendimento de referencia para a comunidade.',
          tone: 'teal',
        },
        {
          label: 'Territorio',
          value: territory || 'Nao informado',
          detail: 'Local associado ao usuario logado.',
          tone: 'slate',
        },
      ],
      alerts: [
        {
          id: 'alert-pop-api-1',
          title: 'Atualizacao da comunidade',
          level: 'attention',
          community: territory || 'Comunidade',
          updatedAt: formatDate(),
          description: 'A equipe local manteve o acompanhamento do territorio ativo.',
          action: 'Conferir os registros e a agenda da familia no painel.',
        },
      ],
      todayActions: [
        'Conferir os comunicados da comunidade.',
        'Atualizar informacoes de consumo de peixe quando solicitado.',
        'Acompanhar as visitas registradas no painel.',
      ],
      warningSigns: [
        'Tontura frequente.',
        'Dormencia nas maos ou nos pes.',
        'Mudanca de equilibrio ou visao.',
      ],
      appointments: [
        {
          title: 'Visita da equipe',
          date: '26/04/2026 - 08:30',
          status: 'Confirmado',
          note: 'Visita programada para atualizacao dos registros locais.',
        },
      ],
      supportPoints: [
        {
          title: 'Territorio',
          value: territory || 'Nao informado',
          note: 'Territorio vinculado ao usuario logado.',
        },
      ],
    }
  }

  if (role === 'doctor') {
    return {
      kind: 'doctor',
      headline: `Painel clinico de ${userName}.`,
      summary: 'Triagem, casos priorizados e rotina clinica reunidos no mesmo lugar.',
      stats: [
        {
          label: 'Casos para revisar',
          value: '08',
          detail: 'Casos pendentes de analise nesta etapa.',
          tone: 'coral',
        },
        {
          label: 'Gestantes em atencao',
          value: '13',
          detail: 'Pacientes em acompanhamento prioritario.',
          tone: 'gold',
        },
        {
          label: 'Exames pendentes',
          value: '21',
          detail: 'Exames aguardando retorno.',
          tone: 'teal',
        },
        {
          label: 'Unidade',
          value: territory || 'Nao informada',
          detail: 'Unidade associada ao usuario logado.',
          tone: 'slate',
        },
      ],
      alerts: [
        {
          id: 'alert-doc-api-1',
          title: 'Fila clinica atualizada',
          level: 'stable',
          community: territory || 'Unidade',
          updatedAt: formatDate(),
          description: 'Os casos disponiveis para revisao foram sincronizados.',
          action: 'Abrir os pacientes priorizados para revisar conduta.',
        },
      ],
      cases: [
        {
          patient: 'Paciente em monitoramento',
          community: territory || 'Territorio',
          risk: 'Alto',
          status: 'Aguardando revisao',
          nextStep: 'Revisar sinais clinicos e consumo alimentar.',
        },
      ],
      agenda: [
        'Revisar fila de biomarcadores.',
        'Acompanhar retornos do dia.',
        'Fechar os casos mais sensiveis.',
      ],
      protocols: [
        'Cruzar sintomas, consumo de peixe e territorio.',
        'Priorizar gestantes e criancas.',
        'Registrar retorno no sistema.',
      ],
      territoryNotes: [
        'A unidade atual segue com acompanhamento ativo.',
      ],
    }
  }

  return {
    kind: 'collector',
    headline: `Painel de campo de ${userName}.`,
    summary: 'Rota, checklist e coletas do dia reunidos em uma unica tela.',
    stats: [
      {
        label: 'Paradas hoje',
        value: '06',
        detail: 'Paradas planejadas no roteiro atual.',
        tone: 'teal',
      },
      {
        label: 'Coletas previstas',
        value: '42',
        detail: 'Total de coletas estimadas para o dia.',
        tone: 'gold',
      },
      {
        label: 'Pendencias',
        value: '03',
        detail: 'Pendencias de conferencia antes do embarque.',
        tone: 'coral',
      },
      {
        label: 'Equipe',
        value: territory || 'Nao informada',
        detail: 'Equipe associada ao usuario logado.',
        tone: 'slate',
      },
    ],
    alerts: [
      {
        id: 'alert-col-api-1',
        title: 'Rota do dia atualizada',
        level: 'attention',
        community: territory || 'Equipe',
        updatedAt: formatDate(),
        description: 'As paradas e a lista de coletas foram sincronizadas.',
        action: 'Conferir o checklist antes da saida.',
      },
    ],
    checklist: [
      'Conferir gelo e etiquetas.',
      'Separar formularios e EPI.',
      'Validar rota antes da saida.',
    ],
    route: [
      {
        stop: 'Ponto inicial',
        eta: '07:30',
        focus: 'Conferencia de saida',
        risk: 'Operacional',
      },
    ],
    tasks: [
      {
        community: territory || 'Territorio',
        sampleType: 'Coleta programada',
        window: '08:00 - 10:00',
        owner: userName,
        status: 'Confirmado',
      },
    ],
    samples: [
      {
        label: 'Amostras previstas',
        amount: '00',
        note: 'Amostras do dia serao registradas nesta tela.',
      },
    ],
  }
}

async function buildAdminDashboard() {
  const [tablesRows] = await pool.query('SHOW TABLES')
  const tableNames = tablesRows.map((row) => Object.values(row)[0])

  const tableSummaries = await Promise.all(
    tableNames.map(async (tableName) => {
      const [countRows] = await pool.query(`SELECT COUNT(*) AS total FROM \`${tableName}\``)
      const total = countRows[0]?.total ?? 0

      return {
        table: String(tableName),
        rows: String(total),
        detail: `Tabela ${String(tableName)} monitorada pelo painel admin.`,
      }
    }),
  )

  const [usersRows] = await pool.query(
    `SELECT nome, perfil, identificador_login, COALESCE(territorio, 'Nao informado') AS territorio,
            CASE WHEN ativo = 1 THEN 'Ativo' ELSE 'Inativo' END AS status
       FROM usuarios
      ORDER BY id_usuario DESC`,
  )

  const [rolesRows] = await pool.query(
    'SELECT perfil, COUNT(*) AS total FROM usuarios GROUP BY perfil ORDER BY perfil',
  )

  const [communitiesRows] = await pool.query('SELECT COUNT(*) AS total FROM comunidades')
  const [recordsRows] = await pool.query('SELECT COUNT(*) AS total FROM registros_mercuario')

  const totalUsers = usersRows.length
  const totalTables = tableNames.length
  const totalCommunities = communitiesRows[0]?.total ?? 0
  const totalRecords = recordsRows[0]?.total ?? 0

  return {
    kind: 'admin',
    headline: 'Painel administrativo do banco.',
    summary:
      'Visao geral das tabelas, usuarios cadastrados e situacao atual da base MySQL.',
    stats: [
      {
        label: 'Usuarios cadastrados',
        value: String(totalUsers),
        detail: 'Total de usuarios encontrados na tabela usuarios.',
        tone: 'teal',
      },
      {
        label: 'Tabelas ativas',
        value: String(totalTables),
        detail: 'Total de tabelas visiveis no schema atual.',
        tone: 'gold',
      },
      {
        label: 'Comunidades',
        value: String(totalCommunities),
        detail: 'Registros presentes na tabela comunidades.',
        tone: 'slate',
      },
      {
        label: 'Registros de mercurio',
        value: String(totalRecords),
        detail: 'Registros presentes na tabela registros_mercuario.',
        tone: 'coral',
      },
    ],
    alerts: [
      {
        id: 'alert-admin-db',
        title: 'Banco conectado',
        level: 'stable',
        community: dbConfig.database,
        updatedAt: formatDate(),
        description: 'A API conseguiu consultar o banco MySQL e montar o painel.',
        action: 'Acompanhar crescimento de usuarios e tabelas do sistema.',
      },
      {
        id: 'alert-admin-users',
        title: 'Perfis cadastrados',
        level: 'attention',
        community: 'usuarios',
        updatedAt: formatDate(),
        description: `${rolesRows.length} perfis diferentes encontrados na tabela usuarios.`,
        action: 'Revisar se os acessos cadastrados estao corretos.',
      },
    ],
    tables: tableSummaries,
    users: usersRows.map((row) => ({
      name: row.nome,
      role: row.perfil,
      identifier: row.identificador_login,
      territory: row.territorio,
      status: row.status,
    })),
    activity: [
      `Usuarios por perfil: ${rolesRows
        .map((row) => `${row.perfil} (${row.total})`)
        .join(', ')}`,
      `Schema monitorado: ${dbConfig.database}`,
      'Painel admin conectado diretamente a API e ao MySQL.',
    ],
  }
}

async function authenticate(request, response, next) {
  const authorization = request.headers.authorization || ''
  const token = authorization.startsWith('Bearer ')
    ? authorization.slice('Bearer '.length)
    : ''

  if (!token || !sessions.has(token)) {
    response.status(401).send('Sessao invalida.')
    return
  }

  request.sessionUser = sessions.get(token)
  next()
}

app.get('/api/health', async (_request, response) => {
  const connection = await pool.getConnection()

  try {
    await connection.query('SELECT 1')
    response.json({ status: 'ok', database: dbConfig.database })
  } finally {
    connection.release()
  }
})

app.post('/api/auth/login', async (request, response) => {
  const { role, identifier, password } = request.body || {}

  if (!role || !identifier || !password) {
    response.status(400).send('Dados de login incompletos.')
    return
  }

  const [rows] = await pool.query(
    `SELECT id_usuario, nome, perfil, territorio, ativo
       FROM usuarios
      WHERE perfil = ?
        AND identificador_login = ?
        AND senha = ?
      LIMIT 1`,
    [role, String(identifier).trim(), String(password)],
  )

  const user = rows[0]

  if (!user) {
    response.status(401).send('Credenciais invalidas para o perfil selecionado.')
    return
  }

  if (user.ativo !== 1) {
    response.status(403).send('Usuario inativo.')
    return
  }

  const token = crypto.randomUUID()
  const sessionUser = {
    id: String(user.id_usuario),
    name: user.nome,
    role: user.perfil,
    roleLabel: roleLabels[user.perfil] || user.perfil,
    territory: user.territorio || 'Nao informado',
  }

  sessions.set(token, sessionUser)

  response.json({
    token,
    user: sessionUser,
  })
})

app.get('/api/dashboard/:role', authenticate, async (request, response) => {
  const { role } = request.params
  const sessionUser = request.sessionUser

  if (role !== sessionUser.role) {
    response.status(403).send('Acesso negado para este painel.')
    return
  }

  if (role === 'admin') {
    response.json(await buildAdminDashboard())
    return
  }

  response.json(buildBaseDashboard(role, sessionUser.name, sessionUser.territory))
})

const port = Number(process.env.PORT || 3001)

app.listen(port, () => {
  console.log(`API do portal ativa em http://localhost:${port}/api`)
})
