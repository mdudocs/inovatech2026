import { AlertTriangle, ShieldUser } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { AdminSectionNav } from '../../components/admin/AdminSectionNav'
import { LoadingState } from '../../components/portal/LoadingState'
import { roleMeta } from '../../mockPortalData'
import type {
  AdminDatabaseDashboard,
  AdminOverviewDashboard,
  AdminSection,
  AdminUsersDashboard,
  AuthSession,
  CreateAdminUserPayload,
} from '../../portalTypes'
import {
  createAdminUser,
  fetchAdminDatabase,
  fetchAdminOverview,
  fetchAdminUsers,
  updateAdminUserStatus,
} from '../../services/portalApi'
import { AdminDatabaseSection } from '../../views/admin/AdminDatabaseSection'
import { AdminOverviewSection } from '../../views/admin/AdminOverviewSection'
import { AdminUsersSection } from '../../views/admin/AdminUsersSection'

const ADMIN_REFRESH_MS = 10000

function isAdminSection(value: string | undefined): value is AdminSection {
  return value === 'visao-geral' || value === 'usuarios' || value === 'banco'
}

type AdminSectionData =
  | AdminOverviewDashboard
  | AdminUsersDashboard
  | AdminDatabaseDashboard

export function AdminPortalPage({ session }: { session: AuthSession | null }) {
  // Esta pagina e a porta de entrada da area administrativa.
  // Ela decide qual secao carregar e mantem o refresh periodico dos dados.
  const { section } = useParams()
  const [data, setData] = useState<AdminSectionData | null>(null)
  const [loadedSection, setLoadedSection] = useState<AdminSection | null>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [error, setError] = useState('')
  const [pendingUserId, setPendingUserId] = useState<string | null>(null)

  useEffect(() => {
    if (!session || session.user.role !== 'admin' || !isAdminSection(section)) {
      return
    }

    const currentSession = session
    let active = true

    async function readSectionData(targetSection: AdminSection) {
      // Cada secao administrativa conversa com um endpoint diferente,
      // mas o fluxo de carregamento da pagina continua centralizado aqui.
      return targetSection === 'visao-geral'
        ? fetchAdminOverview(currentSession.token)
        : targetSection === 'usuarios'
          ? fetchAdminUsers(currentSession.token)
          : fetchAdminDatabase(currentSession.token)
    }

    async function loadSection(targetSection: AdminSection, background = false) {
      if (!background) {
        setStatus('loading')
        setError('')
        setLoadedSection(null)
      }

      try {
        const nextData = await readSectionData(targetSection)

        if (!active) {
          return
        }

        setData(nextData)
        setError('')
        setLoadedSection(targetSection)
        setStatus('ready')
      } catch (loadError) {
        if (!active) {
          return
        }

        const message =
          loadError instanceof Error
            ? loadError.message
            : 'Nao foi possivel carregar a area administrativa.'

        if (background) {
          setError(message)
          return
        }

        setLoadedSection(null)
        setStatus('error')
        setError(message)
      }
    }

    void loadSection(section, false)

    const intervalId = window.setInterval(() => {
      void loadSection(section, true)
    }, ADMIN_REFRESH_MS)

    return () => {
      active = false
      window.clearInterval(intervalId)
    }
  }, [section, session])

  if (!session) {
    return <Navigate to="/login" replace />
  }

  if (session.user.role !== 'admin') {
    return <Navigate to={roleMeta[session.user.role].route} replace />
  }

  if (!isAdminSection(section)) {
    return <Navigate to={roleMeta.admin.route} replace />
  }

  async function handleToggleUser(userId: string, nextActive: boolean) {
    if (!session || section !== 'usuarios' || !data || !('users' in data)) {
      return
    }

    const currentSession = session
    setPendingUserId(userId)
    setError('')

    try {
      await updateAdminUserStatus(currentSession.token, userId, nextActive)
      const refreshedUsers = await fetchAdminUsers(currentSession.token)
      setLoadedSection('usuarios')
      setData(refreshedUsers)
    } catch (updateError) {
      setError(
        updateError instanceof Error
          ? updateError.message
          : 'Nao foi possivel atualizar o usuario.',
      )
    } finally {
      setPendingUserId(null)
    }
  }

  async function handleCreateUser(payload: CreateAdminUserPayload) {
    if (!session || section !== 'usuarios') {
      return
    }

    const currentSession = session
    setError('')

    try {
      await createAdminUser(currentSession.token, payload)
      const refreshedUsers = await fetchAdminUsers(currentSession.token)
      setLoadedSection('usuarios')
      setData(refreshedUsers)
    } catch (createError) {
      setError(
        createError instanceof Error
          ? createError.message
          : 'Nao foi possivel cadastrar o usuario.',
      )
      throw createError
    }
  }

  if (status === 'loading' || !data || loadedSection !== section) {
    return <LoadingState />
  }

  if (status === 'error') {
    return (
      <section className="feedback-card">
        <AlertTriangle size={22} />
        <div>
          <strong>Falha ao carregar a area administrativa.</strong>
          <p>{error}</p>
        </div>
      </section>
    )
  }

  return (
    <div className="page-stack">
      <section className="portal-header">
        <div className="simple-card">
          <span className="section-badge">Administrador</span>
          <h1 className="section-title">{data.headline}</h1>
          <p className="section-text">{data.summary}</p>
        </div>
      </section>

      <section className="simple-card panel-card">
        <div className="card-head">
          <span className="feature-icon">
            <ShieldUser size={18} />
          </span>
          <div>
            <strong>Area administrativa</strong>
          </div>
        </div>
        <AdminSectionNav />
      </section>

      {error ? (
        <section className="form-error admin-inline-error">
          <strong>Acao nao concluida.</strong>
          <p>{error}</p>
        </section>
      ) : null}

      {section === 'visao-geral' ? (
        // Cada secao pesada fica separada em view propria para reduzir acoplamento.
        <AdminOverviewSection data={data as AdminOverviewDashboard} token={session.token} />
      ) : null}
      {section === 'usuarios' ? (
        <AdminUsersSection
          currentUserId={session.user.id}
          data={data as AdminUsersDashboard}
          onCreateUser={handleCreateUser}
          onToggleUser={handleToggleUser}
          pendingUserId={pendingUserId}
        />
      ) : null}
      {section === 'banco' ? <AdminDatabaseSection data={data as AdminDatabaseDashboard} /> : null}
    </div>
  )
}
