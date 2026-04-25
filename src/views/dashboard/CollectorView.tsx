import { useState, type FormEvent } from 'react'
import {
  AlertTriangle,
  ClipboardList,
  ExternalLink,
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
import { RiverMapPanel } from '../../components/RiverMapPanel'
import { submitLiveCollection } from '../../services/portalApi'
import {
  addLiveCollection,
  collectionCommunityOptions,
  collectionSampleTypes,
  readLiveCollections,
  type LiveCollectionRecord,
} from '../../utils/liveCollections'

export function CollectorView({
  data,
  token,
}: {
  data: CollectorDashboard
  token: string
}) {
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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const community =
      collectionCommunityOptions.find((item) => item.name === selectedCommunity) ??
      collectionCommunityOptions[0]

    const nextRecord: LiveCollectionRecord = {
      id: `COL-${Date.now()}`,
      community: community.name,
      sampleType,
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
    }

    try {
      const savedRecord = await submitLiveCollection(token, nextRecord)
      setRecords(addLiveCollection(savedRecord))
    } catch {
      setRecords(addLiveCollection(nextRecord))
    }

    setStatus('Coletado em campo')
  }

  return (
    <>
      <section className="dashboard-grid">
        <Panel title="Alertas da rota" icon={<AlertTriangle size={18} />}>
          <AlertList alerts={data.alerts} />
        </Panel>
        <Panel title="Checklist antes de sair" icon={<ClipboardList size={18} />}>
          <ul className="clean-list">
            {data.checklist.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <div className="collector-mobile-link-row">
            <Link className="button button-secondary" to="/portal/collector/coletas">
              <ExternalLink size={16} />
              Abrir tela mobile de coleta
            </Link>
          </div>
        </Panel>
      </section>

      <RiverMapPanel mode="technical" token={token} />

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
          <div className="stack-list">
            {records.slice(0, 5).map((record) => (
              <article className="list-card" key={record.id}>
                <strong>{record.community}</strong>
                <p>{record.sampleType}</p>
                <small>
                  {riskLabel[record.risk]} | {record.status} | {record.collectedAt}
                </small>
                <small>
                  {record.photos?.length ?? 0} foto(s) | {record.note || 'Sem observacao'}
                </small>
              </article>
            ))}
          </div>
        </Panel>
      </section>

      <section className="dashboard-grid">
        <Panel title="Rota do dia" icon={<RouteIcon size={18} />}>
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
        </Panel>
        <Panel title="Coletas prioritarias" icon={<TestTubeDiagonal size={18} />}>
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
        </Panel>
      </section>

      <Panel title="Lotes de amostras" icon={<Waves size={18} />}>
        <div className="support-grid">
          {data.samples.map((item) => (
            <article className="list-card" key={item.label}>
              <strong>{item.label}</strong>
              <p>{item.note}</p>
              <small>{item.amount}</small>
            </article>
          ))}
        </div>
      </Panel>
    </>
  )
}
