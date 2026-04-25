import { useEffect, useMemo, useState } from 'react'
import { CircleMarker, MapContainer, Pane, TileLayer, Tooltip } from 'react-leaflet'
import { ExternalLink, LocateFixed, MapPinned } from 'lucide-react'
import 'leaflet/dist/leaflet.css'
import {
  riskLabel,
  routeStops,
  territoryMarkers,
  type RiskTone,
} from '../siteData'
import {
  collectionCommunityOptions,
  mergeLiveCollections,
  readLiveCollections,
  type LiveCollectionRecord,
} from '../utils/liveCollections'
import { fetchLiveCollections } from '../services/portalApi'

type MapDetailMode = 'community' | 'technical'
type MapRiskTone = 'low' | RiskTone

type RiverMapPanelProps = {
  mode?: MapDetailMode
  token?: string
}

type BaseMapPoint = {
  id: string
  name: string
  detail: string
  area: string
  population: string
  mercurySignal: string
  exposure: string
  guidance: string
  refs: string
  lat: number
  lng: number
  risk: RiskTone
}

type CommunityMapPoint = BaseMapPoint & {
  currentRisk: MapRiskTone
  collectionCount: number
  criticalCount: number
  highCount: number
  mediumCount: number
  latestCollectionAt: string | null
  latestStatus: string | null
  latestSampleType: string | null
  latestNote: string | null
  photoCount: number
  focusReason: string
}

const pointCoordinates = new Map(
  collectionCommunityOptions.map((item) => [item.name, item]),
)

const mapBounds: [[number, number], [number, number]] = [
  [-13.6, -74.5],
  [5.8, -44.8],
]

function getBaseMapPoints(): BaseMapPoint[] {
  return [...routeStops, ...territoryMarkers]
    .flatMap((point) => {
      const coordinates = pointCoordinates.get(point.name)

      if (!coordinates) {
        return []
      }

      return [{
        id: `monitoring-${point.name}`,
        name: point.name,
        detail: point.detail,
        area: point.area,
        population: point.population,
        mercurySignal: point.mercurySignal,
        exposure: point.exposure,
        guidance: point.guidance,
        refs: point.refs,
        lat: coordinates.lat,
        lng: coordinates.lng,
        risk: point.risk,
      }]
    })
}

const baseMapPoints = getBaseMapPoints()

function getRiskSeverity(risk: MapRiskTone) {
  if (risk === 'critical') {
    return 3
  }

  if (risk === 'high') {
    return 2
  }

  if (risk === 'medium') {
    return 1
  }

  return 0
}

function maxRiskTone(first: MapRiskTone, second: MapRiskTone): MapRiskTone {
  return getRiskSeverity(first) >= getRiskSeverity(second) ? first : second
}

function getMapRiskLabel(risk: MapRiskTone) {
  if (risk === 'low') {
    return 'Baixo'
  }

  return riskLabel[risk]
}

function getRiskStrokeColor(risk: MapRiskTone) {
  if (risk === 'critical') {
    return '#d94b43'
  }

  if (risk === 'high') {
    return '#c68a18'
  }

  if (risk === 'medium') {
    return '#218b93'
  }

  return '#4d7f84'
}

function getRiskFillColor(risk: MapRiskTone) {
  if (risk === 'critical') {
    return '#ff7d72'
  }

  if (risk === 'high') {
    return '#f5bf43'
  }

  if (risk === 'medium') {
    return '#45c2b1'
  }

  return '#8db8b3'
}

function getMarkerRadius(point: CommunityMapPoint) {
  return Math.min(18, 9 + point.collectionCount * 1.35)
}

function getPointRecords(records: LiveCollectionRecord[], pointName: string) {
  return records.filter((record) => record.community === pointName)
}

function getDerivedRisk(records: LiveCollectionRecord[]): MapRiskTone {
  if (records.length === 0) {
    return 'low'
  }

  let score = 0
  let criticalCount = 0
  let highCount = 0
  let mediumCount = 0

  for (const record of records) {
    if (record.risk === 'critical') {
      criticalCount += 1
      score += 3
      continue
    }

    if (record.risk === 'high') {
      highCount += 1
      score += 2
      continue
    }

    mediumCount += 1
    score += 1
  }

  if (records.length >= 5 || criticalCount >= 2 || score >= 9) {
    return 'critical'
  }

  if (records.length >= 3 || criticalCount >= 1 || highCount >= 2 || score >= 5) {
    return 'high'
  }

  if (records.length >= 1 || mediumCount >= 1) {
    return 'medium'
  }

  return 'low'
}

