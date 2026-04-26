// Arquivo principal da API.
// Concentra infraestrutura do MySQL, autenticacao, rotas e deploy do frontend compilado.
import crypto from 'node:crypto'
import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import mysql from 'mysql2/promise'

const currentFilePath = fileURLToPath(import.meta.url)
const currentDir = dirname(currentFilePath)

if (!process.env.VERCEL) {
  dotenv.config({ path: resolve(currentDir, '.env') })
  dotenv.config()
}

const roleLabels = {
  population: 'Morador ribeirinho',
  nurse: 'Enfermagem',
  doctor: 'Medico',
  collector: 'Agente de campo',
  admin: 'Administrador',
}

const app = express()
const sessions = new Map()
const adminAccessKey = process.env.ADMIN_ACCESS_KEY?.trim() || ''
const sessionSecret =
  process.env.SESSION_SECRET?.trim() ||
  adminAccessKey ||
  process.env.VERCEL_URL ||
  'aquasafe-local-session'
let infrastructureReadyPromise = null

const dbConfig = {
  host: process.env.MYSQLHOST || process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.MYSQLPORT || process.env.DB_PORT || 3306),
  user: process.env.MYSQLUSER || process.env.DB_USER || 'banco',
  password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || '1234',
  database: process.env.MYSQLDATABASE || process.env.DB_NAME || 'mercuriorionegro',
}

const pool = mysql.createPool({
  ...dbConfig,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
})

app.use(cors())
app.use(express.json({ limit: '12mb' }))

app.use('/api', async (_request, response, next) => {
  try {
    await ensureInfrastructure()
    next()
  } catch (error) {
    console.error('Falha ao preparar infraestrutura do banco:', error)
    response.status(503).send('Banco indisponivel no momento.')
  }
})

const clientDistPath = resolve(currentDir, '..', 'dist')
const clientIndexPath = resolve(clientDistPath, 'index.html')

function formatDate(value = new Date()) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(value)
}

function formatMysqlDateTime(value) {
  const date = value instanceof Date ? value : new Date(value)

  if (Number.isNaN(date.getTime())) {
    return null
  }

  const pad = (part) => String(part).padStart(2, '0')

  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
  ].join('-') + ` ${pad(date.getHours())}:${pad(date.getMinutes())}:00`
}

