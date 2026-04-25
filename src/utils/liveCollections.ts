import type { RiskTone } from '../siteData'

export type LiveCollectionRecord = {
  id: string
  community: string
  sampleType: string
  collector: string
  status: string
  collectedAt: string
  lat: number
  lng: number
  risk: RiskTone
  note?: string
  photos?: LiveCollectionPhoto[]
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

export const LIVE_COLLECTIONS_STORAGE_KEY = 'aquasafe-live-collections'

export const collectionCommunityOptions: CollectionCommunityOption[] = [
  { name: 'Manaus / Baixo Rio Negro', lat: -3.119, lng: -60.0217, risk: 'critical' },
  { name: '34 comunidades', lat: -3.02, lng: -60.47, risk: 'critical' },
  { name: 'Novo Airao', lat: -2.6208, lng: -60.9433, risk: 'medium' },
  { name: 'Barcelos', lat: -0.9747, lng: -62.9242, risk: 'high' },
  { name: 'Santa Isabel do Rio Negro', lat: -0.4139, lng: -65.0192, risk: 'high' },
  { name: 'Sao Gabriel da Cachoeira', lat: -0.1303, lng: -67.0892, risk: 'critical' },
]

export const collectionSampleTypes = [
  'Agua superficial',
  'Sedimento',
  'Tecido de peixe',
  'Biomarcador humano',
] as const

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
  const option = collectionCommunityOptions.find((item) => item.name === community)
  const lat = Number.isFinite(value.lat) ? Number(value.lat) : option?.lat
  const lng = Number.isFinite(value.lng) ? Number(value.lng) : option?.lng

  if (!community || lat === undefined || lng === undefined) {
    return null
  }

  return {
    id: String(value.id ?? `COL-${Date.now()}`),
    community,
    sampleType: String(value.sampleType ?? 'Amostra ambiental'),
    collector: String(value.collector ?? 'Equipe de campo'),
    status: String(value.status ?? 'Coletado em campo'),
    collectedAt: String(value.collectedAt ?? ''),
    lat,
    lng,
    risk: value.risk ?? option?.risk ?? 'medium',
    note: typeof value.note === 'string' ? value.note : '',
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
  window.localStorage.setItem(
    LIVE_COLLECTIONS_STORAGE_KEY,
    JSON.stringify(records.slice(0, 20)),
  )
}

export function addLiveCollection(record: LiveCollectionRecord) {
  const nextRecords = [record, ...readLiveCollections()]
  saveLiveCollections(nextRecords)
  window.dispatchEvent(new Event('aquasafe-live-collections-updated'))
  return nextRecords
}

export function mergeLiveCollections(
  primaryRecords: LiveCollectionRecord[],
  secondaryRecords: LiveCollectionRecord[],
) {
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
