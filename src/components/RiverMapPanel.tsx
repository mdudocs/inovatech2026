import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import maplibregl, { type LngLatBoundsLike } from 'maplibre-gl'
import {
  Map as MapLibreMap,
  Marker,
  NavigationControl,
  Popup,
  type MapRef,
} from '@vis.gl/react-maplibre'
import { ExternalLink, LocateFixed, MapPinned } from 'lucide-react'
import 'maplibre-gl/dist/maplibre-gl.css'
import {
  riskLabel,
  routeStops,
  territoryMarkers,
  type RiskTone,
} from '../siteData'
import {
  collectionCommunityOptions,
  getCollectionSequenceLabel,
  mergeLiveCollections,
  readLiveCollections,
  type LiveCollectionRecord,
} from '../utils/liveCollections'
import { fetchLiveCollectionDetail, fetchLiveCollections } from '../services/portalApi'
import { resolveInitialTheme, type ThemeMode } from '../theme'

type MapDetailMode = 'community' | 'technical'
type MapRiskTone = 'low' | RiskTone

type RiverMapPanelProps = {
  mode?: MapDetailMode
  token?: string
  focusCommunity?: string
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
  latestCollectionNumber: number | null
  latestCollectionId: string | null
  latestCollectionAt: string | null
  latestStatus: string | null
  latestSampleType: string | null
  latestNote: string | null
  latestProtocolTitle: string | null
  latestArticleRefs: string[]
  latestFieldSummary: string | null
  photoCount: number
  focusReason: string
}

const pointCoordinates = new Map(
  collectionCommunityOptions.map((item) => [item.name, item]),
)

const mapBounds: LngLatBoundsLike = [
  [-71.5, -9.3],
  [-56.5, 2.8],
]

const mapStyles = {
  light: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
  dark: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
} as const

function getBaseMapPoints(): BaseMapPoint[] {
  // Esta é a camada territorial base; o risco dinâmico entra depois pelas coletas.
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
  return Math.min(22, 16 + point.collectionCount * 1.8)
}

function getPointRecords(records: LiveCollectionRecord[], pointName: string) {
  return records.filter((record) => record.community === pointName)
}

function getDerivedRisk(records: LiveCollectionRecord[]): MapRiskTone {
  // Heurística visual do frontend para traduzir volume e gravidade de coletas
  // em prioridade operacional no mapa.
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
    return 'Foco alto: o acumulado recente ja elevou a pressao operacional desta comunidade.'
  }

  if (risk === 'medium') {
    return `Foco moderado: ha ${records.length} coleta(s) recente(s) em observacao nesta comunidade.`
  }

  return 'Sem acumulado recente que eleve o foco operacional desta comunidade.'
}

function getReportLine(note: string | null, label: string) {
  // As notas são persistidas em texto consolidado; aqui extraímos trechos úteis
  // sem exigir parsing mais complexo no backend.
  if (!note) {
    return ''
  }

  const normalizedLabel = `${label.toLowerCase()}:`
  const line = note
    .split('\n')
    .find((item) => item.trim().toLowerCase().startsWith(normalizedLabel))

  return line?.split(':').slice(1).join(':').trim() ?? ''
}

function getReadableFieldSummary(note: string | null) {
  const candidates = [
    getReportLine(note, 'Observacao complementar'),
    getReportLine(note, 'Condicao do local'),
    getReportLine(note, 'Pessoas e exposicao'),
    getReportLine(note, 'Encaminhamento imediato'),
  ].filter((item) => item && !['Sem registro', 'Sem observacao complementar'].includes(item))

  const summary = candidates[0]

  if (!summary) {
    return note ? 'Relatorio completo registrado na coleta.' : null
  }

  return summary.length > 150 ? `${summary.slice(0, 147)}...` : summary
}