function normalizeReturnAt(value) {
  const rawValue = String(value || '').trim()

  if (!rawValue) {
    return null
  }

  return formatMysqlDateTime(rawValue)
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

async function ensureCoreInfrastructure() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id_usuario BIGINT NOT NULL AUTO_INCREMENT,
      nome VARCHAR(150) NOT NULL,
      perfil ENUM('population', 'nurse', 'doctor', 'collector', 'admin') NOT NULL,
      identificador_login VARCHAR(120) NOT NULL,
      senha VARCHAR(120) NOT NULL,
      territorio VARCHAR(180) NULL,
      ativo TINYINT(1) NOT NULL DEFAULT 1,
      criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id_usuario),
      UNIQUE KEY uq_usuarios_identificador_login (identificador_login),
      KEY idx_usuarios_perfil (perfil)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
  `)

  await pool.query(
    "ALTER TABLE usuarios MODIFY perfil ENUM('population', 'nurse', 'doctor', 'collector', 'admin') NOT NULL",
  )

  await pool.query(`
    CREATE TABLE IF NOT EXISTS comunidades (
      id_comunidade BIGINT NOT NULL AUTO_INCREMENT,
      municipio_comunidade VARCHAR(180) NOT NULL,
      territorio VARCHAR(180) NULL,
      criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id_comunidade)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
  `)

  await pool.query(`
    CREATE TABLE IF NOT EXISTS pesquisadores (
      id_pesquisador BIGINT NOT NULL AUTO_INCREMENT,
      nome VARCHAR(150) NOT NULL,
      instituicao VARCHAR(150) NULL,
      criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id_pesquisador)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
  `)

  await pool.query(`
    CREATE TABLE IF NOT EXISTS registros_mercuario (
      id_registo VARCHAR(120) NOT NULL,
      comunidade VARCHAR(180) NULL,
      tipo_amostra VARCHAR(120) NULL,
      risco VARCHAR(40) NULL,
      criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id_registo)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
  `)

  await seedCoreData()
}

async function seedCoreData() {
  const [userRows] = await pool.query('SELECT COUNT(*) AS total FROM usuarios')

  if ((userRows[0]?.total ?? 0) === 0) {
    await pool.query(
      `INSERT INTO usuarios (nome, perfil, identificador_login, senha, territorio, ativo)
       VALUES
        (?, ?, ?, ?, ?, 1),
        (?, ?, ?, ?, ?, 1),
        (?, ?, ?, ?, ?, 1),
        (?, ?, ?, ?, ?, 1),
        (?, ?, ?, ?, ?, 1)`,
      [
        'Maria do Carmo',
        'population',
        '111.111.111-11',
        'demo123',
        'Comunidade Sao Tome - Baixo Rio Negro',
        'Dra. Ana Ribeiro',
        'doctor',
        'CRM-AM 10234',
        'medico123',
        'UBS Fluvial Rio Negro',
        'Tec. Enf. Carla Mendes',
        'nurse',
        'ENF-310',
        'triagem123',
        'UBS Fluvial Rio Negro',
        'Joao Batista',
        'collector',
        'AGT-204',
        'coleta123',
        'Equipe de campo - Trecho Manaus / Barcelos',
        'Administrador AquaSafe',
        'admin',
        'admin',
        'admin123',
        'Painel administrativo',
      ],
    )
  }

  await pool.query(
    `INSERT IGNORE INTO usuarios (nome, perfil, identificador_login, senha, territorio, ativo)
     VALUES (?, ?, ?, ?, ?, 1)`,
    [
      'Tec. Enf. Carla Mendes',
      'nurse',
      'ENF-310',
      'triagem123',
      'UBS Fluvial Rio Negro',
    ],
  )

  const [communityRows] = await pool.query('SELECT COUNT(*) AS total FROM comunidades')

  if ((communityRows[0]?.total ?? 0) === 0) {
    await pool.query(
      `INSERT INTO comunidades (municipio_comunidade, territorio)
       VALUES
        (?, ?),
        (?, ?),
        (?, ?),
        (?, ?),
        (?, ?)`,
      [
        'Manaus / Baixo Rio Negro',
        'Baixo Rio Negro',
        'Novo Airao',
        'Baixo-medio Rio Negro',
        'Barcelos',
        'Medio Rio Negro',
        'Santa Isabel do Rio Negro',
        'Alto Rio Negro',
        'Sao Gabriel da Cachoeira',
        'Alto Rio Negro',
      ],
    )
  }
}

async function ensureClinicalInfrastructure() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS clinical_patient_cases (
      id_caso BIGINT NOT NULL AUTO_INCREMENT,
      patient_name VARCHAR(150) NOT NULL,
      community VARCHAR(150) NOT NULL,
      risk_label VARCHAR(40) NOT NULL,
      case_status VARCHAR(80) NOT NULL,
      next_step TEXT NOT NULL,
      priority_group VARCHAR(80) NOT NULL,
      symptoms TEXT NOT NULL,
      exposure_summary TEXT NOT NULL,
      clinical_note TEXT NULL,
      return_at DATETIME NULL,
      last_action VARCHAR(120) NOT NULL DEFAULT 'Aguardando conduta',
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id_caso),
      KEY idx_clinical_patient_cases_risk (risk_label),
      KEY idx_clinical_patient_cases_status (case_status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
  `)

  await pool.query(`
    CREATE TABLE IF NOT EXISTS clinical_case_actions (
      id_acao BIGINT NOT NULL AUTO_INCREMENT,
      case_id BIGINT NOT NULL,
      doctor_user_id VARCHAR(120) NOT NULL,
      action_type VARCHAR(60) NOT NULL,
      note TEXT NULL,
      return_at DATETIME NULL,
      next_status VARCHAR(80) NOT NULL,
      next_step TEXT NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id_acao),
      KEY idx_clinical_case_actions_case_id (case_id),
      CONSTRAINT fk_clinical_case_actions_case
        FOREIGN KEY (case_id) REFERENCES clinical_patient_cases(id_caso)
        ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
  `)

  await ensureColumnExists(
    'clinical_patient_cases',
    'return_at',
    'DATETIME NULL AFTER clinical_note',
  )
  await ensureColumnExists(
    'clinical_case_actions',
    'return_at',
    'DATETIME NULL AFTER note',
  )

  const [rows] = await pool.query('SELECT COUNT(*) AS total FROM clinical_patient_cases')

  if ((rows[0]?.total ?? 0) > 0) {
    return
  }

  if (process.env.SEED_DEMO_CASES !== 'true') {
    return
  }

  await pool.query(
    `INSERT INTO clinical_patient_cases
      (patient_name, community, risk_label, case_status, next_step, priority_group, symptoms, exposure_summary, last_action)
     VALUES
      (?, ?, ?, ?, ?, ?, ?, ?, ?),
      (?, ?, ?, ?, ?, ?, ?, ?, ?),
      (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      'A. S. M.',
      'Sao Gabriel da Cachoeira',
      'Muito alto',
      'Revisao medica hoje',
      'Solicitar biomarcador e revisar dieta da familia.',
      'Gestante',
      'Dormencia nas maos, cefaleia recorrente e tontura.',
      'Consumo de peixe local em quase todos os dias da semana.',
      'Aguardando conduta',
      'L. P. O.',
      'Barcelos',
      'Alto',
      'Retorno em aberto',
      'Reforcar triagem neurologica e orientar reducao de consumo.',
      'Crianca',
      'Tremor leve e dificuldade de concentracao relatada pela familia.',
      'Consumo frequente de jaraqui e tucunare.',
      'Aguardando retorno',
      'M. A. C.',
      'Novo Airao',
      'Moderado',
      'Teleconsulta sugerida',
      'Checar evolucao dos sintomas e alinhar coleta complementar.',
      'Adulto sintomatico',
      'Parestesia ocasional e relato de visao turva.',
      'Consumo de pescado local 3 a 4 vezes por semana.',
      'Aguardando avaliacao',
    ],
  )
}

async function ensureCollectionInfrastructure() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS field_collections (
      id_coleta BIGINT NOT NULL AUTO_INCREMENT,
      external_id VARCHAR(80) NOT NULL,
      community VARCHAR(150) NOT NULL,
      sample_type VARCHAR(120) NOT NULL,
      protocol_id VARCHAR(120) NULL,
      protocol_title VARCHAR(180) NULL,
      article_refs_json TEXT NULL,
      required_fields_json TEXT NULL,
      collector_user_id VARCHAR(120) NOT NULL,
      collector_name VARCHAR(150) NOT NULL,
      sample_status VARCHAR(180) NOT NULL,
      latitude DECIMAL(10, 7) NOT NULL,
      longitude DECIMAL(10, 7) NOT NULL,
      risk ENUM('medium', 'high', 'critical') NOT NULL DEFAULT 'medium',
      field_note TEXT NULL,
      photos_json LONGTEXT NULL,
      collected_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id_coleta),
      UNIQUE KEY uq_field_collections_external_id (external_id),
      KEY idx_field_collections_collected_at (collected_at),
      KEY idx_field_collections_risk (risk),
      KEY idx_field_collections_community (community)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
  `)

  await ensureColumnExists('field_collections', 'field_note', 'TEXT NULL AFTER risk')
  await ensureColumnExists(
    'field_collections',
    'protocol_id',
    'VARCHAR(120) NULL AFTER sample_type',
  )
  await ensureColumnExists(
    'field_collections',
    'protocol_title',
    'VARCHAR(180) NULL AFTER protocol_id',
  )
  await ensureColumnExists(
    'field_collections',
    'article_refs_json',
    'TEXT NULL AFTER protocol_title',
  )
  await ensureColumnExists(
    'field_collections',
    'required_fields_json',
    'TEXT NULL AFTER article_refs_json',
  )
  await ensureColumnExists(
    'field_collections',
    'photos_json',
    'LONGTEXT NULL AFTER field_note',
  )
}

