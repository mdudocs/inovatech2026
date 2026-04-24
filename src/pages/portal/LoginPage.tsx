import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { roleIcons } from '../../components/portal/roleIcons'
import { roleMeta } from '../../mockPortalData'
import type { AuthSession, UserRole } from '../../portalTypes'
import { isUserRole } from '../../utils/portalSession'

export function LoginPage({
  session,
  onLogin,
}: {
  session: AuthSession | null
  onLogin: (role: UserRole, identifier: string, password: string) => Promise<AuthSession>
}) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const initialRoleParam = searchParams.get('role') ?? undefined
  const [selectedRole, setSelectedRole] = useState<UserRole>(
    isUserRole(initialRoleParam) ? initialRoleParam : 'population',
  )
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')

  if (session) {
    return <Navigate to={roleMeta[session.user.role].route} replace />
  }

  function selectRole(role: UserRole) {
    setSelectedRole(role)
    setError('')
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    setError('')

    try {
      const nextSession = await onLogin(selectedRole, identifier, password)
      navigate(roleMeta[nextSession.user.role].route, { replace: true })
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : 'Nao foi possivel entrar com esse perfil.',
      )
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="page-stack">
      <section className="login-layout">
        <div className="simple-card">
          <span className="section-badge">Entrar</span>
          <h1 className="section-title">{roleMeta[selectedRole].label}</h1>
          <p className="section-text">{roleMeta[selectedRole].description}</p>

          <div className="callout-card">
            <strong>Perfil selecionado</strong>
            <p>
              {selectedRole === 'population'
                ? 'Uso da familia e da comunidade para acompanhar comunicados e visitas.'
                : selectedRole === 'doctor'
                  ? 'Uso da equipe medica para triagem, retorno e decisao rapida.'
                  : selectedRole === 'admin'
                    ? 'Uso do administrador para acompanhar usuarios e dados do banco.'
                  : 'Uso do agente para sair com rota, checklist e coletas confirmadas.'}
            </p>
          </div>
        </div>

        <aside className="simple-card">
          <form className="login-form" onSubmit={handleSubmit}>
            <div className="role-switch" role="tablist" aria-label="Perfil de acesso">
              {(Object.keys(roleMeta) as UserRole[]).map((role) => {
                const Icon = roleIcons[role]
                const isActive = selectedRole === role

                return (
                  <button
                    aria-selected={isActive}
                    className={`role-option ${isActive ? 'role-option-active' : ''}`}
                    key={role}
                    onClick={() => selectRole(role)}
                    role="tab"
                    type="button"
                  >
                    <Icon size={18} />
                    <span>{roleMeta[role].shortLabel}</span>
                  </button>
                )
              })}
            </div>

            <label className="field">
              <span>{roleMeta[selectedRole].credentialLabel}</span>
              <input
                onChange={(event) => setIdentifier(event.target.value)}
                placeholder={`Digite ${roleMeta[selectedRole].credentialLabel.toLowerCase()}`}
                value={identifier}
              />
            </label>

            <label className="field">
              <span>Senha</span>
              <input
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Digite a senha"
                type="password"
                value={password}
              />
            </label>

            {error ? <p className="form-error">{error}</p> : null}

            <button className="button button-primary full-width" disabled={pending} type="submit">
              {pending ? 'Entrando...' : `Entrar como ${roleMeta[selectedRole].shortLabel}`}
            </button>
          </form>
        </aside>
      </section>
    </div>
  )
}
