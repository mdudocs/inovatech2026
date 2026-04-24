import { useState, type FormEvent } from 'react'
import { UserCog } from 'lucide-react'
import { MetricSection } from '../../components/portal/MetricSection'
import { Panel } from '../../components/portal/Panel'
import { roleMeta } from '../../mockPortalData'
import type { AdminUsersDashboard, CreateAdminUserPayload, UserRole } from '../../portalTypes'

export function AdminUsersSection({
  currentUserId,
  data,
  onCreateUser,
  onToggleUser,
  pendingUserId,
}: {
  currentUserId: string
  data: AdminUsersDashboard
  onCreateUser: (payload: CreateAdminUserPayload) => Promise<void>
  onToggleUser: (userId: string, nextActive: boolean) => Promise<void>
  pendingUserId: string | null
}) {
  const [form, setForm] = useState<CreateAdminUserPayload>({
    name: '',
    role: 'population',
    identifier: '',
    password: '',
    territory: '',
  })
  const [isCreating, setIsCreating] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsCreating(true)

    try {
      await onCreateUser(form)
      setForm({
        name: '',
        role: 'population',
        identifier: '',
        password: '',
        territory: '',
      })
    } finally {
      setIsCreating(false)
    }
  }

  function handleChange<K extends keyof CreateAdminUserPayload>(
    field: K,
    value: CreateAdminUserPayload[K],
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  return (
    <>
      <MetricSection items={data.stats} />

      <Panel title="Novo usuario" icon={<UserCog size={18} />}>
        <form className="admin-user-form" onSubmit={handleSubmit}>
          <label className="field">
            <span>Nome</span>
            <input
              onChange={(event) => handleChange('name', event.target.value)}
              placeholder="Digite o nome completo"
              required
              value={form.name}
            />
          </label>

          <label className="field">
            <span>Perfil</span>
            <select
              className="admin-select"
              onChange={(event) => handleChange('role', event.target.value as UserRole)}
              value={form.role}
            >
              {(Object.keys(roleMeta) as UserRole[]).map((role) => (
                <option key={role} value={role}>
                  {roleMeta[role].label}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Login</span>
            <input
              onChange={(event) => handleChange('identifier', event.target.value)}
              placeholder="CPF, matricula, CRM ou usuario"
              required
              value={form.identifier}
            />
          </label>

          <label className="field">
            <span>Senha</span>
            <input
              onChange={(event) => handleChange('password', event.target.value)}
              placeholder="Digite a senha inicial"
              required
              type="password"
              value={form.password}
            />
          </label>

          <label className="field admin-user-form-wide">
            <span>Territorio</span>
            <input
              onChange={(event) => handleChange('territory', event.target.value)}
              placeholder="Informe unidade, comunidade ou area"
              value={form.territory}
            />
          </label>

          <div className="admin-user-form-actions admin-user-form-wide">
            <button className="button button-primary" disabled={isCreating} type="submit">
              {isCreating ? 'Cadastrando...' : 'Cadastrar usuario'}
            </button>
          </div>
        </form>
      </Panel>

      <Panel title="Controle de usuarios" icon={<UserCog size={18} />}>
        <div className="case-table">
          {data.users.map((item) => {
            const isCurrentSession = item.id === currentUserId
            const isPending = pendingUserId === item.id
            const nextActive = !item.active

            return (
              <article className="admin-user-row" key={item.id}>
                <div>
                  <strong>{item.name}</strong>
                  <small>{item.identifier}</small>
                </div>
                <div>
                  <strong>{item.role}</strong>
                  <small>Perfil</small>
                </div>
                <div>
                  <strong>{item.territory}</strong>
                  <small>Territorio</small>
                </div>
                <div>
                  <strong>
                    <span
                      className={`admin-user-status ${
                        item.active ? 'admin-user-status-active' : 'admin-user-status-inactive'
                      }`}
                    >
                      {item.status}
                    </span>
                  </strong>
                  <small>Status</small>
                </div>
                <div className="admin-user-action">
                  <button
                    className={`button ${
                      item.active ? 'button-secondary' : 'button-primary'
                    }`}
                    disabled={isPending || (isCurrentSession && item.active)}
                    onClick={() => onToggleUser(item.id, nextActive)}
                    type="button"
                  >
                    {isPending
                      ? 'Salvando...'
                      : item.active
                        ? 'Desativar'
                        : 'Reativar'}
                  </button>
                  <small>{isCurrentSession ? 'Sessao atual' : 'Controle de acesso'}</small>
                </div>
              </article>
            )
          })}
        </div>
      </Panel>
    </>
  )
}
