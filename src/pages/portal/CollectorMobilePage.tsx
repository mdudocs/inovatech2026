import { useState, type ChangeEvent, type FormEvent } from 'react'
import {
  Camera,
  CheckCircle2,
  ChevronLeft,
  ImagePlus,
  LoaderCircle,
  MapPin,
  Send,
  Trash2,
} from 'lucide-react'
import { Link, Navigate } from 'react-router-dom'
import type { AuthSession } from '../../portalTypes'
import { riskLabel, type RiskTone } from '../../siteData'
import { submitLiveCollection } from '../../services/portalApi'
import {
  addLiveCollection,
  collectionCommunityOptions,
  collectionSampleTypes,
  createCollectionClientId,
  getCollectionSequenceLabel,
  getCollectionProtocol,
  resizeImageForUpload,
  readLiveCollections,
  type LiveCollectionPhoto,
  type LiveCollectionRecord,
  upsertLiveCollection,
} from '../../utils/liveCollections'

function buildPhotoId(index: number) {
  return createCollectionClientId(`PHOTO-${index}`)
}

const quickStatusOptions = [
  'Coletado em campo',
  'Em transporte',
  'Enviado ao laboratorio',
  'Aguardando refrigeracao',
] as const

const reportPrompts = [
  {
    title: 'Condicao do local',
    hint: 'Descreva agua, margem, acesso, odor, cor, mortandade, seca ou outros sinais do ambiente.',
  },
  {
    title: 'Pessoas e exposicao',
    hint: 'Anote quem pode estar mais exposto: pescadores, familias, criancas, gestantes ou consumo frequente de peixe.',
  },
  {
    title: 'Encaminhamento imediato',
    hint: 'Registre orientacao dada, necessidade de retorno, envio ao laboratorio ou acionamento da unidade de saude.',
  },
] as const