async function ensureSupportInfrastructure() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS support_requests (
      id_solicitacao BIGINT NOT NULL AUTO_INCREMENT,
      protocol VARCHAR(40) NOT NULL,
      selected_role VARCHAR(40) NULL,
      requester_name VARCHAR(150) NOT NULL,
      contact_info VARCHAR(180) NOT NULL,
      message TEXT NOT NULL,
      request_status VARCHAR(40) NOT NULL DEFAULT 'Aberto',
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id_solicitacao),
      UNIQUE KEY uq_support_requests_protocol (protocol),
      KEY idx_support_requests_created_at (created_at),
      KEY idx_support_requests_status (request_status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
  `)
}

async function ensureOneTimeOperationalReset() {
  const migrationKey = 'initial_operational_reset_20260426'

  await pool.query(`
    CREATE TABLE IF NOT EXISTS system_migrations (
      migration_key VARCHAR(120) PRIMARY KEY,
      applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
  `)

  const [rows] = await pool.query(
    'SELECT migration_key FROM system_migrations WHERE migration_key = ? LIMIT 1',
    [migrationKey],
  )

  if (rows.length > 0) {
    return
  }

  const resetTables = [
    ['clinical_case_actions', true],
    ['clinical_patient_cases', true],
    ['field_collections', true],
    ['support_requests', true],
    ['registros_mercuario', false],
    ['admin_change_log', true],
  ]

  for (const [tableName, resetIncrement] of resetTables) {
    await pool.query(`DELETE FROM \`${tableName}\``)

    if (resetIncrement) {
      await pool.query(`ALTER TABLE \`${tableName}\` AUTO_INCREMENT = 1`)
    }
  }

  await pool.query('INSERT INTO system_migrations (migration_key) VALUES (?)', [
    migrationKey,
  ])
}

function base64UrlEncode(value) {
  return Buffer.from(value).toString('base64url')
}

function base64UrlDecode(value) {
  return Buffer.from(value, 'base64url').toString('utf8')
}

function signValue(value) {
  return crypto.createHmac('sha256', sessionSecret).update(value).digest('base64url')
}

function createSessionToken(sessionUser) {
  const payload = base64UrlEncode(JSON.stringify(sessionUser))
  const signature = signValue(payload)
  return `asf.${payload}.${signature}`
}

function verifySessionToken(token) {
  const [prefix, payload, signature] = String(token || '').split('.')

  if (prefix !== 'asf' || !payload || !signature) {
    return null
  }

  if (signValue(payload) !== signature) {
    return null
  }

  try {
    const user = JSON.parse(base64UrlDecode(payload))

    if (!user?.id || !user?.role) {
      return null
    }

    return user
  } catch {
    return null
  }
}

async function ensureColumnExists(tableName, columnName, definition) {
  const [rows] = await pool.query(
    `SELECT COUNT(*) AS total
       FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = ?
        AND TABLE_NAME = ?
        AND COLUMN_NAME = ?`,
    [dbConfig.database, tableName, columnName],
  )

  if ((rows[0]?.total ?? 0) > 0) {
    return
  }

  await pool.query(`ALTER TABLE \`${tableName}\` ADD COLUMN \`${columnName}\` ${definition}`)
}

function mapClinicalCase(row) {
  return {
    id: String(row.id_caso),
    patient: row.patient_name,
    community: row.community,
    risk: row.risk_label,
    status: row.case_status,
    nextStep: row.next_step,
    priorityGroup: row.priority_group,
    symptoms: row.symptoms,
    exposureSummary: row.exposure_summary,
    clinicalNote: row.clinical_note || '',
    lastAction: row.last_action,
    updatedAt: formatDate(row.updated_at),
    returnAt: row.return_at ? formatDate(row.return_at) : '',
  }
}

