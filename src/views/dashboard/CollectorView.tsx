import { useEffect, useState, type FormEvent } from 'react'
import {
  AlertTriangle,
  Camera,
  ClipboardList,
  ExternalLink,
  FileText,
  LoaderCircle,
  MapPin,
  Route as RouteIcon,
  Send,
  TestTubeDiagonal,
  Waves,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import type { CollectorDashboard } from '../../portalTypes'
import { riskLabel, type RiskTone } from '../../siteData'
import { AlertList } from '../../components/portal/AlertList'
import { Panel } from '../../components/portal/Panel'
import { LazyRiverMapPanel } from '../../components/LazyRiverMapPanel'
import {
  fetchLiveCollectionDetail,
  fetchLiveCollections,
  submitLiveCollection,
} from '../../services/portalApi'
import {
  addLiveCollection,
  collectionCommunityOptions,
  collectionSampleTypes,
  createCollectionClientId,
  getCollectionProtocol,
  getCollectionSequenceLabel,
  mergeLiveCollections,
  readLiveCollections,
  type LiveCollectionRecord,
  upsertLiveCollection,
} from '../../utils/liveCollections'

export function CollectorView({
  data,
  token,
}: {
  data: CollectorDashboard
  token: string
}) {
  // Esta view atende o agente no desktop: resumo operacional,
  // rota do dia, registro rapido e consulta das coletas recentes.
  const [selectedCommunity, setSelectedCommunity] = useState(
    collectionCommunityOptions[0].name,
  )
  const [sampleType, setSampleType] = useState<(typeof collectionSampleTypes)[number]>(
    collectionSampleTypes[0],
  )
  const [status, setStatus] = useState('Coletado em campo')
  const [observedRisk, setObservedRisk] = useState<RiskTone>(
    collectionCommunityOptions[0].risk,
  )
  const [records, setRecords] = useState<LiveCollectionRecord[]>(() =>
    readLiveCollections(),
  )
  const [selectedRecordId, setSelectedRecordId] = useState('')
  const [detailLoadingId, setDetailLoadingId] = useState('')
  const [detailError, setDetailError] = useState('')

  const selectedRecord =
    records.find((record) => record.id === selectedRecordId) ?? records[0] ?? null
  const selectedProtocol = getCollectionProtocol(sampleType)
  const selectedRecordProtocol = selectedRecord
    ? getCollectionProtocol(selectedRecord.sampleType)
    : null

  useEffect(() => {
    let active = true

    async function loadCollections() {
      // O desktop tenta abrir com a visao mais completa possivel,
      // mesclando o que esta na API com o cache local do navegador.
      const localRecords = readLiveCollections()

      try {
        const apiRecords = await fetchLiveCollections(token)

        if (!active) {
          return
        }

        setRecords(mergeLiveCollections(apiRecords, localRecords))
      } catch {
        if (active) {
          setRecords(localRecords)
        }
      }
    }

    void loadCollections()

    return () => {
      active = false
    }
  }, [token])

  async function handleSelectRecord(record: LiveCollectionRecord) {
    // So buscamos detalhe extra quando o item ainda nao trouxe
    // nota completa ou fotos no carregamento inicial.
    setSelectedRecordId(record.id)
    setDetailError('')

    const hasFullDetail = Boolean(record.note || record.photos?.length)

    if (hasFullDetail) {
      return
    }

    setDetailLoadingId(record.id)

    try {
      const detailedRecord = await fetchLiveCollectionDetail(token, record.id)
      setRecords(upsertLiveCollection(detailedRecord))
      setSelectedRecordId(detailedRecord.id)
    } catch (error) {
      setDetailError(
        error instanceof Error
          ? error.message
          : 'Nao foi possivel abrir os detalhes desta coleta.',
      )
    } finally {
      setDetailLoadingId('')
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    // O desktop usa o mesmo formato de coleta da versao mobile,
    // mas com um fluxo resumido para apoio operacional.
    const community =
      collectionCommunityOptions.find((item) => item.name === selectedCommunity) ??
      collectionCommunityOptions[0]

    const nextRecord: LiveCollectionRecord = {
      id: createCollectionClientId(),
      community: community.name,
      sampleType,
      protocolId: selectedProtocol.id,
      protocolTitle: selectedProtocol.title,
      articleRefs: selectedProtocol.articleRefs,
      requiredFields: selectedProtocol.requiredFields,
      collector: 'Equipe de campo',
      status,
      collectedAt: new Date().toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      lat: community.lat,
      lng: community.lng,
      risk: observedRisk,
      note: [
        `Protocolo usado: ${selectedProtocol.title}`,
        `Eixo metodologico: ${selectedProtocol.axis}`,
        `Base cientifica: ${selectedProtocol.articleRefs.join(', ')}`,
        `Campos orientados pelos artigos: ${selectedProtocol.requiredFields.join('; ')}`,
      ].join('\n'),
    }

    try {
      const savedRecord = await submitLiveCollection(token, nextRecord)
      setRecords(addLiveCollection(savedRecord))
      setSelectedRecordId(savedRecord.id)
    } catch {
      setRecords(addLiveCollection(nextRecord))
      setSelectedRecordId(nextRecord.id)
    }

    setStatus('Coletado em campo')
  }

  return (
    <>
      <section className="dashboard-grid">
        <Panel title="Alertas da rota" icon={<AlertTriangle size={18} />}>
          <AlertList
            alerts={data.alerts}
            emptyMessage="Nenhum alerta de rota registrado."
          />
        </Panel>
        <Panel title="Checklist antes de sair" icon={<ClipboardList size={18} />}>
          {data.checklist.length > 0 ? (
            <ul className="clean-list">
              {data.checklist.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : (
            <p className="section-text">Nenhum checklist de campo criado ainda.</p>
          )}
          <div className="collector-mobile-entry">
            <Link className="button button-secondary" to="/portal/collector/coletas">
              <ExternalLink size={16} />
              Abrir coleta no celular
            </Link>
            <Link className="button button-secondary" to="/portal/coletas">
              <FileText size={16} />
              Pesquisar historico
            </Link>
          </div>
        </Panel>
      </section>

      <LazyRiverMapPanel mode="technical" token={token} />

      <section className="dashboard-grid">
        <Panel title="Registrar coleta agora" icon={<TestTubeDiagonal size={18} />}>
          <form className="collection-form" onSubmit={handleSubmit}>
            <label className="field">
              <span>Comunidade / ponto</span>
              <select
                className="admin-select"
                value={selectedCommunity}
                onChange={(event) => {
                  const nextCommunity = event.target.value
                  const community =
                    collectionCommunityOptions.find(
                      (item) => item.name === nextCommunity,
                    ) ?? collectionCommunityOptions[0]

                  setSelectedCommunity(nextCommunity)
                  setObservedRisk(community.risk)
                }}
              >
                {collectionCommunityOptions.map((item) => (
                  <option key={item.name} value={item.name}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Tipo de amostra</span>
              <select
                className="admin-select"
                value={sampleType}
                onChange={(event) =>
                  setSampleType(event.target.value as typeof sampleType)
                }
              >
                {collectionSampleTypes.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Risco observado</span>
              <select
                className="admin-select"
                value={observedRisk}
                onChange={(event) => setObservedRisk(event.target.value as RiskTone)}
              >
                <option value="medium">{riskLabel.medium}</option>
                <option value="high">{riskLabel.high}</option>
                <option value="critical">{riskLabel.critical}</option>
              </select>
            </label>

            <article className="collection-protocol-card collection-form-wide">
              <div className="collection-protocol-head">
                <div>
                  <small>Base nos artigos</small>
                  <strong>{selectedProtocol.title}</strong>
                  <span>{selectedProtocol.axis}</span>
                </div>
              </div>
              <p>{selectedProtocol.guidance}</p>
              <div className="article-ref-row">
                {selectedProtocol.articleRefs.map((ref) => (
                  <span className="article-ref-chip" key={ref}>
                    {ref}
                  </span>
                ))}
              </div>
            </article>

            <label className="field collection-form-wide">
              <span>Status</span>
              <input
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                placeholder="Ex.: coletado, em transporte, enviado ao laboratorio"
              />
            </label>

            <button className="button button-primary collection-form-wide" type="submit">
              <Send size={16} />
              Registrar e atualizar mapa
            </button>
          </form>
        </Panel>

        <Panel title="Coletas enviadas ao mapa" icon={<MapPin size={18} />}>
          {records.length > 0 ? (
            <div className="stack-list">
              {records.slice(0, 5).map((record) => (
                <button
                  className={`collection-list-card list-card ${
                    selectedRecord?.id === record.id ? 'collection-list-card-active' : ''
                  }`}
                  key={record.id}
                  onClick={() => void handleSelectRecord(record)}
                  type="button"
                >
                  <strong>{record.community}</strong>
                  <p>{record.sampleType}</p>
                  <small>{getCollectionSequenceLabel(record)}</small>
                  <small>
                    {riskLabel[record.risk]} | {record.status} | {record.collectedAt}
                  </small>
                  <small>
                    {record.photoCount ?? record.photos?.length ?? 0} foto(s) |{' '}
                    {record.note ? 'Relatorio registrado' : 'Clique para ver detalhes'}
                  </small>
                </button>
              ))}
            </div>
          ) : (
            <p className="section-text">Nenhuma coleta enviada ao mapa ainda.</p>
          )}
        </Panel>
      </section>

      <Panel title="Detalhe da coleta selecionada" icon={<FileText size={18} />}>
        {selectedRecord ? (
          <div className="collection-detail-panel">
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
                  Abrindo detalhes
                </span>
              ) : null}
            </div>

            {detailError ? <p className="form-error">{detailError}</p> : null}

            <div className="collection-detail-grid">
              <div>
                <small>Responsavel</small>
                <strong>{selectedRecord.collector}</strong>
              </div>
              <div>
                <small>Data da coleta</small>
                <strong>{selectedRecord.collectedAt}</strong>
              </div>
              <div>
                <small>Coordenada</small>
                <strong>
                  {selectedRecord.lat.toFixed(4)}, {selectedRecord.lng.toFixed(4)}
                </strong>
              </div>
              <div>
                <small>Fotos anexadas</small>
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
            </div>

            <div className="collection-report-box">
              <small>Relatorio completo</small>
              <pre>{selectedRecord.note || 'Sem relatorio registrado nesta coleta.'}</pre>
            </div>

            {(selectedRecord.photos?.length ?? 0) > 0 ? (
              <div className="collection-photo-grid">
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
          <p className="section-text">Nenhuma coleta registrada ainda.</p>
        )}
      </Panel>

      <section className="dashboard-grid">
        <Panel title="Rota do dia" icon={<RouteIcon size={18} />}>
          {data.route.length > 0 ? (
            <div className="timeline-list">
              {data.route.map((item) => (
                <article className="timeline-item" key={`${item.stop}-${item.eta}`}>
                  <span className="timeline-time">{item.eta}</span>
                  <div>
                    <strong>{item.stop}</strong>
                    <p>{item.focus}</p>
                    <small>{item.risk}</small>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="section-text">Nenhuma rota planejada para hoje.</p>
          )}
        </Panel>
        <Panel title="Coletas prioritarias" icon={<TestTubeDiagonal size={18} />}>
          {data.tasks.length > 0 ? (
            <div className="stack-list">
              {data.tasks.map((item) => (
                <article className="list-card" key={`${item.community}-${item.sampleType}`}>
                  <strong>{item.community}</strong>
                  <p>{item.sampleType}</p>
                  <small>
                    {item.window} | {item.owner} | {item.status}
                  </small>
                </article>
              ))}
            </div>
          ) : (
            <p className="section-text">Nenhuma coleta prioritaria cadastrada.</p>
          )}
        </Panel>
      </section>

      <Panel title="Lotes de amostras" icon={<Waves size={18} />}>
        {data.samples.length > 0 ? (
          <div className="support-grid">
            {data.samples.map((item) => (
              <article className="list-card" key={item.label}>
                <strong>{item.label}</strong>
                <p>{item.note}</p>
                <small>{item.amount}</small>
              </article>
            ))}
          </div>
        ) : (
          <p className="section-text">Nenhum lote iniciado.</p>
        )}
      </Panel>
    </>
  )
}
