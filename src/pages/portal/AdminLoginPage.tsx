// Entrada administrativa separada do login comum, com fluxo proprio de acesso.
import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { roleMeta } from '../../mockPortalData'
import type { AuthSession } from '../../portalTypes'

export function AdminLoginPage({
  session,
  onLogin,
}: {
  session: AuthSession | null
  onLogin: (identifier: string, password: string, accessKey: string) => Promise<AuthSession>
}) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const accessKey = searchParams.get('k')?.trim() || ''
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')

  if (session) {
    return <Navigate to={roleMeta[session.user.role].route} replace />
  }

  if (!accessKey) {
    return <Navigate to="/" replace />
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    setError('')

    try {
      const nextSession = await onLogin(identifier, password, accessKey)
      navigate(roleMeta[nextSession.user.role].route, { replace: true })
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : 'Nao foi possivel entrar.',
      )
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="page-stack">
      <section className="login-layout">
        <div className="simple-card">
          <span className="section-badge">Acesso</span>
          <h1 className="section-title">Area interna</h1>
          <p className="section-text">
            Informe suas credenciais para continuar.
          </p>
        </div>

        <aside className="simple-card">
          <form className="login-form" onSubmit={handleSubmit}>
            <label className="field">
              <span>Usuario</span>
              <input
                onChange={(event) => setIdentifier(event.target.value)}
                placeholder="Digite o usuario"
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
              {pending ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </aside>
      </section>
    </div>
  )
}