function mapFieldCollection(row, { includePhotos = false } = {}) {
  let photos = []
  let articleRefs = []
  let requiredFields = []

  if (row.photos_json) {
    try {
      const parsed = JSON.parse(row.photos_json)
      if (Array.isArray(parsed)) {
        photos = includePhotos ? parsed : []
      }
    } catch {
      photos = []
    }
  }

  if (row.article_refs_json) {
    try {
      const parsed = JSON.parse(row.article_refs_json)
      if (Array.isArray(parsed)) {
        articleRefs = parsed.map((item) => String(item)).filter(Boolean)
      }
    } catch {
      articleRefs = []
    }
  }

  if (row.required_fields_json) {
    try {
      const parsed = JSON.parse(row.required_fields_json)
      if (Array.isArray(parsed)) {
        requiredFields = parsed.map((item) => String(item)).filter(Boolean)
      }
    } catch {
      requiredFields = []
    }
  }

  return {
    id: row.external_id,
    collectionNumber: Number(row.id_coleta),
    community: row.community,
    sampleType: row.sample_type,
    protocolId: row.protocol_id || undefined,
    protocolTitle: row.protocol_title || undefined,
    articleRefs,
    requiredFields,
    collector: row.collector_name,
    status: row.sample_status,
    collectedAt: formatDate(row.collected_at),
    lat: Number(row.latitude),
    lng: Number(row.longitude),
    risk: row.risk,
    note: row.field_note || '',
    photos,
    photoCount: photos.length || countCollectionPhotos(row.photos_json),
  }
}

function countCollectionPhotos(serializedPhotos) {
  if (!serializedPhotos) {
    return 0
  }

  try {
    const parsed = JSON.parse(serializedPhotos)
    return Array.isArray(parsed) ? parsed.length : 0
  } catch {
    return 0
  }
}

async function listFieldCollections(filters = {}) {
  const whereClauses = []
  const values = []
  const query = String(filters.query || '').trim()
  const risk = String(filters.risk || '').trim()
  const community = String(filters.community || '').trim()
  const limit = Math.min(Math.max(Number(filters.limit) || 30, 1), 250)

  if (query) {
    const likeQuery = `%${query}%`
    const numericQuery = Number(query.replace(/^0+/, '') || query)

    whereClauses.push(`(
      external_id LIKE ?
      OR community LIKE ?
      OR sample_type LIKE ?
      OR protocol_title LIKE ?
      OR article_refs_json LIKE ?
      OR collector_name LIKE ?
      OR sample_status LIKE ?
      OR field_note LIKE ?
      OR LPAD(CAST(id_coleta AS CHAR), 4, '0') LIKE ?
      ${Number.isFinite(numericQuery) ? 'OR id_coleta = ?' : ''}
    )`)

    values.push(
      likeQuery,
      likeQuery,
      likeQuery,
      likeQuery,
      likeQuery,
      likeQuery,
      likeQuery,
      likeQuery,
      likeQuery,
    )

    if (Number.isFinite(numericQuery)) {
      values.push(numericQuery)
    }
  }

  if (['medium', 'high', 'critical'].includes(risk)) {
    whereClauses.push('risk = ?')
    values.push(risk)
  }

  if (community) {
    whereClauses.push('community = ?')
    values.push(community)
  }

  values.push(limit)

  const [rows] = await pool.query(
    `SELECT id_coleta, external_id, community, sample_type, collector_name, sample_status,
            protocol_id, protocol_title, article_refs_json, required_fields_json,
            latitude, longitude, risk, field_note, photos_json, collected_at
       FROM field_collections
      ${whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : ''}
      ORDER BY id_coleta DESC
      LIMIT ?`,
    values,
  )

  return rows.map((row) => mapFieldCollection(row))
}

async function getFieldCollectionByExternalId(externalId) {
  const [rows] = await pool.query(
    `SELECT id_coleta, external_id, community, sample_type, collector_name, sample_status,
            protocol_id, protocol_title, article_refs_json, required_fields_json,
            latitude, longitude, risk, field_note, photos_json, collected_at
       FROM field_collections
      WHERE external_id = ?
      LIMIT 1`,
    [externalId],
  )

  return rows[0] ? mapFieldCollection(rows[0], { includePhotos: true }) : null
}

async function registerFieldCollection(user, payload) {
  const id = String(payload.id || `COL-${Date.now()}`).trim()
  const community = String(payload.community || '').trim()
  const sampleType = String(payload.sampleType || '').trim()
  const protocolId = String(payload.protocolId || '').trim() || null
  const protocolTitle = String(payload.protocolTitle || '').trim() || null
  const articleRefs = Array.isArray(payload.articleRefs)
    ? payload.articleRefs.map((item) => String(item).trim()).filter(Boolean).slice(0, 12)
    : []
  const requiredFields = Array.isArray(payload.requiredFields)
    ? payload.requiredFields.map((item) => String(item).trim()).filter(Boolean).slice(0, 20)
    : []
  const status = String(payload.status || '').trim() || 'Coletado em campo'
  const lat = Number(payload.lat)
  const lng = Number(payload.lng)
  const risk = String(payload.risk || 'medium')
  const note = String(payload.note || '').trim()
  const photos = Array.isArray(payload.photos)
    ? payload.photos
        .filter((photo) =>
          photo &&
          typeof photo === 'object' &&
          typeof photo.id === 'string' &&
          typeof photo.name === 'string' &&
          typeof photo.dataUrl === 'string',
        )
        .slice(0, 3)
    : []
  const serializedPhotos = JSON.stringify(photos)

  if (!id || !community || !sampleType) {
    return { error: 'Dados da coleta incompletos.' }
  }

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return { error: 'Coordenadas da coleta invalidas.' }
  }

  if (!['medium', 'high', 'critical'].includes(risk)) {
    return { error: 'Nivel de risco invalido.' }
  }

  await pool.query(
    `INSERT INTO field_collections
      (external_id, community, sample_type, protocol_id, protocol_title,
       article_refs_json, required_fields_json, collector_user_id, collector_name,
       sample_status, latitude, longitude, risk, field_note, photos_json)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       community = VALUES(community),
       sample_type = VALUES(sample_type),
       protocol_id = VALUES(protocol_id),
       protocol_title = VALUES(protocol_title),
       article_refs_json = VALUES(article_refs_json),
       required_fields_json = VALUES(required_fields_json),
       collector_user_id = VALUES(collector_user_id),
       collector_name = VALUES(collector_name),
       sample_status = VALUES(sample_status),
       latitude = VALUES(latitude),
       longitude = VALUES(longitude),
       risk = VALUES(risk),
       field_note = VALUES(field_note),
       photos_json = VALUES(photos_json)`,
    [
      id,
      community,
      sampleType,
      protocolId,
      protocolTitle,
      JSON.stringify(articleRefs),
      JSON.stringify(requiredFields),
      user.id,
      user.name,
      status,
      lat,
      lng,
      risk,
      note || null,
      serializedPhotos,
    ],
  )

  const [rows] = await pool.query(
    `SELECT id_coleta, external_id, community, sample_type, collector_name, sample_status,
            protocol_id, protocol_title, article_refs_json, required_fields_json,
            latitude, longitude, risk, field_note, photos_json, collected_at
       FROM field_collections
      WHERE external_id = ?
      LIMIT 1`,
    [id],
  )

  return {
    collection: rows[0]
      ? mapFieldCollection(rows[0], { includePhotos: true })
      : null,
  }
}

