import type { RiskTone } from '../siteData'

export type LiveCollectionRecord = {
  id: string
  collectionNumber?: number
  community: string
  sampleType: string
  protocolId?: string
  protocolTitle?: string
  articleRefs?: string[]
  requiredFields?: string[]
  collector: string
  status: string
  collectedAt: string
  lat: number
  lng: number
  risk: RiskTone
  note?: string
  photos?: LiveCollectionPhoto[]
  photoCount?: number
}

export type LiveCollectionPhoto = {
  id: string
  name: string
  dataUrl: string
}

export type CollectionCommunityOption = {
  name: string
  lat: number
  lng: number
  risk: RiskTone
}

export const LIVE_COLLECTIONS_STORAGE_KEY = 'aquasafe-live-collections-v20260426-reset'

export const collectionCommunityOptions: CollectionCommunityOption[] = [
  { name: 'Manaus / Baixo Rio Negro', lat: -3.119, lng: -60.0217, risk: 'critical' },
  { name: '34 comunidades', lat: -3.02, lng: -60.47, risk: 'critical' },
  { name: 'Manacapuru', lat: -3.2997, lng: -60.6206, risk: 'high' },
  { name: 'Careiro da Varzea', lat: -3.2003, lng: -59.8119, risk: 'high' },
  { name: 'Autazes', lat: -3.5797, lng: -59.1306, risk: 'high' },
  { name: 'Novo Airao', lat: -2.6208, lng: -60.9433, risk: 'medium' },
  { name: 'Barcelos', lat: -0.9747, lng: -62.9242, risk: 'high' },
  { name: 'Santa Isabel do Rio Negro', lat: -0.4139, lng: -65.0192, risk: 'high' },
  { name: 'Sao Gabriel da Cachoeira', lat: -0.1303, lng: -67.0892, risk: 'critical' },
  { name: 'Coari', lat: -4.085, lng: -63.1414, risk: 'high' },
  { name: 'Tefe', lat: -3.3682, lng: -64.7193, risk: 'high' },
  { name: 'Fonte Boa', lat: -2.5139, lng: -66.0917, risk: 'high' },
  { name: 'Jutai', lat: -2.7481, lng: -66.7728, risk: 'high' },
  { name: 'Maraa', lat: -1.8531, lng: -65.573, risk: 'high' },
  { name: 'Japura', lat: -1.8824, lng: -66.9291, risk: 'critical' },
  { name: 'Tabatinga', lat: -4.2524, lng: -69.9386, risk: 'high' },
  { name: 'Atalaia do Norte', lat: -4.3706, lng: -70.1919, risk: 'critical' },
  { name: 'Eirunepe', lat: -6.6603, lng: -69.8736, risk: 'high' },
  { name: 'Boca do Acre', lat: -8.7423, lng: -67.3919, risk: 'high' },
]

export const collectionSampleTypes = [
  'Agua superficial',
  'Sedimento',
  'Tecido de peixe',
  'Biomarcador humano',
] as const

export type CollectionSampleType = (typeof collectionSampleTypes)[number]

export type CollectionProtocol = {
  id: string
  sampleType: CollectionSampleType
  title: string
  axis: string
  reason: string
  guidance: string
  articleRefs: string[]
  requiredFields: string[]
}

