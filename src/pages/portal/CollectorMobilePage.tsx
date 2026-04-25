import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import {
  Camera,
  CheckCircle2,
  ChevronLeft,
  ImagePlus,
  LoaderCircle,
  MapPin,
  Send,
  Smartphone,
} from 'lucide-react'
import { Link, Navigate } from 'react-router-dom'
import type { AuthSession } from '../../portalTypes'
import { riskLabel, type RiskTone } from '../../siteData'
import { submitLiveCollection } from '../../services/portalApi'
import {
  addLiveCollection,
  collectionCommunityOptions,
  collectionSampleTypes,
  readFileAsDataUrl,
  readLiveCollections,
  type LiveCollectionPhoto,
  type LiveCollectionRecord,
} from '../../utils/liveCollections'

function buildPhotoId(index: number) {
  return `PHOTO-${Date.now()}-${index}`
}

export function CollectorMobilePage({ session }: { session: AuthSession | null }) {
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
  const [fieldNote, setFieldNote] = useState('')
  const [photos, setPhotos] = useState<LiveCollectionPhoto[]>([])
  const [records, setRecords] = useState<LiveCollectionRecord[]>(() =>
    readLiveCollections(),
  )
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null)
  const [statusMessage, setStatusMessage] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isLocating, setIsLocating] = useState(false)
  const [isMobileViewport, setIsMobileViewport] = useState(() =>
    window.matchMedia('(max-width: 860px)').matches,
  )

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 860px)')
    const handleChange = (event: MediaQueryListEvent) => {
      setIsMobileViewport(event.matches)
    }

    mediaQuery.addEventListener('change', handleChange)

    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  }, [])

  if (!session) {
    return <Navigate to="/login" replace />
  }

  if (session.user.role !== 'collector') {
    return <Navigate to="/portal" replace />
  }

  const currentSession = session

  const recentRecords = records.slice(0, 5)

  async function handlePhotoSelection(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []).slice(0, 3)

    if (files.length === 0) {
      return
    }

    try {
      const nextPhotos = await Promise.all(
        files.map(async (file, index) => ({
          id: buildPhotoId(index),
          name: file.name,
          dataUrl: await readFileAsDataUrl(file),
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
    setIsSaving(true)
    setStatusMessage('')

    const community =
      collectionCommunityOptions.find((item) => item.name === selectedCommunity) ??
      collectionCommunityOptions[0]

    const nextRecord: LiveCollectionRecord = {
      id: `COL-${Date.now()}`,
      community: community.name,
      sampleType,
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
      note: fieldNote,
      photos,
    }

    try {
      const savedRecord = await submitLiveCollection(currentSession.token, nextRecord)
      setRecords(addLiveCollection(savedRecord))
      setStatusMessage('Coleta enviada. O mapa ja pode refletir a nova pressao da comunidade.')
    } catch {
      setRecords(addLiveCollection(nextRecord))
      setStatusMessage(
        'Coleta salva localmente no aparelho. Quando a API estiver ligada, ela tambem podera seguir para o banco.',
      )
    } finally {
      setIsSaving(false)
      setFieldNote('')
      setPhotos([])
      setPosition(null)
      setStatus('Coletado em campo')
    }
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
            <h1>Registro rapido para agente em campo.</h1>
            <p>
              Tela pensada para celular, com foto, nota e localizacao opcional,
              para enviar a coleta e piorar a classificacao da comunidade no mapa
              conforme o volume aumenta.
            </p>
          </div>

          {!isMobileViewport ? (
            <div className="mobile-only-callout">
              <Smartphone size={18} />
              <p>Esta tela foi desenhada para uso no celular. No computador ela fica apenas de apoio.</p>
            </div>
          ) : null}
        </header>

        <form className="mobile-collector-form" onSubmit={handleSubmit}>
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

          <div className="mobile-collector-grid">
            <label className="field mobile-collector-field">
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

            <label className="field mobile-collector-field">
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
          </div>

          <label className="field mobile-collector-field">
            <span>Status da coleta</span>
            <input
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              placeholder="Ex.: enviado ao laboratorio, aguardando gelo, triado"
            />
          </label>

          <label className="field mobile-collector-field">
            <span>Nota de campo</span>
            <textarea
              className="mobile-collector-textarea"
              value={fieldNote}
              onChange={(event) => setFieldNote(event.target.value)}
              placeholder="Observacoes sobre agua, acesso, familia, especie, etiqueta ou qualquer sinal relevante."
              rows={4}
            />
          </label>

          <div className="mobile-collector-actions">
            <button
              className="button button-secondary"
              onClick={handleCaptureLocation}
              type="button"
            >
              <MapPin size={16} />
              {isLocating ? 'Capturando...' : 'Usar localizacao atual'}
            </button>

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

          {position ? (
            <div className="mobile-capture-note">
              <MapPin size={16} />
              <span>
                Localizacao usada nesta coleta: {position.lat.toFixed(4)}, {position.lng.toFixed(4)}
              </span>
            </div>
          ) : null}

          {photos.length > 0 ? (
            <div className="mobile-photo-grid">
              {photos.map((photo) => (
                <article className="mobile-photo-card" key={photo.id}>
                  <img alt={photo.name} src={photo.dataUrl} />
                  <strong>{photo.name}</strong>
                </article>
              ))}
            </div>
          ) : (
            <div className="mobile-empty-photos">
              <Camera size={16} />
              <span>Sem fotos adicionadas ainda.</span>
            </div>
          )}

          <button className="button button-primary mobile-submit-button" disabled={isSaving} type="submit">
            {isSaving ? <LoaderCircle className="spin-icon" size={16} /> : <Send size={16} />}
            {isSaving ? 'Enviando coleta...' : 'Enviar coleta e atualizar classificacao'}
          </button>

          {statusMessage ? (
            <div className="mobile-status-banner">
              <CheckCircle2 size={18} />
              <p>{statusMessage}</p>
            </div>
          ) : null}
        </form>

        <section className="mobile-history-section">
          <div className="mobile-history-head">
            <h2>Ultimas coletas no aparelho</h2>
            <p>Esses registros ja ajudam o mapa a subir a prioridade da comunidade.</p>
          </div>

          <div className="mobile-history-list">
            {recentRecords.map((record) => (
              <article className="mobile-history-card" key={record.id}>
                <div className="mobile-history-row">
                  <strong>{record.community}</strong>
                  <span className={`risk-pill risk-${record.risk}`}>
                    {riskLabel[record.risk]}
                  </span>
                </div>
                <p>{record.sampleType}</p>
                <small>{record.collectedAt}</small>
                <small>{record.note || 'Sem observacao registrada'}</small>
                <small>{record.photos?.length ?? 0} foto(s) anexada(s)</small>
              </article>
            ))}
          </div>
        </section>
      </div>
    </section>
  )
}