function createSupportProtocol() {
  const datePart = new Date()
    .toISOString()
    .slice(0, 10)
    .replaceAll('-', '')
  const randomPart = crypto.randomBytes(3).toString('hex').toUpperCase()

  return `AQ-${datePart}-${randomPart}`
}

async function registerSupportRequest(payload) {
  const selectedRole = String(payload.role || '').trim() || null
  const requesterName = String(payload.name || '').trim()
  const contactInfo = String(payload.contact || '').trim()
  const message = String(payload.message || '').trim()

  if (!requesterName || !contactInfo || !message) {
    return { error: 'Preencha nome, contato e mensagem para abrir atendimento.' }
  }

  if (requesterName.length > 150 || contactInfo.length > 180 || message.length > 1200) {
    return { error: 'Revise os campos: alguma informacao ficou longa demais.' }
  }

  const protocol = createSupportProtocol()

  await pool.query(
    `INSERT INTO support_requests
      (protocol, selected_role, requester_name, contact_info, message)
     VALUES (?, ?, ?, ?, ?)`,
    [protocol, selectedRole, requesterName, contactInfo, message],
  )

  return {
    request: {
      protocol,
      status: 'Aberto',
      createdAt: formatDate(new Date()),
    },
  }
}

async function listClinicalCases() {
  const [rows] = await pool.query(
    `SELECT id_caso, patient_name, community, risk_label, case_status, next_step,
            priority_group, symptoms, exposure_summary, clinical_note, return_at, last_action, updated_at
       FROM clinical_patient_cases
      ORDER BY FIELD(risk_label, 'Muito alto', 'Alto', 'Moderado'), updated_at DESC`,
  )

  return rows.map(mapClinicalCase)
}

