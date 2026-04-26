import { useEffect, useMemo, useState, type FormEvent } from 'react'
import {
  Camera,
  FileSearch,
  FileText,
  LoaderCircle,
  Search,
  SlidersHorizontal,
} from 'lucide-react'
import { Navigate } from 'react-router-dom'
import { Panel } from '../../components/portal/Panel'
import type { AuthSession } from '../../portalTypes'
import {
  fetchLiveCollectionDetail,
  fetchLiveCollections,
  type CollectionSearchParams,
} from '../../services/portalApi'
import { riskLabel } from '../../siteData'
import {
  collectionCommunityOptions,
  getCollectionProtocol,
  getCollectionSequenceLabel,
  readLiveCollections,
  type LiveCollectionRecord,
  upsertLiveCollection,
} from '../../utils/liveCollections'

const allowedRoles = new Set(['collector', 'doctor', 'admin'])

export function CollectionArchivePage({ session }: { session: AuthSession | null }) {
  const [query, setQuery] = useState('')
  const [risk, setRisk] = useState('')
  const [community, setCommunity] = useState('')
  const [records, setRecords] = useState<LiveCollectionRecord[]>([])
  const [selectedRecordId, setSelectedRecordId] = useState('')
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [detailLoadingId, setDetailLoadingId] = useState('')
  const [error, setError] = useState('')

  const selectedRecord =
    records.find((record) => record.id === selectedRecordId) ?? records[0] ?? null
  const selectedRecordProtocol = selectedRecord
    ? getCollectionProtocol(selectedRecord.sampleType)
    : null

  const stats = useMemo(() => {
    const critical = records.filter((record) => record.risk === 'critical').length
    const high = records.filter((record) => record.risk === 'high').length
    const withPhotos = records.filter(
      (record) => (record.photoCount ?? record.photos?.length ?? 0) > 0,
    ).length

    return { critical, high, total: records.length, withPhotos }
  }, [records])

  async function loadCollections(params?: CollectionSearchParams) {
    if (!session) {
      return
    }

    setStatus('loading')
    setError('')

    try {
      const nextRecords = await fetchLiveCollections(session.token, {
        limit: 200,
        ...params,
      })

      setRecords(nextRecords)
      setSelectedRecordId((currentId) => {
        if (nextRecords.some((record) => record.id === currentId)) {
          return currentId
        }

        return nextRecords[0]?.id ?? ''
      })
      setStatus('ready')
    } catch (loadError) {
      const localRecords = readLiveCollections()
      setRecords(localRecords)
      setSelectedRecordId(localRecords[0]?.id ?? '')
      setStatus('error')
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'Nao foi possivel buscar as coletas.',
      )
    }
  }

  async function openRecord(record: LiveCollectionRecord) {
    if (!session) {
      return
    }

    setSelectedRecordId(record.id)
    setError('')

    if (record.note || record.photos?.length) {
      return
    }

    setDetailLoadingId(record.id)

    try {
      const detailedRecord = await fetchLiveCollectionDetail(session.token, record.id)
      setRecords((currentRecords) =>
        currentRecords.map((item) =>
          item.id === detailedRecord.id ? detailedRecord : item,
        ),
      )
      upsertLiveCollection(detailedRecord)
    } catch (detailError) {
      setError(
        detailError instanceof Error
          ? detailError.message
          : 'Nao foi possivel abrir esta coleta.',
      )
    } finally {
      setDetailLoadingId('')
    }
  }

  function handleSearch(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault()
    void loadCollections({
      q: query,
      risk,
      community,
    })
  }

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      void loadCollections()
    })

    return () => {
      window.cancelAnimationFrame(frameId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.token])

  if (!session) {
    return <Navigate to="/login" replace />
  }

  if (!allowedRoles.has(session.user.role)) {
    return <Navigate to="/portal" replace />
  }

  return (
    <section className="collection-archive-page">
      <div className="simple-card collection-archive-hero">
        <span className="section-badge">Historico de coletas</span>
        <h1 className="section-title">Coletas organizadas por numero.</h1>
        <p className="section-text">
          Pesquise por numero, comunidade, status, responsavel ou texto do relatorio.
          Abra uma coleta para ver fotos, coordenada, relato completo e base cientifica usada.
        </p>
      </div>

      <section className="metric-grid">
        <article className="metric-card metric-card-teal">
          <span>Total encontrado</span>
          <strong>{stats.total}</strong>
          <p>Coletas retornadas pela busca atual.</p>
        </article>
        <article className="metric-card metric-card-coral">
          <span>Muito alto</span>
          <strong>{stats.critical}</strong>
          <p>Registros com alerta critico.</p>
        </article>
        <article className="metric-card metric-card-gold">
          <span>Alto</span>
          <strong>{stats.high}</strong>
          <p>Registros com risco elevado.</p>
        </article>
        <article className="metric-card metric-card-slate">
          <span>Com fotos</span>
          <strong>{stats.withPhotos}</strong>
          <p>Coletas com evidencia visual.</p>
        </article>
      </section>

      <Panel title="Pesquisar coletas" icon={<Search size={18} />}>
        <form className="collection-search-form" onSubmit={handleSearch}>
          <label className="field collection-search-wide">
            <span>Busca</span>
            <input
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Ex.: #0007, Barcelos, enviado, relatorio..."
              value={query}
            />
          </label>

          <label className="field">
            <span>Comunidade</span>
            <select
              className="admin-select"
              onChange={(event) => setCommunity(event.target.value)}
              value={community}
            >
              <option value="">Todas</option>
              {collectionCommunityOptions.map((item) => (
                <option key={item.name} value={item.name}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Risco</span>
            <select
              className="admin-select"
              onChange={(event) => setRisk(event.target.value)}
              value={risk}
            >
              <option value="">Todos</option>
              <option value="medium">{riskLabel.medium}</option>
              <option value="high">{riskLabel.high}</option>
              <option value="critical">{riskLabel.critical}</option>
            </select>
          </label>

          <button className="button button-primary" type="submit">
            <SlidersHorizontal size={16} />
            Filtrar
          </button>
        </form>
      </Panel>

      {error ? <p className="form-error">{error}</p> : null}

      <section className="collection-archive-grid">
        <Panel title="Lista de coletas" icon={<FileSearch size={18} />}>
          <div className="collection-table">
            <div className="collection-table-head">
              <span>Numero</span>
              <span>Comunidade</span>
              <span>Risco</span>
              <span>Status</span>
              <span>Fotos</span>
            </div>

            {status === 'loading' ? (
              <div className="collection-table-state">
                <LoaderCircle className="spin-icon" size={18} />
                Buscando coletas...
              </div>
            ) : null}

            {records.map((record) => (
              <button
                className={`collection-table-row ${
                  selectedRecord?.id === record.id ? 'collection-table-row-active' : ''
                }`}
                key={record.id}
                onClick={() => void openRecord(record)}
                type="button"
              >
                <strong>{getCollectionSequenceLabel(record)}</strong>
                <span>{record.community}</span>
                <span className={`risk-pill risk-${record.risk}`}>
                  {riskLabel[record.risk]}
                </span>
                <span>{record.status}</span>
                <span>{record.photoCount ?? record.photos?.length ?? 0}</span>
              </button>
            ))}

            {status !== 'loading' && records.length === 0 ? (
              <div className="collection-table-state">
                Nenhuma coleta encontrada para essa busca.
              </div>
            ) : null}
          </div>
        </Panel>

        <Panel title="Detalhe da coleta" icon={<FileText size={18} />}>
          {selectedRecord ? (
            <div className="collection-detail-panel collection-detail-panel-sticky">
              <div className="collection-detail-head">
                <div>
                  <span className="section-badge">
                    {getCollectionSequenceLabel(selectedRecord)}
                  </span>
                  <h3>{selectedRecord.community}</h3>
                  <p>
                    {selectedRecord.sampleType} | {riskLabel[selectedRecord.risk]} |{' '}
                    {selectedRecord.status}
                  </p>
                </div>
                {detailLoadingId === selectedRecord.id ? (
                  <span className="collection-detail-loading">
                    <LoaderCircle className="spin-icon" size={16} />
                    Abrindo
                  </span>
                ) : null}
              </div>

              <div className="collection-detail-grid">
                <div>
                  <small>Responsavel</small>
                  <strong>{selectedRecord.collector}</strong>
                </div>
                <div>
                  <small>Data</small>
                  <strong>{selectedRecord.collectedAt}</strong>
                </div>
                <div>
                  <small>Coordenada</small>
                  <strong>
                    {selectedRecord.lat.toFixed(4)}, {selectedRecord.lng.toFixed(4)}
                  </strong>
                </div>
                <div>
                  <small>Fotos</small>
                  <strong>
                    {selectedRecord.photos?.length ?? selectedRecord.photoCount ?? 0}
                  </strong>
                </div>
              </div>

              <div className="collection-science-box">
                <small>Base cientifica da coleta</small>
                <strong>
                  {selectedRecord.protocolTitle ?? selectedRecordProtocol?.title}
                </strong>
                <p>{selectedRecordProtocol?.axis}</p>
                <div className="article-ref-row">
                  {(selectedRecord.articleRefs ?? selectedRecordProtocol?.articleRefs ?? []).map(
                    (ref) => (
                      <span className="article-ref-chip" key={ref}>
                        {ref}
                      </span>
                    ),
                  )}
                </div>
                <div className="collection-protocol-checklist">
                  {(
                    selectedRecord.requiredFields ??
                    selectedRecordProtocol?.requiredFields ??
                    []
                  ).map((field) => (
                    <span key={field}>{field}</span>
                  ))}
                </div>
              </div>

              <div className="collection-report-box">
                <small>Relatorio completo</small>
                <pre>{selectedRecord.note || 'Sem relatorio registrado nesta coleta.'}</pre>
              </div>

              {(selectedRecord.photos?.length ?? 0) > 0 ? (
                <div className="collection-photo-grid collection-photo-grid-compact">
                  {selectedRecord.photos?.map((photo) => (
                    <a
                      className="collection-photo-card"
                      href={photo.dataUrl}
                      key={photo.id}
                      rel="noreferrer"
                      target="_blank"
                    >
                      <img alt={photo.name} src={photo.dataUrl} />
                      <span>
                        <Camera size={14} />
                        {photo.name}
                      </span>
                    </a>
                  ))}
                </div>
              ) : (
                <div className="collection-empty-photos">
                  <Camera size={16} />
                  <span>Nenhuma foto anexada nesta coleta.</span>
                </div>
              )}
            </div>
          ) : (
            <p className="section-text">Selecione uma coleta para ver os detalhes.</p>
          )}
        </Panel>
      </section>
    </section>
  )
}