export const collectionProtocols: Record<CollectionSampleType, CollectionProtocol> = {
  'Agua superficial': {
    id: 'protocol-water-seasonality',
    sampleType: 'Agua superficial',
    title: 'Agua superficial, Hg total e sazonalidade',
    axis: 'Eixo 1 - Agua, sedimento e sazonalidade',
    reason:
      'Usada para localizar pressao ambiental, seca/cheia e possivel exposicao por consumo hidrico.',
    guidance:
      'Priorize coordenada real, condicao da agua, periodo de seca ou cheia e qualquer sinal de abastecimento inseguro.',
    articleRefs: ['HG-2023-001', 'HG-REF-007', 'HG-2024-008', 'HG-2024-011'],
    requiredFields: [
      'Hg Total (ng/L)',
      'MeHg (ng/L), quando houver analise',
      'Sazonalidade: seca ou cheia',
      'Lat/Long do ponto',
      'Condicao visual da agua e acesso',
    ],
  },
  Sedimento: {
    id: 'protocol-sediment-reservoir',
    sampleType: 'Sedimento',
    title: 'Sedimento como reservatorio de mercurio',
    axis: 'Eixo 1 - Agua, sedimento e sazonalidade',
    reason:
      'Ajuda a entender deposito de longo prazo e variacao sazonal do mercurio no ambiente.',
    guidance:
      'Registre margem ou fundo, aspecto do sedimento, nivel do rio, coordenada e risco de ressuspensao na seca.',
    articleRefs: ['HG-2023-001', 'HG-2021-006', 'HG-REF-007'],
    requiredFields: [
      'Hg sedimento (ug/g)',
      'Margem, fundo ou praia exposta',
      'Sazonalidade e nivel do rio',
      'Lat/Long do ponto',
      'Foto do ponto de retirada',
    ],
  },
  'Tecido de peixe': {
    id: 'protocol-fish-food-chain',
    sampleType: 'Tecido de peixe',
    title: 'Peixe, cadeia trofica e consumo local',
    axis: 'Eixo 2 - Biota e cadeia trofica',
    reason:
      'Traduz o risco para a alimentacao da comunidade e para especies consumidas com frequencia.',
    guidance:
      'Anote especie, tamanho aproximado, parte coletada, origem do peixe e frequencia de consumo relatada.',
    articleRefs: ['HG-2024-002', 'HG-2023-003', 'HG-2023-004', 'HG-2024-010'],
    requiredFields: [
      'Especie e nome local',
      'Nivel trofico: predador, onivoro ou herbivoro',
      'Tecido coletado, preferencialmente musculo',
      'Frequencia de consumo na comunidade',
      'Comparacao posterior com limite OMS/ANVISA',
    ],
  },
  'Biomarcador humano': {
    id: 'protocol-human-biomarker',
    sampleType: 'Biomarcador humano',
    title: 'Biomarcador humano e sinais clinicos',
    axis: 'Eixo 4 - Biomarcadores e sinais clinicos',
    reason:
      'Fortalece a leitura de exposicao humana cronica e ajuda o medico a priorizar acompanhamento.',
    guidance:
      'Registre grupo prioritario, consentimento, sintomas neurologicos, consumo de peixe e encaminhamento para a unidade.',
    articleRefs: ['HG-2023-009', 'HG-2024-011'],
    requiredFields: [
      'Grupo: gestante, crianca, adulto sintomatico ou outro',
      'Hg capilar ou urinario, quando coletado',
      'Sintomas neurologicos relatados',
      'Frequencia de consumo de peixe',
      'Consentimento e encaminhamento clinico',
    ],
  },
}

export function getCollectionProtocol(sampleType: string): CollectionProtocol {
  // Todo tipo de amostra precisa apontar para um protocolo conhecido,
  // para manter formulário, relatório e referências científicas coerentes.
  if (sampleType in collectionProtocols) {
    return collectionProtocols[sampleType as CollectionSampleType]
  }

  return collectionProtocols['Agua superficial']
}

export function createCollectionClientId(prefix = 'COL') {
  // O id local mantém a coleta rastreável até o banco responder com a sequência oficial.
  const randomUUID = globalThis.crypto?.randomUUID?.()

  if (randomUUID) {
    return `${prefix}-${randomUUID}`
  }

  const randomValues = globalThis.crypto?.getRandomValues?.(new Uint32Array(2))
  const randomPart = randomValues
    ? Array.from(randomValues, (value) => value.toString(16)).join('')
    : Math.random().toString(36).slice(2)

  return `${prefix}-${Date.now()}-${randomPart}`
}