async function createTriageClinicalCase(payload) {
  const patient = String(payload.patient || '').trim()
  const community = String(payload.community || '').trim()
  const risk = String(payload.risk || 'Moderado').trim()
  const priorityGroup = String(payload.priorityGroup || 'Adulto sintomatico').trim()
  const symptoms = String(payload.symptoms || '').trim()
  const exposureSummary = String(payload.exposureSummary || '').trim()
  const note = String(payload.note || '').trim()

  if (!patient || !community || !symptoms || !exposureSummary) {
    return { error: 'Preencha paciente, comunidade, sintomas e exposicao.' }
  }

  if (!['Moderado', 'Alto', 'Muito alto'].includes(risk)) {
    return { error: 'Risco inicial invalido.' }
  }

  const [result] = await pool.query(
    `INSERT INTO clinical_patient_cases
      (patient_name, community, risk_label, case_status, next_step, priority_group,
       symptoms, exposure_summary, clinical_note, last_action)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      patient,
      community,
      risk,
      'Aguardando medico',
      'Medico deve revisar triagem e definir conduta.',
      priorityGroup,
      symptoms,
      exposureSummary,
      note || null,
      'Triagem enviada ao medico',
    ],
  )

  const [rows] = await pool.query(
    `SELECT id_caso, patient_name, community, risk_label, case_status, next_step,
            priority_group, symptoms, exposure_summary, clinical_note, return_at, last_action, updated_at
       FROM clinical_patient_cases
      WHERE id_caso = ?
      LIMIT 1`,
    [result.insertId],
  )

  return {
    case: rows[0] ? mapClinicalCase(rows[0]) : null,
  }
}

function resolveDoctorAction(action) {
  if (action === 'request_biomarker') {
    return {
      label: 'Biomarcador solicitado',
      status: 'Aguardando biomarcador',
      nextStep: 'Coletar biomarcador e revisar resultado.',
    }
  }

  if (action === 'schedule_return') {
    return {
      label: 'Retorno marcado',
      status: 'Retorno agendado',
      nextStep: 'Reavaliar sintomas e consumo de peixe.',
    }
  }

  return {
    label: 'Conduta registrada',
    status: 'Conduta registrada',
    nextStep: 'Acompanhar evolucao no proximo contato.',
  }
}

function resolveTriageAction(action, returnAt) {
  if (action === 'send_to_doctor') {
    return {
      label: 'Encaminhado ao medico',
      status: 'Aguardando medico',
      nextStep: 'Medico deve revisar triagem e definir conduta.',
    }
  }

  if (action === 'request_biomarker') {
    return {
      label: 'Biomarcador solicitado pela triagem',
      status: 'Aguardando biomarcador',
      nextStep: 'Coletar biomarcador e encaminhar resultado ao medico.',
    }
  }

  if (action === 'schedule_return') {
    const returnLabel = returnAt ? formatDate(new Date(returnAt)) : 'data agendada'

    return {
      label: 'Retorno marcado pela triagem',
      status: 'Retorno agendado',
      nextStep: `Reavaliar paciente no retorno de ${returnLabel}.`,
    }
  }

  return {
    label: 'Prioridade classificada',
    status: 'Triagem concluida',
    nextStep: 'Aguardar chamada conforme prioridade e sinais registrados.',
  }
}

async function registerDoctorCaseAction(caseId, doctorUserId, action, note) {
  const resolvedAction = resolveDoctorAction(action)

  const [result] = await pool.query(
    `UPDATE clinical_patient_cases
        SET case_status = ?,
            next_step = ?,
            clinical_note = ?,
            last_action = ?
      WHERE id_caso = ?`,
    [
      resolvedAction.status,
      resolvedAction.nextStep,
      note || null,
      resolvedAction.label,
      caseId,
    ],
  )

  if (result.affectedRows === 0) {
    return null
  }

  await pool.query(
    `INSERT INTO clinical_case_actions
      (case_id, doctor_user_id, action_type, note, next_status, next_step)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      caseId,
      doctorUserId,
      action,
      note || null,
      resolvedAction.status,
      resolvedAction.nextStep,
    ],
  )

  const [rows] = await pool.query(
    `SELECT id_caso, patient_name, community, risk_label, case_status, next_step,
            priority_group, symptoms, exposure_summary, clinical_note, return_at, last_action, updated_at
       FROM clinical_patient_cases
      WHERE id_caso = ?
      LIMIT 1`,
    [caseId],
  )

  return rows[0] ? mapClinicalCase(rows[0]) : null
}