export function CollectorMobilePage({ session }: { session: AuthSession | null }) {
  // Esta tela foi pensada para uso em campo: primeiro respondemos no aparelho
  // e depois sincronizamos com a API sem travar o agente.
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
  const [localCondition, setLocalCondition] = useState('')
  const [peopleExposure, setPeopleExposure] = useState('')
  const [actionTaken, setActionTaken] = useState('')
  const [fieldNote, setFieldNote] = useState('')
  const [photos, setPhotos] = useState<LiveCollectionPhoto[]>([])
  const [records, setRecords] = useState<LiveCollectionRecord[]>(() =>
    readLiveCollections(),
  )
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null)
  const [statusMessage, setStatusMessage] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isLocating, setIsLocating] = useState(false)

  if (!session) {
    return <Navigate to="/login" replace />
  }

  if (session.user.role !== 'collector') {
    return <Navigate to="/portal" replace />
  }

  const currentSession = session
  const selectedCommunityData =
    collectionCommunityOptions.find((item) => item.name === selectedCommunity) ??
    collectionCommunityOptions[0]
  const selectedProtocol = getCollectionProtocol(sampleType)
  const canSubmit = Boolean(selectedCommunity && sampleType && status.trim())

  // Ordenamos localmente para manter a percepção de sequência,
  // mesmo antes do banco devolver a numeração oficial.
  const orderedRecords = records
    .slice()
    .sort((first, second) => {
      const firstNumber =
        typeof first.collectionNumber === 'number' ? first.collectionNumber : 0
      const secondNumber =
        typeof second.collectionNumber === 'number' ? second.collectionNumber : 0

      if (firstNumber !== secondNumber) {
        return firstNumber - secondNumber
      }

      return first.collectedAt.localeCompare(second.collectedAt)
    })

  const recentRecords = orderedRecords.slice(-5).reverse()
  const highestCollectionNumber = orderedRecords.reduce(
    (highest, record) =>
      Math.max(
        highest,
        typeof record.collectionNumber === 'number' ? record.collectionNumber : 0,
      ),
    0,
  )
  const nextCollectionNumberLabel = `#${String(highestCollectionNumber + 1).padStart(4, '0')}`
  const reportDraft = [
    `Coleta prevista ${nextCollectionNumberLabel} | Comunidade: ${selectedCommunityData.name}`,
    `Tipo de amostra: ${sampleType}`,
    `Protocolo: ${selectedProtocol.title}`,
    `Base cientifica: ${selectedProtocol.articleRefs.join(', ')}`,
    `Risco observado: ${riskLabel[observedRisk]}`,
    `Status da coleta: ${status || 'Nao informado'}`,
    `Condicao do local: ${localCondition || 'Preencher observacao do ambiente e do acesso.'}`,
    `Pessoas e exposicao: ${peopleExposure || 'Preencher grupos expostos ou rotina de consumo relatada.'}`,
    `Encaminhamento imediato: ${actionTaken || 'Preencher orientacao dada ou necessidade de retorno.'}`,
    `Observacao complementar: ${fieldNote || 'Sem observacao complementar.'}`,
    `Fotos anexadas: ${photos.length}`,
    `Localizacao usada: ${
      position
        ? `${position.lat.toFixed(4)}, ${position.lng.toFixed(4)}`
        : `${selectedCommunityData.lat.toFixed(4)}, ${selectedCommunityData.lng.toFixed(4)}`
    }`,
  ].join('\n')

  async function handlePhotoSelection(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []).slice(0, 3)

    if (files.length === 0) {
      return
    }

    try {
      // Reduzimos as imagens antes de salvar para evitar travas e excesso de memória.
      const nextPhotos = await Promise.all(
        files.map(async (file, index) => ({
          id: buildPhotoId(index),
          name: file.name,
          dataUrl: await resizeImageForUpload(file),
        })),
      )

      setPhotos(nextPhotos)
      setStatusMessage(`${nextPhotos.length} foto(s) adicionada(s) para esta coleta.`)
    } catch {
      setStatusMessage('Nao foi possivel preparar as fotos selecionadas.')
    }
  }

  function handleCaptureLocation() {
    if (!navigator.geolocation) {
      setStatusMessage('Este celular nao liberou geolocalizacao para o navegador.')
      return
    }

    setIsLocating(true)
    navigator.geolocation.getCurrentPosition(
      (currentPosition) => {
        setPosition({
          lat: currentPosition.coords.latitude,
          lng: currentPosition.coords.longitude,
        })
        setStatusMessage('Localizacao atual capturada para esta coleta.')
        setIsLocating(false)
      },
      () => {
        setStatusMessage('Nao foi possivel capturar a localizacao atual.')
        setIsLocating(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
      },
    )
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!canSubmit) {
      setStatusMessage('Preencha comunidade, tipo de amostra e status antes de enviar.')
      return
    }

    setIsSaving(true)
    setStatusMessage('')

    let nextRecord: LiveCollectionRecord
    try {
      const community = selectedCommunityData
      // O relatório completo é consolidado em um texto único para simplificar
      // armazenamento, leitura no mapa e reaproveitamento em outros painéis.
      const combinedReport = [
        `Relatorio da coleta`,
        `Protocolo usado: ${selectedProtocol.title}`,
        `Eixo metodologico: ${selectedProtocol.axis}`,
        `Base cientifica: ${selectedProtocol.articleRefs.join(', ')}`,
        `Campos orientados pelos artigos: ${selectedProtocol.requiredFields.join('; ')}`,
        `Condicao do local: ${localCondition || 'Sem registro'}`,
        `Pessoas e exposicao: ${peopleExposure || 'Sem registro'}`,
        `Encaminhamento imediato: ${actionTaken || 'Sem registro'}`,
        `Observacao complementar: ${fieldNote || 'Sem observacao complementar'}`,
      ].join('\n')

      nextRecord = {
        id: createCollectionClientId(),
        community: community.name,
        sampleType,
        protocolId: selectedProtocol.id,
        protocolTitle: selectedProtocol.title,
        articleRefs: selectedProtocol.articleRefs,
        requiredFields: selectedProtocol.requiredFields,
        collector: currentSession.user.name,
        status,
        collectedAt: new Date().toLocaleString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        lat: position?.lat ?? community.lat,
        lng: position?.lng ?? community.lng,
        risk: observedRisk,
        note: combinedReport,
        photos,
      }

      setRecords(addLiveCollection(nextRecord))
      setStatusMessage(
        `${getCollectionSequenceLabel(nextRecord)} salva no aparelho. Sincronizando com a API em segundo plano...`,
      )

      setLocalCondition('')
      setPeopleExposure('')
      setActionTaken('')
      setFieldNote('')
      setPhotos([])
      setPosition(null)
      setStatus('Coletado em campo')
      setSelectedCommunity(collectionCommunityOptions[0].name)
      setObservedRisk(collectionCommunityOptions[0].risk)
    } catch {
      setStatusMessage(
        'A coleta nao conseguiu ser preparada no aparelho. Tente novamente com menos fotos ou aguarde alguns segundos.',
      )
      setIsSaving(false)
      return
    }

    setIsSaving(false)

    // A confirmação com a API roda em segundo plano para o fluxo continuar leve.
    void submitLiveCollection(currentSession.token, nextRecord)
      .then((savedRecord) => {
        setRecords(upsertLiveCollection(savedRecord))
        setStatusMessage(
          `${getCollectionSequenceLabel(savedRecord)} sincronizada com sucesso. O mapa ja pode refletir a nova pressao da comunidade.`,
        )
      })
      .catch(() => {
        setStatusMessage(
          `${getCollectionSequenceLabel(nextRecord)} ficou salva no aparelho. Quando a conexao melhorar, ela podera seguir para o banco.`,
        )
      })
  }

  return (
    <section className="mobile-collector-page">
      <div className="mobile-collector-shell">
        <header className="mobile-collector-header">
          <Link className="mobile-collector-back" to="/portal/collector">
            <ChevronLeft size={16} />
            Voltar ao portal
          </Link>

          <div className="mobile-collector-heading">
            <span className="section-badge">Coleta mobile</span>
            <h1>Nova coleta de campo.</h1>
            <p>Registre comunidade, amostra, risco, fotos e coordenada do ponto.</p>
          </div>
        </header>

        <form className="mobile-collector-form" onSubmit={handleSubmit}>
          <div className="mobile-form-section">
            <div className="mobile-form-section-head">
              <small>Etapa 1 de 4</small>
              <strong>Local da coleta</strong>
            </div>

            <label className="field mobile-collector-field">
              <span>Comunidade</span>
              <select
                className="admin-select"
                value={selectedCommunity}
                onChange={(event) => {
                  const nextCommunity = event.target.value
                  const community =
                    collectionCommunityOptions.find((item) => item.name === nextCommunity) ??
                    collectionCommunityOptions[0]

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

            <div className="mobile-collector-summary">
              <div>
                <small>Proxima coleta</small>
                <strong>#{String(highestCollectionNumber + 1).padStart(4, '0')}</strong>
              </div>
              <div>
                <small>Risco base</small>
                <strong>{riskLabel[selectedCommunityData.risk]}</strong>
              </div>
              <div>
                <small>Coordenada base</small>
                <strong>
                  {selectedCommunityData.lat.toFixed(3)}, {selectedCommunityData.lng.toFixed(3)}
                </strong>
              </div>
            </div>

            <button
              className="button button-secondary mobile-action-full"
              onClick={handleCaptureLocation}
              type="button"
            >
              <MapPin size={16} />
              {isLocating ? 'Capturando localizacao...' : 'Usar localizacao atual'}
            </button>

            {position ? (
              <div className="mobile-capture-note">
                <MapPin size={16} />
                <span>
                  Localizacao capturada: {position.lat.toFixed(4)}, {position.lng.toFixed(4)}
                </span>
              </div>
            ) : null}
          </div>

          <div className="mobile-form-section">
            <div className="mobile-form-section-head">
              <small>Etapa 2 de 4</small>
              <strong>Amostra e risco observado</strong>
            </div>

            <div className="mobile-choice-block">
              <span>Tipo de amostra</span>
              <div className="mobile-choice-grid">
                {collectionSampleTypes.map((item) => (
                  <button
                    key={item}
                    className={`mobile-choice-chip ${sampleType === item ? 'is-active' : ''}`}
                    onClick={() => setSampleType(item)}
                    type="button"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="mobile-choice-block">
              <span>Risco observado</span>
              <div className="mobile-choice-grid mobile-choice-grid-compact">
                {(['medium', 'high', 'critical'] as const).map((item) => (
                  <button
                    key={item}
                    className={`mobile-choice-chip mobile-choice-chip-risk mobile-choice-chip-risk-${item} ${
                      observedRisk === item ? 'is-active' : ''
                    }`}
                    onClick={() => setObservedRisk(item as RiskTone)}
                    type="button"
                  >
                    {riskLabel[item]}
                  </button>
                ))}
              </div>
            </div>

            <label className="field mobile-collector-field">
              <span>Status da coleta</span>
              <input
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                placeholder="Ex.: enviado ao laboratorio, aguardando gelo, triado"
              />
            </label>

            <div className="mobile-choice-grid mobile-choice-grid-compact">
              {quickStatusOptions.map((item) => (
                <button
                  key={item}
                  className={`mobile-choice-chip ${status === item ? 'is-active' : ''}`}
                  onClick={() => setStatus(item)}
                  type="button"
                >
                  {item}
                </button>
              ))}
            </div>

            <details className="mobile-protocol-details">
              <summary>Ver protocolo cientifico desta amostra</summary>
              <article className="collection-protocol-card">
                <div className="collection-protocol-head">
                  <div>
                    <small>Base nos artigos</small>
                    <strong>{selectedProtocol.title}</strong>
                    <span>{selectedProtocol.axis}</span>
                  </div>
                </div>
                <p>{selectedProtocol.reason}</p>
                <div className="article-ref-row">
                  {selectedProtocol.articleRefs.map((ref) => (
                    <span className="article-ref-chip" key={ref}>
                      {ref}
                    </span>
                  ))}
                </div>
                <div className="collection-protocol-checklist">
                  {selectedProtocol.requiredFields.map((field) => (
                    <span key={field}>{field}</span>
                  ))}
                </div>
              </article>
            </details>
          </div>

          <div className="mobile-form-section">
            <div className="mobile-form-section-head">
              <small>Etapa 3 de 4</small>
              <strong>Fotos e observacao rapida</strong>
            </div>

            <div className="mobile-collector-actions">
              <label className="mobile-photo-trigger">
                <ImagePlus size={16} />
                Adicionar fotos
                <input
                  accept="image/*"
                  capture="environment"
                  multiple
                  onChange={handlePhotoSelection}
                  type="file"
                />
              </label>
            </div>

            {photos.length > 0 ? (
              <div className="mobile-photo-grid">
                {photos.map((photo) => (
                  <article className="mobile-photo-card" key={photo.id}>
                    <img alt={photo.name} src={photo.dataUrl} />
                    <div className="mobile-photo-card-row">
                      <strong>{photo.name}</strong>
                      <button
                        className="mobile-photo-remove"
                        onClick={() =>
                          setPhotos((current) => current.filter((item) => item.id !== photo.id))
                        }
                        type="button"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="mobile-empty-photos">
                <Camera size={16} />
                <span>Nenhuma foto adicionada.</span>
              </div>
            )}

            <label className="field mobile-collector-field">
              <span>Nota de campo</span>
              <textarea
                className="mobile-collector-textarea"
                value={fieldNote}
                onChange={(event) => setFieldNote(event.target.value)}
                placeholder="Observacoes rápidas: cor da agua, acesso, etiqueta, especie, familia ou sinal relevante."
                rows={4}
              />
            </label>
          </div>

          <div className="mobile-form-section">
            <div className="mobile-form-section-head">
              <small>Etapa 4 de 4</small>
              <strong>Relatorio e envio</strong>
            </div>

            <div className="mobile-report-guide">
              {reportPrompts.map((item) => (
                <article className="mobile-report-guide-card" key={item.title}>
                  <strong>{item.title}</strong>
                  <small>{item.hint}</small>
                </article>
              ))}
            </div>

            <label className="field mobile-collector-field">
              <span>Condicao do local</span>
              <textarea
                className="mobile-collector-textarea"
                value={localCondition}
                onChange={(event) => setLocalCondition(event.target.value)}
                placeholder="Ex.: agua turva, acesso por trapiche, margem com pouco volume, cheiro incomum."
                rows={3}
              />
            </label>

            <label className="field mobile-collector-field">
              <span>Pessoas e exposicao</span>
              <textarea
                className="mobile-collector-textarea"
                value={peopleExposure}
                onChange={(event) => setPeopleExposure(event.target.value)}
                placeholder="Ex.: familias relataram consumo frequente de peixe local; criancas e gestantes na area."
                rows={3}
              />
            </label>

            <label className="field mobile-collector-field">
              <span>Encaminhamento imediato</span>
              <textarea
                className="mobile-collector-textarea"
                value={actionTaken}
                onChange={(event) => setActionTaken(event.target.value)}
                placeholder="Ex.: orientar reducao do consumo, retornar em 7 dias, enviar amostra ao laboratorio."
                rows={3}
              />
            </label>

            <details className="mobile-report-preview">
              <summary>Ver resumo antes de enviar</summary>
              <pre>{reportDraft}</pre>
            </details>

            <button className="button button-primary mobile-submit-button" disabled={isSaving} type="submit">
              {isSaving ? <LoaderCircle className="spin-icon" size={16} /> : <Send size={16} />}
              {isSaving ? 'Enviando coleta...' : 'Enviar coleta'}
            </button>

            <div className="mobile-submit-note">
              <small>
                {sampleType} em {selectedCommunityData.name} | {riskLabel[observedRisk]} | {photos.length} foto(s)
              </small>
            </div>

            {statusMessage ? (
              <div className="mobile-status-banner">
                <CheckCircle2 size={18} />
                <p>{statusMessage}</p>
              </div>
            ) : null}
          </div>
        </form>

        <section className="mobile-history-section">
          <div className="mobile-history-head">
            <h2>Coletas recentes</h2>
            <p>Ultimos registros sincronizados pelo agente.</p>
          </div>

          <div className="mobile-history-list">
            {recentRecords.map((record) => (
              <article className="mobile-history-card" key={record.id}>
                <div className="mobile-history-row">
                  <div>
                    <span className="mobile-history-sequence">
                      {getCollectionSequenceLabel(record)}
                    </span>
                    <strong>{record.community}</strong>
                  </div>
                  <span className={`risk-pill risk-${record.risk}`}>
                    {riskLabel[record.risk]}
                  </span>
                </div>

                <div className="mobile-history-chip-row">
                  <span>{record.sampleType}</span>
                  <span>{record.status}</span>
                  <span>{record.photos?.length ?? record.photoCount ?? 0} foto(s)</span>
                </div>

                <div className="mobile-history-meta">
                  <small>{record.collectedAt}</small>
                  <small>
                    {(record.articleRefs?.length
                      ? record.articleRefs
                      : getCollectionProtocol(record.sampleType).articleRefs
                    )
                      .slice(0, 3)
                      .join(' | ')}
                  </small>
                </div>

                <p className="mobile-history-note">
                  {record.note
                    ? 'Relatorio completo registrado com protocolo, observacoes e encaminhamento.'
                    : 'Sem relatorio complementar registrado.'}
                </p>

                <Link className="mobile-history-link" to="/portal/coletas">
                  Ver relatorio completo
                </Link>
              </article>
            ))}
          </div>
        </section>
      </div>
    </section>
  )
}