function getFocusReason(risk: MapRiskTone, records: LiveCollectionRecord[]) {
  if (records.length === 0) {
    return 'Sem coletas recentes publicadas; o ponto segue com a referencia historica do territorio.'
  }

  if (risk === 'critical') {
    return `Foco muito alto: ${records.length} coleta(s) recentes empurraram a comunidade para prioridade maxima.`
  }

  if (risk === 'high') {
    return `Foco alto: o acumulado recente ja elevou a pressao operacional desta comunidade.`
  }

  if (risk === 'medium') {
    return `Foco moderado: ha ${records.length} coleta(s) recente(s) em observacao nesta comunidade.`
  }

  return 'Sem acumulado recente que eleve o foco operacional desta comunidade.'
}

function buildCommunityPoint(
  point: BaseMapPoint,
  liveCollections: LiveCollectionRecord[],
): CommunityMapPoint {
  const pointRecords = getPointRecords(liveCollections, point.name)
  const latestRecord = pointRecords[0] ?? null
  const criticalCount = pointRecords.filter((record) => record.risk === 'critical').length
  const highCount = pointRecords.filter((record) => record.risk === 'high').length
  const mediumCount = pointRecords.filter((record) => record.risk === 'medium').length
  const derivedRisk = getDerivedRisk(pointRecords)
  const currentRisk = maxRiskTone(point.risk, derivedRisk)

  return {
    ...point,
    currentRisk,
    collectionCount: pointRecords.length,
    criticalCount,
    highCount,
    mediumCount,
    latestCollectionAt: latestRecord?.collectedAt ?? null,
    latestStatus: latestRecord?.status ?? null,
    latestSampleType: latestRecord?.sampleType ?? null,
    latestNote: latestRecord?.note ?? null,
    photoCount: pointRecords.reduce(
      (total, record) => total + (record.photos?.length ?? 0),
      0,
    ),
    focusReason: getFocusReason(currentRisk, pointRecords),
  }
}

function getInitialSelectedPoint(liveCollections: LiveCollectionRecord[]) {
  const points = baseMapPoints.map((point) => buildCommunityPoint(point, liveCollections))
  return (
    points
      .slice()
      .sort((first, second) => {
        const riskDifference =
          getRiskSeverity(second.currentRisk) - getRiskSeverity(first.currentRisk)

        if (riskDifference !== 0) {
          return riskDifference
        }

        return second.collectionCount - first.collectionCount
      })[0] ?? points[0]
  )
}

function formatCollectionSummary(point: CommunityMapPoint) {
  if (point.collectionCount === 0) {
    return 'Sem coletas recentes'
  }

  return `${point.collectionCount} coleta(s) recente(s)`
}

function getLatestSampleSummary(point: CommunityMapPoint) {
  if (!point.latestSampleType && !point.latestStatus) {
    return 'Sem nova coleta publicada'
  }

  return `${point.latestSampleType ?? 'Coleta recente'} | ${point.latestStatus ?? 'Status pendente'}`
}

function getPhotoSummary(point: CommunityMapPoint) {
  if (point.photoCount === 0) {
    return 'Sem fotos enviadas'
  }

  return `${point.photoCount} foto(s) de campo vinculada(s)`
}

