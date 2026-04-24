import crypto from 'node:crypto'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import mysql from 'mysql2/promise'

const currentFilePath = fileURLToPath(import.meta.url)
const currentDir = dirname(currentFilePath)

dotenv.config({ path: resolve(currentDir, '.env') })
dotenv.config()

const roleLabels = {
  population: 'Morador ribeirinho',
  doctor: 'Medico',
  collector: 'Agente de campo',
  admin: 'Administrador',
}

const app = express()
const sessions = new Map()
const adminAccessKey = process.env.ADMIN_ACCESS_KEY?.trim() || ''

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

function getAdminTargetHref(tableName) {
  return tableName === 'usuarios' ? '/portal/admin/usuarios' : '/portal/admin/banco'
}

async function ensureAuditInfrastructure() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS admin_change_log (
      id_evento BIGINT NOT NULL AUTO_INCREMENT,
      table_name VARCHAR(80) NOT NULL,
      action_type ENUM('INSERT', 'UPDATE', 'DELETE') NOT NULL,
      record_id VARCHAR(120) NOT NULL,
      summary VARCHAR(255) NOT NULL,
      changed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id_evento),
      KEY idx_admin_change_log_changed_at (changed_at),
      KEY idx_admin_change_log_table_name (table_name)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
  `)

  const triggerDefinitions = [
    {
      name: 'trg_audit_usuarios_insert',
      sql: `
        CREATE TRIGGER trg_audit_usuarios_insert
        AFTER INSERT ON usuarios
        FOR EACH ROW
        INSERT INTO admin_change_log (table_name, action_type, record_id, summary)
        VALUES ('usuarios', 'INSERT', CAST(NEW.id_usuario AS CHAR), CONCAT('Novo usuario cadastrado: ', NEW.nome))
      `,
    },
    {
      name: 'trg_audit_usuarios_update',
      sql: `
        CREATE TRIGGER trg_audit_usuarios_update
        AFTER UPDATE ON usuarios
        FOR EACH ROW
        INSERT INTO admin_change_log (table_name, action_type, record_id, summary)
        VALUES ('usuarios', 'UPDATE', CAST(NEW.id_usuario AS CHAR), CONCAT('Usuario atualizado: ', NEW.nome))
      `,
    },
    {
      name: 'trg_audit_usuarios_delete',
      sql: `
        CREATE TRIGGER trg_audit_usuarios_delete
        AFTER DELETE ON usuarios
        FOR EACH ROW
        INSERT INTO admin_change_log (table_name, action_type, record_id, summary)
        VALUES ('usuarios', 'DELETE', CAST(OLD.id_usuario AS CHAR), CONCAT('Usuario removido: ', OLD.nome))
      `,
    },
    {
      name: 'trg_audit_comunidades_insert',
      sql: `
        CREATE TRIGGER trg_audit_comunidades_insert
        AFTER INSERT ON comunidades
        FOR EACH ROW
        INSERT INTO admin_change_log (table_name, action_type, record_id, summary)
        VALUES ('comunidades', 'INSERT', CAST(NEW.id_comunidade AS CHAR), CONCAT('Nova comunidade cadastrada: ', NEW.municipio_comunidade))
      `,
    },
    {
      name: 'trg_audit_comunidades_update',
      sql: `
        CREATE TRIGGER trg_audit_comunidades_update
        AFTER UPDATE ON comunidades
        FOR EACH ROW
        INSERT INTO admin_change_log (table_name, action_type, record_id, summary)
        VALUES ('comunidades', 'UPDATE', CAST(NEW.id_comunidade AS CHAR), CONCAT('Comunidade atualizada: ', NEW.municipio_comunidade))
      `,
    },
    {
      name: 'trg_audit_comunidades_delete',
      sql: `
        CREATE TRIGGER trg_audit_comunidades_delete
        AFTER DELETE ON comunidades
        FOR EACH ROW
        INSERT INTO admin_change_log (table_name, action_type, record_id, summary)
        VALUES ('comunidades', 'DELETE', CAST(OLD.id_comunidade AS CHAR), CONCAT('Comunidade removida: ', OLD.municipio_comunidade))
      `,
    },
    {
      name: 'trg_audit_pesquisadores_insert',
      sql: `
        CREATE TRIGGER trg_audit_pesquisadores_insert
        AFTER INSERT ON pesquisadores
        FOR EACH ROW
        INSERT INTO admin_change_log (table_name, action_type, record_id, summary)
        VALUES ('pesquisadores', 'INSERT', CAST(NEW.id_pesquisador AS CHAR), CONCAT('Novo pesquisador cadastrado: ', NEW.nome))
      `,
    },
    {
      name: 'trg_audit_pesquisadores_update',
      sql: `
        CREATE TRIGGER trg_audit_pesquisadores_update
        AFTER UPDATE ON pesquisadores
        FOR EACH ROW
        INSERT INTO admin_change_log (table_name, action_type, record_id, summary)
        VALUES ('pesquisadores', 'UPDATE', CAST(NEW.id_pesquisador AS CHAR), CONCAT('Pesquisador atualizado: ', NEW.nome))
      `,
    },
    {
      name: 'trg_audit_pesquisadores_delete',
      sql: `
        CREATE TRIGGER trg_audit_pesquisadores_delete
        AFTER DELETE ON pesquisadores
        FOR EACH ROW
        INSERT INTO admin_change_log (table_name, action_type, record_id, summary)
        VALUES ('pesquisadores', 'DELETE', CAST(OLD.id_pesquisador AS CHAR), CONCAT('Pesquisador removido: ', OLD.nome))
      `,
    },
    {
      name: 'trg_audit_registros_mercuario_insert',
      sql: `
        CREATE TRIGGER trg_audit_registros_mercuario_insert
        AFTER INSERT ON registros_mercuario
        FOR EACH ROW
        INSERT INTO admin_change_log (table_name, action_type, record_id, summary)
        VALUES ('registros_mercuario', 'INSERT', NEW.id_registo, CONCAT('Novo registro de mercurio inserido: ', NEW.id_registo))
      `,
    },
    {
      name: 'trg_audit_registros_mercuario_update',
      sql: `
        CREATE TRIGGER trg_audit_registros_mercuario_update
        AFTER UPDATE ON registros_mercuario
        FOR EACH ROW
        INSERT INTO admin_change_log (table_name, action_type, record_id, summary)
        VALUES ('registros_mercuario', 'UPDATE', NEW.id_registo, CONCAT('Registro de mercurio atualizado: ', NEW.id_registo))
      `,
    },
    {
      name: 'trg_audit_registros_mercuario_delete',
      sql: `
        CREATE TRIGGER trg_audit_registros_mercuario_delete
        AFTER DELETE ON registros_mercuario
        FOR EACH ROW
        INSERT INTO admin_change_log (table_name, action_type, record_id, summary)
        VALUES ('registros_mercuario', 'DELETE', OLD.id_registo, CONCAT('Registro de mercurio removido: ', OLD.id_registo))
      `,
    },
  ]

  for (const trigger of triggerDefinitions) {
    await pool.query(`DROP TRIGGER IF EXISTS ${trigger.name}`)
    await pool.query(trigger.sql)
  }
}

async function listRecentChanges(limit = 8) {
  const [rows] = await pool.query(
    `SELECT id_evento, table_name, action_type, record_id, summary, changed_at
       FROM admin_change_log
      ORDER BY changed_at DESC, id_evento DESC
      LIMIT ?`,
    [limit],
  )

  return rows.map((row) => ({
    id: String(row.id_evento),
    table: row.table_name,
    action: row.action_type,
    recordId: row.record_id,
    summary: row.summary,
    changedAt: formatDate(row.changed_at),
    href: getAdminTargetHref(row.table_name),
  }))
}

async function countRows(tableName) {
  const [rows] = await pool.query(`SELECT COUNT(*) AS total FROM \`${tableName}\``)
  return rows[0]?.total ?? 0
}

