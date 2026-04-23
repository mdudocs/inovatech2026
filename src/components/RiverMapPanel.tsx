import { useState } from 'react'
import {
  mapLegend,
  riskLabel,
  routeStops,
  territoryMarkers,
  type RiskTone,
  type Stop,
  type TerritoryMarker,
} from '../siteData'

type MapTooltipPoint = Stop | TerritoryMarker

function getMapTooltipPosition(point: MapTooltipPoint) {
  const width = 244
  const height = 108
  let x = point.x + 22
  let y = point.y - height - 18
  let placement: 'above' | 'below' = 'above'

  if (x + width > 1176) {
    x = point.x - width - 22
  }

  if (y < 24) {
    y = point.y + 24
    placement = 'below'
  }

  return { x, y, width, height, placement }
}

function getRiskAriaLabel(name: string, risk: RiskTone) {
  return `${name}: ${riskLabel[risk]}`
}

export function RiverMapPanel() {
  const [activeMapPoint, setActiveMapPoint] = useState<MapTooltipPoint | null>(
    null,
  )

  const activeTooltipPosition = activeMapPoint
    ? getMapTooltipPosition(activeMapPoint)
    : null

  return (
    <article className="corridor-card">
      <div className="corridor-head">
        <div>
          <span className="minor-tag">Eixo monitorado</span>
          <h3>Manaus, Novo Airao, Barcelos, Santa Isabel e Sao Gabriel</h3>
        </div>
        <p>700 km de monitoramento prioritario</p>
      </div>

      <div className="corridor-map-shell">
        <svg
          className="river-map"
          viewBox="0 0 1200 460"
          role="img"
          aria-label="Mapa ilustrado do monitoramento no Rio Negro com pontos prioritarios"
        >
          <defs>
            <filter id="riverGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="10" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <rect className="map-bg" x="0" y="0" width="1200" height="460" rx="24" />

          <path className="tributary-path" d="M 404 238 C 396 286, 384 332, 370 382" />
          <path className="tributary-path" d="M 698 170 C 690 122, 684 88, 672 42" />
          <path className="tributary-path" d="M 904 178 C 918 128, 922 86, 916 30" />

          <path
            className="river-path river-path-glow"
            filter="url(#riverGlow)"
            d="M 78 220
              C 138 204, 182 210, 236 232
              C 290 254, 342 260, 405 242
              C 470 223, 538 188, 626 178
              C 714 168, 780 196, 856 186
              C 932 176, 1016 142, 1110 156
              C 1134 160, 1148 158, 1162 150"
          />
          <path
            className="river-path river-path-main"
            d="M 78 220
              C 138 204, 182 210, 236 232
              C 290 254, 342 260, 405 242
              C 470 223, 538 188, 626 178
              C 714 168, 780 196, 856 186
              C 932 176, 1016 142, 1110 156
              C 1134 160, 1148 158, 1162 150"
          />
          <path
            className="river-path river-path-highlight"
            d="M 78 220
              C 138 204, 182 210, 236 232
              C 290 254, 342 260, 405 242
              C 470 223, 538 188, 626 178
              C 714 168, 780 196, 856 186
              C 932 176, 1016 142, 1110 156
              C 1134 160, 1148 158, 1162 150"
          />

          {routeStops.map((stop) => (
            <g
              key={stop.name}
              className={`map-stop map-stop-${stop.risk} map-stop-trigger${
                activeMapPoint?.name === stop.name ? ' map-stop-active' : ''
              }`}
              onMouseEnter={() => setActiveMapPoint(stop)}
              onMouseLeave={() => setActiveMapPoint(null)}
              onFocus={() => setActiveMapPoint(stop)}
              onBlur={() => setActiveMapPoint(null)}
              tabIndex={0}
              role="button"
              aria-label={getRiskAriaLabel(stop.name, stop.risk)}
            >
              <circle className="stop-halo" cx={stop.x} cy={stop.y} r="26" />
              <circle className="stop-pulse" cx={stop.x} cy={stop.y} r="16" />
              <circle className="stop-ring" cx={stop.x} cy={stop.y} r="16" />
              <circle className="stop-core" cx={stop.x} cy={stop.y} r="8" />
              <text
                className="stop-name"
                x={stop.labelX}
                y={stop.labelY}
                textAnchor={stop.labelAnchor ?? 'middle'}
              >
                {stop.name}
              </text>
            </g>
          ))}

          {territoryMarkers.map((marker) => (
            <g
              key={marker.name}
              className={`map-stop map-stop-${marker.risk} map-stop-trigger${
                activeMapPoint?.name === marker.name ? ' map-stop-active' : ''
              }`}
              onMouseEnter={() => setActiveMapPoint(marker)}
              onMouseLeave={() => setActiveMapPoint(null)}
              onFocus={() => setActiveMapPoint(marker)}
              onBlur={() => setActiveMapPoint(null)}
              tabIndex={0}
              role="button"
              aria-label={getRiskAriaLabel(marker.name, marker.risk)}
            >
              <circle className="marker-pulse" cx={marker.x} cy={marker.y} r="12" />
              <circle className="marker-ring" cx={marker.x} cy={marker.y} r="12" />
              <circle className="marker-core" cx={marker.x} cy={marker.y} r="5" />
              <text
                className="marker-name"
                x={marker.labelX}
                y={marker.labelY}
                textAnchor={marker.labelAnchor ?? 'middle'}
              >
                {marker.name}
              </text>
            </g>
          ))}

          {activeMapPoint && activeTooltipPosition ? (
            <foreignObject
              x={activeTooltipPosition.x}
              y={activeTooltipPosition.y}
              width={activeTooltipPosition.width}
              height={activeTooltipPosition.height}
              className="map-tooltip-shell"
              aria-hidden="true"
            >
              <div
                className={`map-tooltip ${
                  activeTooltipPosition.placement === 'below'
                    ? 'map-tooltip-below'
                    : 'map-tooltip-above'
                }`}
              >
                <span className={`map-tooltip-level map-tooltip-${activeMapPoint.risk}`}>
                  Situacao {riskLabel[activeMapPoint.risk]}
                </span>
                <strong>{activeMapPoint.name}</strong>
                <p>{activeMapPoint.detail}</p>
              </div>
            </foreignObject>
          ) : null}

          <g className="map-legend" aria-hidden="true">
            <rect className="map-legend-box" x="882" y="318" width="238" height="92" rx="18" />
            <text className="map-legend-title" x="902" y="343">
              Legenda de risco
            </text>
            {mapLegend.map((item, index) => {
              const column = index % 2
              const row = Math.floor(index / 2)
              const x = 904 + column * 112
              const y = 366 + row * 24

              return (
                <g key={item.key} className="map-legend-item">
                  <circle
                    className={`map-legend-dot map-legend-dot-${item.key}`}
                    cx={x}
                    cy={y - 4}
                    r="5"
                  />
                  <text className="map-legend-label" x={x + 14} y={y}>
                    {item.label}
                  </text>
                </g>
              )
            })}
          </g>

          <g className="map-scale" aria-hidden="true">
            <line x1="76" y1="408" x2="316" y2="408" />
            <line x1="76" y1="400" x2="76" y2="416" />
            <line x1="316" y1="400" x2="316" y2="416" />
            <text x="196" y="432" textAnchor="middle">
              ~ 200 km
            </text>
          </g>

          <g className="map-north" aria-hidden="true">
            <text x="1132" y="420">N</text>
          </g>
        </svg>
      </div>
    </article>
  )
}
