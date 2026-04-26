import { lazy, Suspense } from 'react'

type LazyRiverMapPanelProps = {
  mode?: 'community' | 'technical'
  token?: string
  focusCommunity?: string
}

const RiverMapPanelImpl = lazy(() =>
  import('./RiverMapPanel').then((module) => ({
    default: module.RiverMapPanel,
  })),
)

export function LazyRiverMapPanel(props: LazyRiverMapPanelProps) {
  return (
    <Suspense
      fallback={
        <article className="corridor-card map-loading-card">
          <span className="minor-tag">Mapa</span>
          <h3>Carregando mapa interativo...</h3>
        </article>
      }
    >
      <RiverMapPanelImpl {...props} />
    </Suspense>
  )
}