export function readLiveCollections() {
  try {
    const rawRecords = window.localStorage.getItem(LIVE_COLLECTIONS_STORAGE_KEY)
    if (!rawRecords) {
      return []
    }

    const records = JSON.parse(rawRecords)
    if (!Array.isArray(records)) {
      return []
    }

    return records
      .map((record) => normalizeLiveCollectionRecord(record))
      .filter((record): record is LiveCollectionRecord => Boolean(record))
  } catch {
    return []
  }
}

function normalizeLiveCollectionRecord(record: unknown): LiveCollectionRecord | null {
  if (!record || typeof record !== 'object') {
    return null
  }

  const value = record as Partial<LiveCollectionRecord>
  const community = String(value.community ?? '')
  const sampleType = String(value.sampleType ?? 'Agua superficial')
  const protocol = getCollectionProtocol(sampleType)
  const option = collectionCommunityOptions.find((item) => item.name === community)
  const lat = Number.isFinite(value.lat) ? Number(value.lat) : option?.lat
  const lng = Number.isFinite(value.lng) ? Number(value.lng) : option?.lng

  if (!community || lat === undefined || lng === undefined) {
    return null
  }

  return {
    id: String(value.id ?? `COL-${Date.now()}`),
    collectionNumber:
      typeof value.collectionNumber === 'number' && Number.isFinite(value.collectionNumber)
        ? Number(value.collectionNumber)
        : undefined,
    community,
    sampleType,
    protocolId: String(value.protocolId ?? protocol.id),
    protocolTitle: String(value.protocolTitle ?? protocol.title),
    articleRefs: Array.isArray(value.articleRefs)
      ? value.articleRefs.map((ref) => String(ref)).filter(Boolean)
      : protocol.articleRefs,
    requiredFields: Array.isArray(value.requiredFields)
      ? value.requiredFields.map((field) => String(field)).filter(Boolean)
      : protocol.requiredFields,
    collector: String(value.collector ?? 'Equipe de campo'),
    status: String(value.status ?? 'Coletado em campo'),
    collectedAt: String(value.collectedAt ?? ''),
    lat,
    lng,
    risk: value.risk ?? option?.risk ?? 'medium',
    note: typeof value.note === 'string' ? value.note : '',
    photoCount:
      typeof value.photoCount === 'number' && Number.isFinite(value.photoCount)
        ? Number(value.photoCount)
        : undefined,
    photos: Array.isArray(value.photos)
      ? value.photos
          .filter((photo): photo is LiveCollectionPhoto =>
            Boolean(
              photo &&
                typeof photo === 'object' &&
                typeof (photo as LiveCollectionPhoto).id === 'string' &&
                typeof (photo as LiveCollectionPhoto).name === 'string' &&
                typeof (photo as LiveCollectionPhoto).dataUrl === 'string',
            ),
          )
          .slice(0, 3)
      : [],
  }
}

export function saveLiveCollections(records: LiveCollectionRecord[]) {
  const limitedRecords = records.slice(0, 20)

  try {
    window.localStorage.setItem(
      LIVE_COLLECTIONS_STORAGE_KEY,
      JSON.stringify(limitedRecords),
    )
  } catch {
    // Em celulares com armazenamento apertado, tentamos uma versão mais leve
    // em vez de bloquear o fluxo inteiro da coleta.
    const lightweightRecords = limitedRecords.map((record) => ({
      ...record,
      note:
        typeof record.note === 'string' && record.note.length > 280
          ? `${record.note.slice(0, 280)}...`
          : record.note,
      photos: [],
    }))

    try {
      window.localStorage.setItem(
        LIVE_COLLECTIONS_STORAGE_KEY,
        JSON.stringify(lightweightRecords),
      )
    } catch {
      // Se o armazenamento local estiver cheio, seguimos sem bloquear a tela.
    }
  }
}

