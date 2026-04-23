import { useState } from 'react'
import { communityRows, priorityCommunities, riskLabel } from '../siteData'

type CommunityFilter = 'all' | 'critical' | 'high' | 'other'

export function CommunitiesPage() {
  const [filter, setFilter] = useState<CommunityFilter>('all')

  const filteredRows = communityRows.filter((row) => {
    if (filter === 'all') {
      return true
    }

    if (filter === 'other') {
      return row.riskTone === 'medium' || row.riskTone === 'low' || row.riskTone === 'elevated'
    }

    return row.riskTone === filter
  })

  const highlights = priorityCommunities.slice(0, 4)

  return (
    <>
      <section className="page-hero">
        <div className="page-hero-copy">
          <span className="section-kicker">Comunidades monitoradas</span>
          <h1 className="page-title">
            Onde o risco precisa ser lido com mais detalhe.
          </h1>
          <p className="page-summary">
            Aqui fica a consolidacao do mapa e da tabela do projeto original,
            organizada para consulta por comunidade.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="section-intro">
          <span className="section-kicker">Prioridades</span>
          <h2>Quadro rapido das comunidades que exigem maior acompanhamento.</h2>
        </div>

        <div className="community-highlight-grid">
          {highlights.map((community) => (
            <article key={community.name} className="community-highlight-card">
              <div className="community-highlight-head">
                <strong>{community.name}</strong>
                <span className={`risk-pill risk-${community.risk}`}>
                  {riskLabel[community.risk]}
                </span>
              </div>
              <p>{community.focus}</p>
              <small>{community.population}</small>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-intro">
          <span className="section-kicker">Tabela consolidada</span>
          <h2>Base comunitaria trazida do Inovatech original.</h2>
          <p>
            Filtros simples ajudam a isolar rapidamente os territorios em
            situacao critica, alta ou mais estavel.
          </p>
        </div>

        <div className="community-filter-row">
          <button
            type="button"
            className={`community-filter ${filter === 'all' ? 'is-active' : ''}`}
            onClick={() => setFilter('all')}
          >
            Todas
          </button>
          <button
            type="button"
            className={`community-filter ${filter === 'critical' ? 'is-active' : ''}`}
            onClick={() => setFilter('critical')}
          >
            Muito alto
          </button>
          <button
            type="button"
            className={`community-filter ${filter === 'high' ? 'is-active' : ''}`}
            onClick={() => setFilter('high')}
          >
            Alto
          </button>
          <button
            type="button"
            className={`community-filter ${filter === 'other' ? 'is-active' : ''}`}
            onClick={() => setFilter('other')}
          >
            Moderado e baixo
          </button>
        </div>

        <div className="community-table-shell">
          <table className="community-table">
            <thead>
              <tr>
                <th>Comunidade</th>
                <th>Trecho</th>
                <th>Populacao</th>
                <th>Risco</th>
                <th>Especies / consumo</th>
                <th>Referencias</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row) => (
                <tr key={row.name}>
                  <td>
                    <strong>{row.name}</strong>
                  </td>
                  <td>
                    <span className="table-mono">{row.area}</span>
                  </td>
                  <td>
                    <span className="table-pop">{row.population}</span>
                    {row.note ? <small>{row.note}</small> : null}
                  </td>
                  <td>
                    <span className={`community-risk-badge risk-pill-${row.riskTone}`}>
                      {row.riskLabel}
                    </span>
                  </td>
                  <td>{row.species}</td>
                  <td>
                    <span className="table-mono">{row.refs}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  )
}