async function listTableNames() {
  const [tablesRows] = await pool.query('SHOW TABLES')
  return tablesRows.map((row) => String(Object.values(row)[0]))
}

async function buildTableSummaries() {
  const tableNames = await listTableNames()

  const tableSummaries = await Promise.all(
    tableNames.map(async (tableName) => ({
      table: tableName,
      rows: String(await countRows(tableName)),
      detail: `Tabela ${tableName} monitorada pelo painel admin.`,
    })),
  )

  return {
    tableNames,
    tableSummaries,
  }
}

async function listUsers() {
  const [usersRows] = await pool.query(
    `SELECT id_usuario, nome, perfil, identificador_login,
            COALESCE(territorio, 'Nao informado') AS territorio,
            ativo,
            CASE WHEN ativo = 1 THEN 'Ativo' ELSE 'Inativo' END AS status
       FROM usuarios
      ORDER BY perfil, nome`,
  )

  return usersRows.map((row) => ({
    id: String(row.id_usuario),
    name: row.nome,
    role: row.perfil,
    identifier: row.identificador_login,
    territory: row.territorio,
    status: row.status,
    active: row.ativo === 1,
  }))
}

async function listRoleCounts() {
  const [rolesRows] = await pool.query(
    'SELECT perfil, COUNT(*) AS total FROM usuarios GROUP BY perfil ORDER BY perfil',
  )

  return rolesRows
}

