import { AlertTriangle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { InfoPill } from '../../components/portal/InfoPill'
import { LoadingState } from '../../components/portal/LoadingState'
import { MetricSection } from '../../components/portal/MetricSection'
import { roleMeta } from '../../mockPortalData'
import type { AuthSession, PortalDashboard } from '../../portalTypes'
import { fetchDashboard } from '../../services/portalApi'
import { isUserRole } from '../../utils/portalSession'
import { DashboardBody } from '../../views/dashboard/DashboardBody'

export function PortalPage({ session }: { session: AuthSession | null }) {
  // Esta pagina e o shell do portal autenticado.
  // Ela valida perfil, carrega o dashboard correto e entrega o controle para a view do papel ativo.
  const { role } = useParams()
  const [dashboard, setDashboard] = useState<PortalDashboard | null>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!session || !isUserRole(role) || role !== session.user.role) {
      return
    }

    const currentSession = session
    let active = true

    async function loadDashboard() {
      // O dashboard sempre vem da role da sessao atual,
      // nao apenas do parametro da URL, para evitar acesso cruzado entre perfis.
      setStatus('loading')
      setError('')

      try {
        const nextDashboard = await fetchDashboard(
          currentSession.user.role,
          currentSession.token,
        )

        if (!active) {
          return
        }

        setDashboard(nextDashboard)
        setStatus('ready')
      } catch (loadError) {
        if (!active) {
          return
        }

        setStatus('error')
        setError(
          loadError instanceof Error
            ? loadError.message
            : 'Nao foi possivel carregar o dashboard.',
        )
      }
    }

    void loadDashboard()

    return () => {
      active = false
    }
  }, [role, session])

  if (!session) {
    return <Navigate to="/login" replace />
  }

  if (session.user.role === 'admin') {
    return <Navigate to={roleMeta.admin.route} replace />
  }

  if (!isUserRole(role)) {
    return <Navigate to={roleMeta[session.user.role].route} replace />
  }

  if (role !== session.user.role) {
    return <Navigate to={roleMeta[session.user.role].route} replace />
  }

  if (status === 'loading' || !dashboard) {
    return <LoadingState />
  }

  if (status === 'error') {
    return (
      <section className="feedback-card">
        <AlertTriangle size={22} />
        <div>
          <strong>Falha ao carregar o portal.</strong>
          <p>{error}</p>
        </div>
      </section>
    )
  }

  return (
    <div className="page-stack">
      <section className="portal-header">
        <div className="simple-card">
          <span className="section-badge">{session.user.roleLabel}</span>
          <h1 className="section-title">{dashboard.headline}</h1>
          <p className="section-text">{dashboard.summary}</p>
        </div>

        <div className="portal-meta">
          <InfoPill label="Usuario" value={session.user.name} />
          {session.user.role === 'doctor' ? (
            <InfoPill label="Territorio inicial" value={session.user.territory} />
          ) : null}
        </div>
      </section>

      <MetricSection items={dashboard.stats} />
      <DashboardBody
        dashboard={dashboard}
        token={session.token}
        userTerritory={session.user.territory}
      />
    </div>
  )
}
