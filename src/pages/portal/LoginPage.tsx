import { useState, type FormEvent } from 'react'
import { CheckCircle2, LifeBuoy, Send, X } from 'lucide-react'
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { AquaSafeLogo } from '../../components/AquaSafeLogo'
import { roleIcons } from '../../components/portal/roleIcons'
import { roleMeta } from '../../mockPortalData'
import type { AuthSession, UserRole } from '../../portalTypes'
import { submitSupportContact } from '../../services/portalApi'
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
  const visibleRoles = (Object.keys(roleMeta) as UserRole[]).filter((role) => role !== 'admin')
  const initialRoleParam = searchParams.get('role') ?? undefined
  const [selectedRole, setSelectedRole] = useState<UserRole>(
    isUserRole(initialRoleParam) ? initialRoleParam : 'population',
  )
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const [supportOpen, setSupportOpen] = useState(false)
  const [supportName, setSupportName] = useState('')
  const [supportContact, setSupportContact] = useState('')
  const [supportMessage, setSupportMessage] = useState('')
  const [supportPending, setSupportPending] = useState(false)
  const [supportStatus, setSupportStatus] = useState('')
  const [supportError, setSupportError] = useState('')

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

  async function handleSupportSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSupportPending(true)
    setSupportError('')
    setSupportStatus('')

    try {
      const result = await submitSupportContact({
        role: selectedRole,
        name: supportName,
        contact: supportContact,
        message: supportMessage,
      })

      setSupportStatus(
        `Atendimento aberto com protocolo ${result.protocol}. Status: ${result.status}.`,
      )
      setSupportName('')
      setSupportContact('')
      setSupportMessage('')
    } catch (submissionError) {
      setSupportError(
        submissionError instanceof Error
          ? submissionError.message
          : 'Nao foi possivel abrir o atendimento agora.',
      )
    } finally {
      setSupportPending(false)
    }
  }

  return (
    <div className="page-stack">
      <section className="login-layout">
        <div className="simple-card">
          <div className="login-brand">
            <AquaSafeLogo size="lg" />
            <h2 className="login-title">AquaSafe</h2>
            <p className="login-subtitle">Sistema de monitoramento ambiental e saude territorial</p>
          </div>
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

        <aside className="simple-card login-form-card">
          <form className="login-form" onSubmit={handleSubmit}>
            <div className="role-switch" role="tablist" aria-label="Perfil de acesso">
              {visibleRoles.map((role) => {
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

          <div className="login-footer">
            <p>
              Precisa de ajuda?{' '}
              <button
                className="login-contact-link"
                onClick={() => {
                  setSupportOpen((current) => !current)
                  setSupportError('')
                }}
                type="button"
              >
                Entre em contato
              </button>
            </p>
          </div>

          {supportOpen ? (
            <form className="login-support-panel" onSubmit={handleSupportSubmit}>
              <div className="login-support-head">
                <span>
                  <LifeBuoy size={16} />
                  Suporte AquaSafe
                </span>
                <button
                  aria-label="Fechar atendimento"
                  className="login-support-close"
                  onClick={() => setSupportOpen(false)}
                  type="button"
                >
                  <X size={16} />
                </button>
              </div>

              <label className="field">
                <span>Nome</span>
                <input
                  onChange={(event) => setSupportName(event.target.value)}
                  placeholder="Digite seu nome"
                  value={supportName}
                />
              </label>

              <label className="field">
                <span>Contato para retorno</span>
                <input
                  onChange={(event) => setSupportContact(event.target.value)}
                  placeholder="Celular, e-mail ou unidade"
                  value={supportContact}
                />
              </label>

              <label className="field">
                <span>Como podemos ajudar?</span>
                <textarea
                  onChange={(event) => setSupportMessage(event.target.value)}
                  placeholder={`Ex.: nao consigo entrar como ${roleMeta[selectedRole].shortLabel}, preciso recuperar acesso ou cadastrar usuario.`}
                  rows={4}
                  value={supportMessage}
                />
              </label>

              {supportError ? <p className="form-error">{supportError}</p> : null}
              {supportStatus ? (
                <p className="form-success">
                  <CheckCircle2 size={16} />
                  {supportStatus}
                </p>
              ) : null}

              <button className="button button-secondary full-width" disabled={supportPending} type="submit">
                <Send size={16} />
                {supportPending ? 'Abrindo atendimento...' : 'Abrir atendimento'}
              </button>
            </form>
          ) : null}
        </aside>
      </section>
    </div>
  )
}