async function buildAdminOverview() {
  const [{ tableNames }, users, roleCounts, changes] = await Promise.all([
    buildTableSummaries(),
    listUsers(),
    listRoleCounts(),
    listRecentChanges(),
  ])

  const [communitiesRows, recordsRows] = await Promise.all([
    pool.query('SELECT COUNT(*) AS total FROM comunidades'),
    pool.query('SELECT COUNT(*) AS total FROM registros_mercuario'),
  ])

  const totalCommunities = communitiesRows[0][0]?.total ?? 0
  const totalRecords = recordsRows[0][0]?.total ?? 0

  return {
    headline: 'Painel administrativo do banco.',
    summary:
      'Visao geral das tabelas, usuarios cadastrados e situacao atual da base MySQL.',
    stats: [
      {
        label: 'Usuarios cadastrados',
        value: String(users.length),
        detail: 'Total de usuarios encontrados na tabela usuarios.',
        tone: 'teal',
      },
      {
        label: 'Tabelas ativas',
        value: String(tableNames.length),
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
        href: '/portal/admin/banco',
      },
      {
        id: 'alert-admin-users',
        title: 'Perfis cadastrados',
        level: 'attention',
        community: 'usuarios',
        updatedAt: formatDate(),
        description: `${roleCounts.length} perfis diferentes encontrados na tabela usuarios.`,
        action: 'Revisar se os acessos cadastrados estao corretos.',
        href: '/portal/admin/usuarios',
      },
    ],
    activity: [
      `Usuarios por perfil: ${roleCounts
        .map((row) => `${row.perfil} (${row.total})`)
        .join(', ')}`,
      `Schema monitorado: ${dbConfig.database}`,
      'Painel admin conectado diretamente a API e ao MySQL.',
    ],
    changes,
  }
}

async function buildAdminUsersDashboard() {
  const users = await listUsers()
  const activeCount = users.filter((user) => user.active).length
  const inactiveCount = users.length - activeCount
  const profilesFound = new Set(users.map((user) => user.role)).size

  return {
    headline: 'Gestao de usuarios do sistema.',
    summary: 'Ative, desative e acompanhe os acessos cadastrados no portal.',
    stats: [
      {
        label: 'Usuarios cadastrados',
        value: String(users.length),
        detail: 'Total de acessos encontrados na tabela usuarios.',
        tone: 'teal',
      },
      {
        label: 'Usuarios ativos',
        value: String(activeCount),
        detail: 'Acessos liberados para usar o sistema.',
        tone: 'gold',
      },
      {
        label: 'Usuarios inativos',
        value: String(inactiveCount),
        detail: 'Acessos bloqueados ate nova liberacao.',
        tone: 'coral',
      },
      {
        label: 'Perfis encontrados',
        value: String(profilesFound),
        detail: 'Perfis distintos cadastrados na tabela usuarios.',
        tone: 'slate',
      },
    ],
    users,
  }
}

