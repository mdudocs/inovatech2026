import type { ReactNode } from 'react'

export function Panel({
  title,
  icon,
  children,
}: {
  title: string
  icon: ReactNode
  children: ReactNode
}) {
  return (
    <article className="simple-card panel-card">
      <div className="card-head">
        <span className="feature-icon">{icon}</span>
        <div>
          <strong>{title}</strong>
        </div>
      </div>
      {children}
    </article>
  )
}