export function RiverMapPanel({ mode = 'technical', token }: RiverMapPanelProps) {
  const [selectedPointId, setSelectedPointId] = useState(() =>
    getInitialSelectedPoint(readLiveCollections())?.id ?? baseMapPoints[0]?.id ?? '',
  )
  const [liveCollections, setLiveCollections] = useState<LiveCollectionRecord[]>(
    () => readLiveCollections(),
  )
  const [lastRefresh, setLastRefresh] = useState(() =>
    new Date().toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }),
  )

  const isCommunityMode = mode === 'community'

  const communityPoints = useMemo(
    () => baseMapPoints.map((point) => buildCommunityPoint(point, liveCollections)),
    [liveCollections],
  )

  const selectedMapPoint =
    communityPoints.find((point) => point.id === selectedPointId) ?? communityPoints[0]

  const highlightedCount = communityPoints.filter(
    (point) => point.currentRisk === 'high' || point.currentRisk === 'critical',
  ).length

  useEffect(() => {
    let isMounted = true

    async function refreshLiveCollections() {
      const localRecords = readLiveCollections()

      if (isMounted) {
        setLiveCollections(localRecords)
      }

      if (token) {
        try {
          const apiRecords = await fetchLiveCollections(token)

          if (isMounted) {
            setLiveCollections(mergeLiveCollections(apiRecords, localRecords))
          }
        } catch {
          if (isMounted) {
            setLiveCollections(localRecords)
          }
        }
      }

      if (!isMounted) {
        return
      }

      setLastRefresh(
        new Date().toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }),
      )
    }

    const handleRefresh = () => {
      void refreshLiveCollections()
    }

    handleRefresh()
    const intervalId = window.setInterval(handleRefresh, 5000)
    window.addEventListener('storage', handleRefresh)
    window.addEventListener('aquasafe-live-collections-updated', handleRefresh)

    return () => {
      isMounted = false
      window.clearInterval(intervalId)
      window.removeEventListener('storage', handleRefresh)
      window.removeEventListener(
        'aquasafe-live-collections-updated',
        handleRefresh,
      )
    }
  }, [token])

  if (!selectedMapPoint) {
    return null
  }

  return (
    <article
      className={`corridor-card ${
        isCommunityMode ? 'corridor-card-compact' : 'corridor-card-technical'
      }`}
    >
      <div className="corridor-head">
        <div>
          <span className="minor-tag">
            {isCommunityMode ? 'Mapa interativo da comunidade' : 'Mapa em tempo real'}
          </span>
          <h3>
            {isCommunityMode
              ? 'Mapa real com pontos de monitoramento por comunidade'
              : 'Mapa navegavel com foco atualizado pelas coletas de campo'}
          </h3>
        </div>
        <p>
          {isCommunityMode
            ? 'Arraste, aproxime e toque nos pontos para ver a situacao atual da comunidade.'
            : 'O foco muda conforme as coletas chegam: mais registros altos e muito altos elevam a prioridade do ponto.'}
        </p>
      </div>

      <div className="real-map-shell real-map-shell-interactive">
        <MapContainer
          bounds={mapBounds}
          boundsOptions={{ padding: [24, 24] }}
          className="real-map real-map-interactive"
          maxBounds={mapBounds}
          maxBoundsViscosity={0.9}
          minZoom={4}
          scrollWheelZoom
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          <Pane name="community-points" style={{ zIndex: 450 }}>
            {communityPoints.map((point) => {
              const isSelected = point.id === selectedMapPoint.id

              return (
                <CircleMarker
                  center={[point.lat, point.lng]}
                  eventHandlers={{
                    click: () => setSelectedPointId(point.id),
                  }}
                  fillColor={getRiskFillColor(point.currentRisk)}
                  fillOpacity={0.92}
                  key={point.id}
                  pathOptions={{
                    color: getRiskStrokeColor(point.currentRisk),
                    weight: isSelected ? 5 : 3,
                  }}
                  radius={getMarkerRadius(point)}
                >
                  <Tooltip
                    direction="top"
                    offset={[0, -10]}
                    opacity={1}
                  >
                    <div className={`real-map-tooltip-body real-map-tooltip-body-${point.currentRisk}`}>
                      <span>{getMapRiskLabel(point.currentRisk)}</span>
                      <strong>{point.name}</strong>
                      <small>{point.area}</small>
                      <p>{point.detail}</p>
                      <p>{point.focusReason}</p>
                      <small>{formatCollectionSummary(point)}</small>
                      <small>{getLatestSampleSummary(point)}</small>
                      <small>{getPhotoSummary(point)}</small>
                    </div>
                  </Tooltip>
                </CircleMarker>
              )
            })}
          </Pane>
        </MapContainer>
      </div>

      <div className="real-map-bottom-bar">
        <div className="real-map-meta">
          <span className="real-map-meta-chip">
            <MapPinned size={14} />
            {communityPoints.length} pontos acompanhados
          </span>
          <span className="real-map-meta-chip">
            <LocateFixed size={14} />
            {highlightedCount} em foco alto ou muito alto
          </span>
        </div>

        <div className="real-map-legend" aria-hidden="true">
          <span>
            <i className="legend-dot legend-dot-low" />
            Baixo
          </span>
          <span>
            <i className="legend-dot legend-dot-medium" />
            Moderado
          </span>
          <span>
            <i className="legend-dot legend-dot-high" />
            Alto
          </span>
          <span>
            <i className="legend-dot legend-dot-critical" />
            Muito alto
          </span>
        </div>
      </div>

      <div className="live-map-status" aria-live="polite">
        <span>
          <strong>{liveCollections.length}</strong> coletas recentes sincronizadas
        </span>
        <span>Atualizado as {lastRefresh}</span>
      </div>

      <aside
        className={`community-map-panel community-map-panel-${selectedMapPoint.currentRisk} ${
          isCommunityMode ? 'community-map-panel-compact' : ''
        }`}
        aria-live="polite"
      >
        <div className="community-map-panel-head">
          <div>
            <span className="minor-tag">
              {isCommunityMode ? 'Resumo do ponto' : 'Ponto selecionado no mapa'}
            </span>
            <h4>{selectedMapPoint.name}</h4>
          </div>
          <span className={`risk-pill risk-${selectedMapPoint.currentRisk === 'low' ? 'medium' : selectedMapPoint.currentRisk}`}>
            {getMapRiskLabel(selectedMapPoint.currentRisk)}
          </span>
        </div>

        <div className="community-map-panel-grid">
          <div>
            <small>Trecho</small>
            <strong>{selectedMapPoint.area}</strong>
          </div>
          <div>
            <small>Populacao acompanhada</small>
            <strong>{selectedMapPoint.population}</strong>
          </div>
          <div>
            <small>Coletas recentes</small>
            <strong>{formatCollectionSummary(selectedMapPoint)}</strong>
          </div>
          <div>
            <small>Ultima atualizacao do ponto</small>
            <strong>{selectedMapPoint.latestCollectionAt ?? 'Sem nova coleta publicada'}</strong>
          </div>
          <div>
            <small>Fotos de campo</small>
            <strong>{getPhotoSummary(selectedMapPoint)}</strong>
          </div>
          <div>
            <small>Ultima nota</small>
            <strong>{selectedMapPoint.latestNote || 'Sem observacao recente'}</strong>
          </div>
        </div>

        <div className="community-map-side-grid">
          <article className="community-map-side-card">
            <small>Leitura do foco</small>
            <strong>{selectedMapPoint.focusReason}</strong>
          </article>
          <article className="community-map-side-card">
            <small>Distribuicao recente</small>
            <strong>
              {selectedMapPoint.criticalCount} muito altas, {selectedMapPoint.highCount} altas e{' '}
              {selectedMapPoint.mediumCount} moderadas
            </strong>
          </article>
        </div>

        {isCommunityMode ? (
          <div className="community-map-action">
            <ExternalLink size={18} />
            <div>
              <span>Orientacao principal</span>
              <p>{selectedMapPoint.guidance}</p>
            </div>
          </div>
        ) : (
          <>
            <div className="community-map-panel-grid">
              <div>
                <small>Sinal territorial</small>
                <strong>{selectedMapPoint.mercurySignal}</strong>
              </div>
              <div>
                <small>Exposicao provavel</small>
                <strong>{selectedMapPoint.exposure}</strong>
              </div>
            </div>

            <div className="community-map-action">
              <ExternalLink size={18} />
              <div>
                <span>Ultimo status operacional</span>
                <p>
                  {selectedMapPoint.latestSampleType ?? 'Aguardando nova coleta'} |{' '}
                  {selectedMapPoint.latestStatus ?? 'Sem status recente'}
                </p>
                <small>Referencias: {selectedMapPoint.refs}</small>
              </div>
            </div>
          </>
        )}
      </aside>
    </article>
  )
}