async function buildAdminDatabaseDashboard() {
  const [{ tableNames, tableSummaries }, overview, changes] = await Promise.all([
    buildTableSummaries(),
    buildAdminOverview(),
    listRecentChanges(),
  ])

  return {
    headline: 'Controle do banco e da infraestrutura.',
    summary: 'Acompanhe o schema, as tabelas lidas pelo painel e o estado da integracao.',
    stats: overview.stats,
    alerts: overview.alerts,
    tables: tableSummaries,
    health: [
      {
        label: 'API',
        status: 'Online',
        detail: 'Servico administrativo respondendo normalmente.',
        tone: 'teal',
      },
      {
        label: 'MySQL',
        status: 'Online',
        detail: 'Conexao principal ativa para leitura e atualizacao.',
        tone: 'gold',
      },
      {
        label: 'Schema',
        status: dbConfig.database,
        detail: `${tableNames.length} tabelas visiveis no ambiente atual.`,
        tone: 'slate',
      },
    ],
    changes,
  }
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

function requireAdmin(request, response, next) {
  if (request.sessionUser.role !== 'admin') {
    response.status(403).send('Acesso restrito ao administrador.')
    return
  }

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
  const suppliedAdminKey = String(request.headers['x-admin-access-key'] || '').trim()

  if (!role || !identifier || !password) {
    response.status(400).send('Dados de login incompletos.')
    return
  }

  if (role === 'admin') {
    if (!adminAccessKey) {
      response.status(503).send('Acesso administrativo indisponivel.')
      return
    }

    if (!suppliedAdminKey || suppliedAdminKey !== adminAccessKey) {
      response.status(403).send('Chave administrativa invalida.')
      return
    }
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
    response.json({
      kind: 'admin',
      ...(await buildAdminOverview()),
    })
    return
  }

  response.json(buildBaseDashboard(role, sessionUser.name, sessionUser.territory))
})

app.get('/api/admin/overview', authenticate, requireAdmin, async (_request, response) => {
  response.json(await buildAdminOverview())
})

app.get('/api/admin/users', authenticate, requireAdmin, async (_request, response) => {
  response.json(await buildAdminUsersDashboard())
})

app.post('/api/admin/users', authenticate, requireAdmin, async (request, response) => {
  const {
    name,
    role,
    identifier,
    password,
    territory,
  } = request.body || {}

  if (!name || !role || !identifier || !password) {
    response.status(400).send('Preencha nome, perfil, identificador e senha.')
    return
  }

  if (!['population', 'doctor', 'collector', 'admin'].includes(String(role))) {
    response.status(400).send('Perfil invalido para cadastro.')
    return
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO usuarios (nome, perfil, identificador_login, senha, territorio, ativo)
       VALUES (?, ?, ?, ?, ?, 1)`,
      [
        String(name).trim(),
        String(role).trim(),
        String(identifier).trim(),
        String(password),
        String(territory || '').trim() || null,
      ],
    )

    response.status(201).json({
      id: String(result.insertId),
    })
  } catch (error) {
    if (error && typeof error === 'object' && error.code === 'ER_DUP_ENTRY') {
      response.status(409).send('Ja existe um usuario com esse identificador de login.')
      return
    }

    response.status(500).send('Nao foi possivel cadastrar o usuario.')
  }
})

app.patch('/api/admin/users/:id/status', authenticate, requireAdmin, async (request, response) => {
  const targetId = String(request.params.id || '').trim()
  const { active } = request.body || {}

  if (!targetId) {
    response.status(400).send('Usuario alvo nao informado.')
    return
  }

  if (typeof active !== 'boolean') {
    response.status(400).send('Status invalido para atualizacao.')
    return
  }

  if (request.sessionUser.id === targetId && !active) {
    response.status(400).send('Nao e permitido desativar o proprio usuario admin em uso.')
    return
  }

  const [result] = await pool.query(
    `UPDATE usuarios
        SET ativo = ?,
            atualizado_em = NOW()
      WHERE id_usuario = ?`,
    [active ? 1 : 0, targetId],
  )

  if (result.affectedRows === 0) {
    response.status(404).send('Usuario nao encontrado.')
    return
  }

  response.json({
    id: targetId,
    active,
    status: active ? 'Ativo' : 'Inativo',
  })
})

app.get('/api/admin/database', authenticate, requireAdmin, async (_request, response) => {
  response.json(await buildAdminDatabaseDashboard())
})

const port = Number(process.env.PORT || 3001)

async function startServer() {
  try {
    await ensureAuditInfrastructure()
    app.listen(port, () => {
      console.log(`API do portal ativa em http://localhost:${port}/api`)
    })
  } catch (error) {
    console.error('Falha ao preparar auditoria do banco:', error)
    app.listen(port, () => {
      console.log(`API do portal ativa em http://localhost:${port}/api`)
    })
  }
}

void startServer()