function buildCommunityPoint(
  point: BaseMapPoint,
  liveCollections: LiveCollectionRecord[],
): CommunityMapPoint {
  // Cada ponto do mapa é recalculado a partir das coletas mais recentes
  // para manter risco, protocolo e resumo sempre coerentes.
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
    latestCollectionNumber:
      typeof latestRecord?.collectionNumber === 'number'
        ? latestRecord.collectionNumber
        : null,
    latestCollectionId: latestRecord?.id ?? null,
    latestCollectionAt: latestRecord?.collectedAt ?? null,
    latestStatus: latestRecord?.status ?? null,
    latestSampleType: latestRecord?.sampleType ?? null,
    latestNote: latestRecord?.note ?? null,
    latestProtocolTitle: latestRecord?.protocolTitle ?? null,
    latestArticleRefs: latestRecord?.articleRefs ?? [],
    latestFieldSummary: getReadableFieldSummary(latestRecord?.note ?? null),
    photoCount: pointRecords.reduce(
      (total, record) => total + (record.photos?.length ?? record.photoCount ?? 0),
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

export function RiverMapPanel({
  mode = 'technical',
  token,
  focusCommunity,
}: RiverMapPanelProps) {
  const mapRef = useRef<MapRef | null>(null)
  const lastFocusedCommunityRef = useRef<string | undefined>(undefined)
  const [theme, setTheme] = useState<ThemeMode>(() => resolveInitialTheme())
  const [isTouchDevice, setIsTouchDevice] = useState(false)
  const [selectedPointId, setSelectedPointId] = useState(() =>
    getInitialSelectedPoint(readLiveCollections())?.id ?? baseMapPoints[0]?.id ?? '',
  )
  const [hoveredPointId, setHoveredPointId] = useState<string | null>(null)
  const [liveCollections, setLiveCollections] = useState<LiveCollectionRecord[]>(
    () => readLiveCollections(),
  )
  const [fetchedLatestCollectionDetail, setFetchedLatestCollectionDetail] =
    useState<LiveCollectionRecord | null>(null)
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

  const popupPoint = communityPoints.find((point) => point.id === hoveredPointId) ?? null
  const selectedLatestLocalRecord =
    liveCollections.find((record) => record.id === selectedMapPoint?.latestCollectionId) ?? null
  const selectedFetchedRecord =
    fetchedLatestCollectionDetail?.id === selectedMapPoint?.latestCollectionId
      ? fetchedLatestCollectionDetail
      : null
  const latestCollectionDetail =
    selectedLatestLocalRecord?.photos?.length
      ? selectedLatestLocalRecord
      : selectedFetchedRecord ?? selectedLatestLocalRecord
  const latestPhotos = latestCollectionDetail?.photos ?? []

  const highlightedCount = communityPoints.filter(
    (point) => point.currentRisk === 'high' || point.currentRisk === 'critical',
  ).length

  useEffect(() => {
    const root = document.documentElement
    const observer = new MutationObserver(() => {
      setTheme(root.dataset.theme === 'dark' ? 'dark' : 'light')
    })

    observer.observe(root, {
      attributes: true,
      attributeFilter: ['data-theme'],
    })

    return () => {
      observer.disconnect()
    }
  }, [])

  useEffect(() => {
    const mediaQuery = window.matchMedia('(hover: none), (pointer: coarse)')
    const syncTouchMode = () => {
      setIsTouchDevice(mediaQuery.matches)
    }

    syncTouchMode()
    mediaQuery.addEventListener('change', syncTouchMode)

    return () => {
      mediaQuery.removeEventListener('change', syncTouchMode)
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    async function refreshLiveCollections() {
      // Primeiro respondemos com o histórico local e depois enriquecemos com a API
      // para o mapa não ficar vazio enquanto a rede responde.
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

  useEffect(() => {
    if (!focusCommunity || focusCommunity === 'all') {
      lastFocusedCommunityRef.current = focusCommunity
      return
    }

    if (lastFocusedCommunityRef.current === focusCommunity) {
      return
    }

    const focusedPoint = communityPoints.find((point) => point.name === focusCommunity)

    if (!focusedPoint) {
      return
    }

    lastFocusedCommunityRef.current = focusCommunity
    const frameId = window.requestAnimationFrame(() => {
      setSelectedPointId(focusedPoint.id)
      mapRef.current?.flyTo({
        center: [focusedPoint.lng, focusedPoint.lat],
        zoom: 9.2,
        speed: 0.8,
        curve: 1.35,
        essential: true,
      })
    })

    return () => {
      window.cancelAnimationFrame(frameId)
    }
  }, [communityPoints, focusCommunity])

  useEffect(() => {
    const latestCollectionId = selectedMapPoint?.latestCollectionId

    if (!latestCollectionId) {
      return
    }

    const localRecord = liveCollections.find((record) => record.id === latestCollectionId)

    if (localRecord?.photos?.length || !token) {
      return
    }

    let active = true

    fetchLiveCollectionDetail(token, latestCollectionId)
      .then((record) => {
        if (active) {
          setFetchedLatestCollectionDetail(record)
        }
      })
      .catch(() => undefined)

    return () => {
      active = false
    }
  }, [liveCollections, selectedMapPoint?.latestCollectionId, token])

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
          {isTouchDevice
            ? 'No celular, toque no ponto para aproximar e leia os detalhes no painel fixo logo abaixo.'
            : isCommunityMode
              ? 'Arraste, aproxime e passe o mouse nos pontos para ver a situacao atual da comunidade.'
              : 'O foco muda conforme as coletas chegam: mais registros altos e muito altos elevam a prioridade do ponto.'}
        </p>
      </div>

      <div className="real-map-shell real-map-shell-interactive">
        <div className={`real-map real-map-interactive real-map-interactive-${theme}`}>
          <MapLibreMap
            attributionControl={false}
            initialViewState={{
              bounds: mapBounds,
              fitBoundsOptions: { padding: 24 },
            }}
            mapLib={maplibregl}
            mapStyle={mapStyles[theme]}
            maxBounds={mapBounds}
            minZoom={5}
            onClick={() => {
              if (isTouchDevice) {
                return
              }

              setHoveredPointId(null)
            }}
            onMoveStart={() => setHoveredPointId(null)}
            ref={mapRef}
            reuseMaps
            style={{ width: '100%', height: 520 }}
          >
            <NavigationControl position="top-right" visualizePitch={false} />

            {communityPoints.map((point) => {
              const isSelected = point.id === selectedMapPoint.id
              const markerSize = getMarkerRadius(point)

              return (
                <Marker
                  anchor="center"
                  key={point.id}
                  latitude={point.lat}
                  longitude={point.lng}
                >
                  <button
                    aria-label={`${point.name}: ${getMapRiskLabel(point.currentRisk)}`}
                  className={`maplibre-marker-button ${
                    isSelected ? 'maplibre-marker-button-active' : ''
                  }`}
                  onClick={() => {
                    setSelectedPointId(point.id)
                    if (isTouchDevice) {
                      setHoveredPointId(point.id)
                    }
                    mapRef.current?.flyTo({
                      center: [point.lng, point.lat],
                      zoom: 9.2,
                      speed: 0.8,
                      curve: 1.35,
                      essential: true,
                    })
                  }}
                  onFocus={() => setHoveredPointId(point.id)}
                  onMouseEnter={() => {
                    if (!isTouchDevice) {
                      setHoveredPointId(point.id)
                    }
                  }}
                  onMouseLeave={() => {
                    if (!isTouchDevice) {
                      setHoveredPointId(null)
                    }
                  }}
                    style={
                      {
                        '--marker-fill': getRiskFillColor(point.currentRisk),
                        '--marker-stroke': getRiskStrokeColor(point.currentRisk),
                        '--marker-size': `${markerSize}px`,
                      } as CSSProperties
                    }
                    type="button"
                  >
                    <span className="maplibre-marker-core" />
                    {point.currentRisk === 'critical' ? (
                      <span className="maplibre-marker-pulse" />
                    ) : null}
                  </button>
                </Marker>
              )
            })}

            {!isTouchDevice && popupPoint ? (
              <Popup
                anchor="top"
                className="maplibre-popup-frame"
                closeButton={false}
                closeOnClick={false}
                latitude={popupPoint.lat}
                longitude={popupPoint.lng}
                offset={24}
              >
                <div className={`real-map-tooltip-body real-map-tooltip-body-${popupPoint.currentRisk}`}>
                  <span>{getMapRiskLabel(popupPoint.currentRisk)}</span>
                  <strong>{popupPoint.name}</strong>
                  <small>{popupPoint.area}</small>
                  <p>{popupPoint.detail}</p>
                  <p>{popupPoint.focusReason}</p>
                  <small>{formatCollectionSummary(popupPoint)}</small>
                  <small>{getLatestSampleSummary(popupPoint)}</small>
                  <small>{getPhotoSummary(popupPoint)}</small>
                </div>
              </Popup>
            ) : null}
          </MapLibreMap>
        </div>
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
            <small>Numero da coleta</small>
            <strong>
              {selectedMapPoint.latestCollectionId
                ? getCollectionSequenceLabel({
                    collectionNumber: selectedMapPoint.latestCollectionNumber ?? undefined,
                    id: selectedMapPoint.latestCollectionId,
                  })
                : 'Sem coleta recente'}
            </strong>
          </div>
          <div>
            <small>Fotos de campo</small>
            <strong>{getPhotoSummary(selectedMapPoint)}</strong>
          </div>
          <div>
            <small>Ultima nota</small>
            <strong>{selectedMapPoint.latestFieldSummary || 'Sem observacao recente'}</strong>
          </div>
        </div>

        {selectedMapPoint.latestProtocolTitle || selectedMapPoint.latestArticleRefs.length > 0 ? (
          <div className="community-map-latest-report">
            <div>
              <small>Protocolo da ultima coleta</small>
              <strong>{selectedMapPoint.latestProtocolTitle ?? 'Protocolo nao informado'}</strong>
            </div>
            <div>
              <small>Base cientifica</small>
              <p>
                {selectedMapPoint.latestArticleRefs.length > 0
                  ? selectedMapPoint.latestArticleRefs.slice(0, 4).join(' | ')
                  : selectedMapPoint.refs}
              </p>
            </div>
          </div>
        ) : null}

        {selectedMapPoint.photoCount > 0 ? (
          <div className="community-map-photo-preview">
            <small>Fotos anexadas</small>
            {latestPhotos.length > 0 ? (
              <div className="community-map-photo-grid">
                {latestPhotos.slice(0, 3).map((photo) => (
                  <a
                    href={photo.dataUrl}
                    key={photo.id}
                    rel="noreferrer"
                    target="_blank"
                  >
                    <img alt={photo.name} src={photo.dataUrl} />
                  </a>
                ))}
              </div>
            ) : (
              <p>Foto registrada. Abrindo imagem da ultima coleta...</p>
            )}
          </div>
        ) : null}

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