export function addLiveCollection(record: LiveCollectionRecord) {
  // O registro entra primeiro no aparelho para dar resposta imediata ao agente.
  const nextRecords = [record, ...readLiveCollections()]
  saveLiveCollections(nextRecords)
  window.dispatchEvent(new Event('aquasafe-live-collections-updated'))
  return nextRecords
}

export function upsertLiveCollection(record: LiveCollectionRecord) {
  // Quando a API confirma a coleta, trocamos a versão local pela oficial
  // sem duplicar o histórico.
  const nextRecords = [record, ...readLiveCollections().filter((item) => item.id !== record.id)]
  saveLiveCollections(nextRecords)
  window.dispatchEvent(new Event('aquasafe-live-collections-updated'))
  return nextRecords
}

export function mergeLiveCollections(
  primaryRecords: LiveCollectionRecord[],
  secondaryRecords: LiveCollectionRecord[],
) {
  // A API é a fonte principal, mas preservamos coletas locais ainda não sincronizadas.
  const recordsById = new Map<string, LiveCollectionRecord>()

  for (const record of [...secondaryRecords, ...primaryRecords]) {
    recordsById.set(record.id, record)
  }

  return Array.from(recordsById.values()).slice(0, 30)
}

export function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result)
        return
      }

      reject(new Error('Nao foi possivel ler a imagem selecionada.'))
    }

    reader.onerror = () => {
      reject(new Error('Nao foi possivel ler a imagem selecionada.'))
    }

    reader.readAsDataURL(file)
  })
}

export function resizeImageForUpload(
  file: File,
  {
    maxWidth = 960,
    maxHeight = 960,
    quality = 0.72,
  }: {
    maxWidth?: number
    maxHeight?: number
    quality?: number
  } = {},
) {
  return new Promise<string>((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file)
    const image = new Image()

    function fallbackToOriginal() {
      // Alguns navegadores mobile falham com canvas; ainda assim tentamos
      // manter a foto enviando a versão original em base64.
      readFileAsDataUrl(file)
        .then(resolve)
        .catch(() => reject(new Error('Nao foi possivel preparar a foto selecionada.')))
    }

    image.onload = () => {
      try {
        const width = image.width || maxWidth
        const height = image.height || maxHeight
        const scale = Math.min(1, maxWidth / width, maxHeight / height)
        const targetWidth = Math.max(1, Math.round(width * scale))
        const targetHeight = Math.max(1, Math.round(height * scale))
        const canvas = document.createElement('canvas')

        canvas.width = targetWidth
        canvas.height = targetHeight

        const context = canvas.getContext('2d')

        if (!context) {
          URL.revokeObjectURL(objectUrl)
          fallbackToOriginal()
          return
        }

        context.drawImage(image, 0, 0, targetWidth, targetHeight)
        const dataUrl = canvas.toDataURL('image/jpeg', quality)
        URL.revokeObjectURL(objectUrl)
        resolve(dataUrl)
      } catch {
        URL.revokeObjectURL(objectUrl)
        fallbackToOriginal()
      }
    }

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      fallbackToOriginal()
    }

    image.src = objectUrl
  })
}

export function getCollectionDisplayId(id: string) {
  if (!id) {
    return 'Coleta sem ID'
  }

  const cleanedId = String(id).trim()

  if (cleanedId.length <= 18) {
    return cleanedId
  }

  return `Coleta ${cleanedId.slice(-8).toUpperCase()}`
}

export function getCollectionSequenceLabel(record: Pick<LiveCollectionRecord, 'collectionNumber' | 'id'>) {
  // Preferimos sempre o número crescente do banco; o id local fica como fallback.
  if (typeof record.collectionNumber === 'number' && Number.isFinite(record.collectionNumber)) {
    return `Coleta #${String(record.collectionNumber).padStart(4, '0')}`
  }

  return getCollectionDisplayId(record.id)
}
