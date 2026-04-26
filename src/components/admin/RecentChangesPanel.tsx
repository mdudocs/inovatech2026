// Painel reutilizavel para mostrar rastreabilidade e mudancas recentes da administracao.
import { DatabaseBackup } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Panel } from '../portal/Panel'
import type { DatabaseChangeItem } from '../../portalTypes'

function getChangeTone(action: DatabaseChangeItem['action']) {
  if (action === 'INSERT') {
    return 'admin-change-badge-insert'
  }

  if (action === 'DELETE') {
    return 'admin-change-badge-delete'
  }

  return 'admin-change-badge-update'
}

export function RecentChangesPanel({
  changes,
  title = 'Mudancas recentes no banco',
}: {
  changes: DatabaseChangeItem[]
  title?: string
}) {
  return (
    <Panel title={title} icon={<DatabaseBackup size={18} />}>
      <div className="stack-list">
        {changes.map((item) => {
          const content = (
            <>
              <div className="admin-change-head">
                <strong>{item.summary}</strong>
                <span className={`admin-change-badge ${getChangeTone(item.action)}`}>
                  {item.action}
                </span>
              </div>
              <p>{item.changedAt}</p>
              <div className="admin-change-meta">
                <small>Tabela {item.table}</small>
                <small>Registro {item.recordId}</small>
              </div>
            </>
          )

          if (item.href) {
            return (
              <Link className="admin-change-card" key={item.id} to={item.href}>
                {content}
              </Link>
            )
          }

          return (
            <article className="admin-change-card" key={item.id}>
              {content}
            </article>
          )
        })}
      </div>
    </Panel>
  )
}