async function registerTriageCaseAction(caseId, nurseUserId, action, note, returnAtValue) {
  const returnAt = action === 'schedule_return' ? normalizeReturnAt(returnAtValue) : null

  if (action === 'schedule_return' && !returnAt) {
    return { error: 'Informe a data e hora do retorno.' }
  }

  const resolvedAction = resolveTriageAction(action, returnAt)

  const [result] = await pool.query(
    `UPDATE clinical_patient_cases
        SET case_status = ?,
            next_step = ?,
            clinical_note = ?,
            return_at = ?,
            last_action = ?
      WHERE id_caso = ?`,
    [
      resolvedAction.status,
      resolvedAction.nextStep,
      note || null,
      returnAt,
      resolvedAction.label,
      caseId,
    ],
  )

  if (result.affectedRows === 0) {
    return null
  }

  await pool.query(
    `INSERT INTO clinical_case_actions
      (case_id, doctor_user_id, action_type, note, return_at, next_status, next_step)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      caseId,
      nurseUserId,
      action,
      note || null,
      returnAt,
      resolvedAction.status,
      resolvedAction.nextStep,
    ],
  )

  const [rows] = await pool.query(
    `SELECT id_caso, patient_name, community, risk_label, case_status, next_step,
            priority_group, symptoms, exposure_summary, clinical_note, return_at, last_action, updated_at
       FROM clinical_patient_cases
      WHERE id_caso = ?
      LIMIT 1`,
    [caseId],
  )

  return rows[0] ? mapClinicalCase(rows[0]) : null
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

async function buildBaseDashboard(role, userName, territory) {
  if (role === 'population') {
    return {
      kind: 'population',
      headline: `Painel da comunidade para ${userName}.`,
      summary:
        'Comunicados, visitas e registros da comunidade em uma tela unica.',
      stats: [
        {
          label: 'Comunicados',
          value: '0',
          detail: 'Nenhum comunicado registrado para teste inicial.',
          tone: 'coral',
        },
        {
          label: 'Visitas agendadas',
          value: '0',
          detail: 'Nenhuma visita comunitaria cadastrada.',
          tone: 'gold',
        },
        {
          label: 'Registros da familia',
          value: '0',
          detail: 'Nenhum registro familiar enviado ainda.',
          tone: 'teal',
        },
        {
          label: 'Territorio',
          value: territory || 'Nao informado',
          detail: 'Local associado ao usuario logado.',
          tone: 'slate',
        },
      ],
      alerts: [],
      todayActions: [],
      warningSigns: [],
      appointments: [],
      supportPoints: [],
    }
  }

  if (role === 'doctor') {
    const allClinicalCases = await listClinicalCases()
    const clinicalCases = allClinicalCases.filter(
      (item) => item.status !== 'Conduta registrada',
    )
    const waitingConsultationCount = clinicalCases.filter((item) =>
      item.status.toLowerCase().includes('aguardando medico'),
    ).length
    const highRiskCount = clinicalCases.filter((item) =>
      ['Muito alto', 'Alto'].includes(item.risk),
    ).length
    const biomarkerPendingCount = clinicalCases.filter((item) =>
      item.status.toLowerCase().includes('biomarcador'),
    ).length

    return {
      kind: 'doctor',
      headline: `Painel clinico de ${userName}.`,
      summary: 'Triagem, casos priorizados e rotina clinica reunidos no mesmo lugar.',
      stats: [
        {
          label: 'Aguardando consulta',
          value: String(waitingConsultationCount),
          detail: 'Pacientes enviados pela triagem para avaliacao medica.',
          tone: 'coral',
        },
        {
          label: 'Casos alto risco',
          value: String(highRiskCount),
          detail: 'Pacientes com risco alto ou muito alto.',
          tone: 'gold',
        },
        {
          label: 'Biomarcadores pendentes',
          value: String(biomarkerPendingCount),
          detail: 'Solicitacoes aguardando coleta ou resultado.',
          tone: 'teal',
        },
        {
          label: 'Unidade',
          value: territory || 'Nao informada',
          detail: 'Unidade associada ao usuario logado.',
          tone: 'slate',
        },
      ],
      alerts: clinicalCases.length > 0
        ? [
            {
              id: 'alert-doc-api-1',
              title: 'Fila clinica atualizada',
              level: 'stable',
              community: territory || 'Unidade',
              updatedAt: formatDate(),
              description: 'Os casos disponiveis para revisao foram sincronizados.',
              action: 'Abrir os pacientes priorizados para revisar conduta.',
            },
          ]
        : [],
      cases: clinicalCases,
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

  if (role === 'nurse') {
    const clinicalCases = await listClinicalCases()
    const waitingCount = clinicalCases.filter((item) =>
      ['aguardando', 'triagem', 'retorno'].some((word) =>
        item.status.toLowerCase().includes(word),
      ),
    ).length
    const priorityCount = clinicalCases.filter((item) =>
      ['Muito alto', 'Alto'].includes(item.risk) ||
      ['Gestante', 'Crianca'].includes(item.priorityGroup),
    ).length
    const sentToDoctorCount = clinicalCases.filter((item) =>
      item.lastAction.toLowerCase().includes('medico'),
    ).length

    return {
      kind: 'nurse',
      headline: `Triagem de enfermagem de ${userName}.`,
      summary: 'Classificacao de prioridade, sinais e encaminhamento antes da conduta medica.',
      stats: [
        {
          label: 'Na fila de triagem',
          value: String(clinicalCases.length),
          detail: 'Pacientes disponiveis para classificacao inicial.',
          tone: 'coral',
        },
        {
          label: 'Prioritarios',
          value: String(priorityCount),
          detail: 'Gestantes, criancas ou risco alto/muito alto.',
          tone: 'gold',
        },
        {
          label: 'Encaminhados',
          value: String(sentToDoctorCount),
          detail: 'Casos ja direcionados para avaliacao medica.',
          tone: 'teal',
        },
        {
          label: 'Unidade',
          value: territory || 'Nao informada',
          detail: 'Unidade associada ao usuario logado.',
          tone: 'slate',
        },
      ],
      alerts: clinicalCases.length > 0
        ? [
            {
              id: 'alert-nurse-api-1',
              title: 'Triagem organiza a fila medica',
              level: waitingCount > 0 ? 'attention' : 'stable',
              community: territory || 'Unidade',
              updatedAt: formatDate(),
              description:
                'Registre sinais, consumo de peixe e grupo prioritario antes de encaminhar ao medico.',
              action: 'Abrir o paciente da fila e registrar a classificacao.',
            },
          ]
        : [],
      cases: clinicalCases,
      triageGuides: [
        'Confirmar comunidade, idade, gestacao e frequencia de consumo de peixe.',
        'Registrar sinais neurologicos: tremor, dormencia, tontura, visao turva ou equilibrio.',
        'Encaminhar ao medico gestantes, criancas e sintomas progressivos.',
      ],
      queueNotes: [
        'A enfermagem faz a primeira classificacao e deixa o caso pronto para decisao medica.',
        'Biomarcador pode ser solicitado na triagem quando houver exposicao recorrente.',
      ],
    }
  }

  const [collectionRows] = await pool.query(
    'SELECT COUNT(*) AS total FROM field_collections',
  )
  const collectionCount = Number(collectionRows[0]?.total || 0)

  return {
    kind: 'collector',
    headline: `Painel de campo de ${userName}.`,
    summary: 'Rota, checklist e coletas do dia reunidos em uma unica tela.',
    stats: [
      {
        label: 'Paradas hoje',
        value: '0',
        detail: 'Nenhuma parada planejada no roteiro atual.',
        tone: 'teal',
      },
      {
        label: 'Coletas registradas',
        value: String(collectionCount),
        detail: 'Total de coletas enviadas ao mapa.',
        tone: 'gold',
      },
      {
        label: 'Pendencias',
        value: '0',
        detail: 'Nenhuma pendencia operacional aberta.',
        tone: 'coral',
      },
      {
        label: 'Equipe',
        value: territory || 'Nao informada',
        detail: 'Equipe associada ao usuario logado.',
        tone: 'slate',
      },
    ],
    alerts: [],
    checklist: [],
    route: [],
    tasks: [],
    samples: [],
  }
}

async function authenticate(request, response, next) {
  const authorization = request.headers.authorization || ''
  const token = authorization.startsWith('Bearer ')
    ? authorization.slice('Bearer '.length)
    : ''

  if (!token || !sessions.has(token)) {
    const statelessUser = verifySessionToken(token)

    if (!statelessUser) {
      response.status(401).send('Sessao invalida.')
      return
    }

    request.sessionUser = statelessUser
    next()
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

  const sessionUser = {
    id: String(user.id_usuario),
    name: user.nome,
    role: user.perfil,
    roleLabel: roleLabels[user.perfil] || user.perfil,
    territory: user.territorio || 'Nao informado',
  }
  const token = createSessionToken(sessionUser)

  sessions.set(token, sessionUser)

  response.json({
    token,
    user: sessionUser,
  })
})

app.post('/api/support/contact', async (request, response) => {
  const result = await registerSupportRequest(request.body || {})

  if (result.error) {
    response.status(400).send(result.error)
    return
  }

  response.status(201).json(result.request)
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

  response.json(await buildBaseDashboard(role, sessionUser.name, sessionUser.territory))
})

app.post('/api/doctor/cases/:id/actions', authenticate, async (request, response) => {
  if (request.sessionUser.role !== 'doctor') {
    response.status(403).send('Acesso restrito ao medico.')
    return
  }

  const caseId = Number(request.params.id)
  const { action, note } = request.body || {}

  if (!Number.isFinite(caseId) || caseId <= 0) {
    response.status(400).send('Caso clinico invalido.')
    return
  }

  if (!['request_biomarker', 'schedule_return', 'save_conduct'].includes(String(action))) {
    response.status(400).send('Acao clinica invalida.')
    return
  }

  const updatedCase = await registerDoctorCaseAction(
    caseId,
    request.sessionUser.id,
    String(action),
    String(note || '').trim(),
  )

  if (!updatedCase) {
    response.status(404).send('Caso clinico nao encontrado.')
    return
  }

  response.json({ case: updatedCase })
})

app.post('/api/nurse/cases/:id/triage', authenticate, async (request, response) => {
  if (request.sessionUser.role !== 'nurse') {
    response.status(403).send('Acesso restrito a enfermagem.')
    return
  }

  const caseId = Number(request.params.id)
  const { action, note, returnAt } = request.body || {}

  if (!Number.isFinite(caseId) || caseId <= 0) {
    response.status(400).send('Caso clinico invalido.')
    return
  }

  if (
    !['classify_priority', 'send_to_doctor', 'request_biomarker', 'schedule_return'].includes(
      String(action),
    )
  ) {
    response.status(400).send('Acao de triagem invalida.')
    return
  }

  const updatedCase = await registerTriageCaseAction(
    caseId,
    request.sessionUser.id,
    String(action),
    String(note || '').trim(),
    returnAt,
  )

  if (updatedCase?.error) {
    response.status(400).send(updatedCase.error)
    return
  }

  if (!updatedCase) {
    response.status(404).send('Caso clinico nao encontrado.')
    return
  }

  response.json({ case: updatedCase })
})

app.post('/api/nurse/cases', authenticate, async (request, response) => {
  if (request.sessionUser.role !== 'nurse') {
    response.status(403).send('Acesso restrito a enfermagem.')
    return
  }

  const result = await createTriageClinicalCase(request.body || {})

  if (result.error) {
    response.status(400).send(result.error)
    return
  }

  response.status(201).json({ case: result.case })
})

app.get('/api/collections/live', authenticate, async (request, response) => {
  response.json(
    await listFieldCollections({
      query: request.query.q,
      risk: request.query.risk,
      community: request.query.community,
      limit: request.query.limit,
    }),
  )
})

app.get('/api/collections/live/:id', authenticate, async (request, response) => {
  if (!['collector', 'nurse', 'doctor', 'admin'].includes(request.sessionUser.role)) {
    response.status(403).send('Acesso restrito a equipe tecnica.')
    return
  }

  const collection = await getFieldCollectionByExternalId(String(request.params.id || ''))

  if (!collection) {
    response.status(404).send('Coleta nao encontrada.')
    return
  }

  response.json(collection)
})

app.post('/api/collections/live', authenticate, async (request, response) => {
  if (!['collector', 'admin'].includes(request.sessionUser.role)) {
    response.status(403).send('Acesso restrito a agentes de coleta.')
    return
  }

  const result = await registerFieldCollection(request.sessionUser, request.body || {})

  if (result.error) {
    response.status(400).send(result.error)
    return
  }

  response.status(201).json(result.collection)
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

  if (!['population', 'nurse', 'doctor', 'collector', 'admin'].includes(String(role))) {
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

if (existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath))

  app.get(/^(?!\/api(?:\/|$)).*/, (_request, response) => {
    response.sendFile(clientIndexPath)
  })
}

const port = Number(process.env.PORT || 3001)

async function ensureInfrastructure() {
  if (!infrastructureReadyPromise) {
    infrastructureReadyPromise = (async () => {
      await ensureCoreInfrastructure()
      await ensureAuditInfrastructure()
      await ensureClinicalInfrastructure()
      await ensureCollectionInfrastructure()
      await ensureSupportInfrastructure()
      await ensureOneTimeOperationalReset()
    })().catch((error) => {
      infrastructureReadyPromise = null
      throw error
    })
  }

  await infrastructureReadyPromise
}

async function startServer() {
  try {
    await ensureInfrastructure()
    app.listen(port, () => {
      console.log(`API do portal ativa em http://localhost:${port}/api`)
    })
  } catch (error) {
    console.error('Falha ao preparar infraestrutura do banco:', error)
    app.listen(port, () => {
      console.log(`API do portal ativa em http://localhost:${port}/api`)
    })
  }
}

if (!process.env.VERCEL) {
  void startServer()
}

export { app, ensureInfrastructure, startServer }
