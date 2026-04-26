import {
  AlertTriangle,
  Activity,
  CalendarClock,
  CheckCircle2,
  ClipboardPlus,
  HeartPulse,
  Send,
  Stethoscope,
  TestTubeDiagonal,
} from 'lucide-react'
import { useState, type FormEvent } from 'react'
import type {
  CreateTriageCasePayload,
  DoctorCase,
  NurseDashboard,
  TriageCaseActionPayload,
} from '../../portalTypes'
import { AlertList } from '../../components/portal/AlertList'
import { Panel } from '../../components/portal/Panel'
import { createTriageCase, submitTriageCaseAction } from '../../services/portalApi'
import { collectionCommunityOptions } from '../../utils/liveCollections'

const initialTriageForm: CreateTriageCasePayload = {
  patient: '',
  community: collectionCommunityOptions[0].name,
  risk: 'Moderado',
  priorityGroup: 'Adulto sintomatico',
  symptoms: '',
  exposureSummary: '',
  note: '',
}

const neurologicalSigns = [
  'Dormencia ou formigamento',
  'Tremor',
  'Tontura',
  'Alteracao visual',
  'Dificuldade de equilibrio',
  'Cefaleia recorrente',
]

const initialClinicalScreening = {
  age: '',
  bloodPressure: '',
  heartRate: '',
  temperature: '',
  oxygenSaturation: '',
  fishConsumption: '',
}

export function NurseView({
  data,
  token,
}: {
  data: NurseDashboard
  token: string
}) {
  // A enfermagem trabalha em duas frentes nesta tela:
  // abrir novas triagens e atualizar casos ja existentes.
  const [cases, setCases] = useState<DoctorCase[]>(data.cases)
  const [activeCaseId, setActiveCaseId] = useState(cases[0]?.id ?? '')
  const [triageNote, setTriageNote] = useState('')
  const [returnAt, setReturnAt] = useState('')
  const [triageForm, setTriageForm] =
    useState<CreateTriageCasePayload>(initialTriageForm)
  const [clinicalScreening, setClinicalScreening] = useState(
    initialClinicalScreening,
  )
  const [selectedSigns, setSelectedSigns] = useState<string[]>([])
  const [pendingAction, setPendingAction] =
    useState<TriageCaseActionPayload['action'] | null>(null)
  const [isCreatingCase, setIsCreatingCase] = useState(false)
  const [actionError, setActionError] = useState('')

  const activeCase = cases.find((item) => item.id === activeCaseId) ?? cases[0]

  function toggleSign(sign: string) {
    setSelectedSigns((currentSigns) =>
      currentSigns.includes(sign)
        ? currentSigns.filter((item) => item !== sign)
        : [...currentSigns, sign],
    )
  }

  function buildTriagePayload(): CreateTriageCasePayload {
    // O payload de triagem consolida sinais vitais, sinais neurologicos
    // e exposicao alimentar antes de seguir para a API.
    const vitalLines = [
      clinicalScreening.age ? `Idade: ${clinicalScreening.age}` : '',
      clinicalScreening.bloodPressure ? `PA: ${clinicalScreening.bloodPressure}` : '',
      clinicalScreening.heartRate ? `FC: ${clinicalScreening.heartRate}` : '',
      clinicalScreening.temperature
        ? `Temperatura: ${clinicalScreening.temperature}`
        : '',
      clinicalScreening.oxygenSaturation
        ? `SpO2: ${clinicalScreening.oxygenSaturation}`
        : '',
    ].filter(Boolean)

    return {
      ...triageForm,
      symptoms: [
        triageForm.symptoms,
        selectedSigns.length > 0
          ? `Sinais neurologicos observados: ${selectedSigns.join(', ')}.`
          : '',
      ]
        .filter(Boolean)
        .join('\n'),
      exposureSummary: [
        triageForm.exposureSummary,
        clinicalScreening.fishConsumption
          ? `Frequencia de consumo de peixe: ${clinicalScreening.fishConsumption}.`
          : '',
      ]
        .filter(Boolean)
        .join('\n'),
      note: [
        triageForm.note,
        vitalLines.length > 0 ? `Sinais vitais: ${vitalLines.join(' | ')}.` : '',
      ]
        .filter(Boolean)
        .join('\n'),
    }
  }

  async function handleCreateTriageCase(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsCreatingCase(true)
    setActionError('')

    try {
      const result = await createTriageCase(token, buildTriagePayload())
      setCases((currentCases) => [result.case, ...currentCases])
      setActiveCaseId(result.case.id)
      setTriageForm(initialTriageForm)
      setClinicalScreening(initialClinicalScreening)
      setSelectedSigns([])
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : 'Nao foi possivel criar a triagem.',
      )
    } finally {
      setIsCreatingCase(false)
    }
  }

  async function updateTriage(action: TriageCaseActionPayload['action']) {
    if (!activeCase) {
      return
    }

    // Assim como no medico, as acoes de triagem compartilham o mesmo fluxo
    // e mudam apenas o tipo de encaminhamento.
    setPendingAction(action)
    setActionError('')

    try {
      const result = await submitTriageCaseAction(token, activeCase.id, {
        action,
        note: triageNote.trim(),
        returnAt: action === 'schedule_return' ? returnAt : undefined,
      })

      setCases((currentCases) =>
        currentCases.map((item) =>
          item.id === result.case.id ? result.case : item,
        ),
      )
      setActiveCaseId(result.case.id)
      setTriageNote('')
      if (action === 'schedule_return') {
        setReturnAt('')
      }
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : 'Nao foi possivel registrar a triagem.',
      )
    } finally {
      setPendingAction(null)
    }
  }

  return (
    <>
      <section className="dashboard-grid">
        <Panel title="Alertas para triagem" icon={<AlertTriangle size={18} />}>
          <AlertList alerts={data.alerts} />
        </Panel>
        <Panel title="Roteiro assistencial" icon={<ClipboardPlus size={18} />}>
          <ul className="clean-list">
            {data.triageGuides.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </Panel>
      </section>

      <Panel title="Nova triagem clinica" icon={<ClipboardPlus size={18} />}>
        <form className="triage-form" onSubmit={handleCreateTriageCase}>
          <label className="field">
            <span>Nome do paciente</span>
            <input
              onChange={(event) =>
                setTriageForm((current) => ({ ...current, patient: event.target.value }))
              }
              placeholder="Nome completo ou iniciais do paciente"
              value={triageForm.patient}
            />
          </label>

          <label className="field">
            <span>Comunidade</span>
            <select
              className="admin-select"
              onChange={(event) =>
                setTriageForm((current) => ({ ...current, community: event.target.value }))
              }
              value={triageForm.community}
            >
              {collectionCommunityOptions.map((item) => (
                <option key={item.name} value={item.name}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Grupo prioritario</span>
            <select
              className="admin-select"
              onChange={(event) =>
                setTriageForm((current) => ({
                  ...current,
                  priorityGroup: event.target.value,
                }))
              }
              value={triageForm.priorityGroup}
            >
              <option>Gestante</option>
              <option>Crianca</option>
              <option>Idoso</option>
              <option>Adulto sintomatico</option>
              <option>Sem prioridade especial</option>
            </select>
          </label>

          <label className="field">
            <span>Risco inicial</span>
            <select
              className="admin-select"
              onChange={(event) =>
                setTriageForm((current) => ({ ...current, risk: event.target.value }))
              }
              value={triageForm.risk}
            >
              <option>Moderado</option>
              <option>Alto</option>
              <option>Muito alto</option>
            </select>
          </label>

          <fieldset className="clinical-fieldset triage-form-wide">
            <legend>
              <HeartPulse size={16} />
              Sinais vitais e exposicao
            </legend>
            <div className="clinical-mini-grid">
              <label className="field">
                <span>Idade</span>
                <input
                  onChange={(event) =>
                    setClinicalScreening((current) => ({
                      ...current,
                      age: event.target.value,
                    }))
                  }
                  placeholder="Ex.: 34 anos"
                  value={clinicalScreening.age}
                />
              </label>
              <label className="field">
                <span>Pressao arterial</span>
                <input
                  onChange={(event) =>
                    setClinicalScreening((current) => ({
                      ...current,
                      bloodPressure: event.target.value,
                    }))
                  }
                  placeholder="Ex.: 120x80"
                  value={clinicalScreening.bloodPressure}
                />
              </label>
              <label className="field">
                <span>Freq. cardiaca</span>
                <input
                  onChange={(event) =>
                    setClinicalScreening((current) => ({
                      ...current,
                      heartRate: event.target.value,
                    }))
                  }
                  placeholder="Ex.: 82 bpm"
                  value={clinicalScreening.heartRate}
                />
              </label>
              <label className="field">
                <span>Temperatura</span>
                <input
                  onChange={(event) =>
                    setClinicalScreening((current) => ({
                      ...current,
                      temperature: event.target.value,
                    }))
                  }
                  placeholder="Ex.: 36,8 C"
                  value={clinicalScreening.temperature}
                />
              </label>
              <label className="field">
                <span>Saturacao</span>
                <input
                  onChange={(event) =>
                    setClinicalScreening((current) => ({
                      ...current,
                      oxygenSaturation: event.target.value,
                    }))
                  }
                  placeholder="Ex.: 98%"
                  value={clinicalScreening.oxygenSaturation}
                />
              </label>
              <label className="field">
                <span>Consumo de peixe</span>
                <input
                  onChange={(event) =>
                    setClinicalScreening((current) => ({
                      ...current,
                      fishConsumption: event.target.value,
                    }))
                  }
                  placeholder="Ex.: diario, 3x semana"
                  value={clinicalScreening.fishConsumption}
                />
              </label>
            </div>
          </fieldset>

          <fieldset className="clinical-fieldset triage-form-wide">
            <legend>
              <Activity size={16} />
              Sinais de atencao neurologica
            </legend>
            <div className="clinical-check-grid">
              {neurologicalSigns.map((sign) => (
                <label className="clinical-check" key={sign}>
                  <input
                    checked={selectedSigns.includes(sign)}
                    onChange={() => toggleSign(sign)}
                    type="checkbox"
                  />
                  <span>{sign}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <label className="field triage-form-wide">
            <span>Sintomas relatados</span>
            <textarea
              onChange={(event) =>
                setTriageForm((current) => ({ ...current, symptoms: event.target.value }))
              }
              placeholder="Descreva intensidade, inicio, frequencia e evolucao dos sintomas."
              value={triageForm.symptoms}
            />
          </label>

          <label className="field triage-form-wide">
            <span>Exposicao alimentar ou territorial</span>
            <textarea
              onChange={(event) =>
                setTriageForm((current) => ({
                  ...current,
                  exposureSummary: event.target.value,
                }))
              }
              placeholder="Origem da agua, pesca local, periodo de seca/cheia, comunidade isolada ou exposicao familiar."
              value={triageForm.exposureSummary}
            />
          </label>

          <label className="field triage-form-wide">
            <span>Nota da enfermagem</span>
            <textarea
              onChange={(event) =>
                setTriageForm((current) => ({ ...current, note: event.target.value }))
              }
              placeholder="Observacoes de enfermagem, orientacao dada, prioridade e motivo do encaminhamento."
              value={triageForm.note}
            />
          </label>

          {actionError ? <p className="form-error triage-form-wide">{actionError}</p> : null}

          <button
            className="button button-primary triage-form-wide"
            disabled={isCreatingCase}
            type="submit"
          >
            <Send size={16} />
            {isCreatingCase ? 'Enviando para fila...' : 'Enviar para fila do medico'}
          </button>
        </form>
      </Panel>

      <Panel title="Fila de pacientes" icon={<Stethoscope size={18} />}>
        <div className="case-table">
          {cases.map((item) => (
            <article
              className={`case-row case-row-action ${
                activeCase?.id === item.id ? 'case-row-active' : ''
              }`}
              key={item.id}
              onClick={() => setActiveCaseId(item.id)}
            >
              <div>
                <strong>{item.patient}</strong>
                <small>{item.community}</small>
              </div>
              <div>
                <strong>{item.priorityGroup}</strong>
                <small>Grupo</small>
              </div>
              <div>
                <strong>{item.risk}</strong>
                <small>Risco</small>
              </div>
              <div>
                <strong>{item.status}</strong>
                <small>Status</small>
              </div>
              <div>
                <strong>{item.lastAction}</strong>
                <small>Ultima acao</small>
              </div>
            </article>
          ))}
          {cases.length === 0 ? (
            <article className="list-card">
              <strong>Fila vazia</strong>
              <p>Cadastre uma nova triagem para enviar o paciente ao medico.</p>
            </article>
          ) : null}
        </div>
      </Panel>

      {activeCase ? (
        <Panel title="Triagem do paciente selecionado" icon={<ClipboardPlus size={18} />}>
          <div className="clinical-workspace">
            <div className="clinical-summary">
              <span className="section-badge">Triagem ativa</span>
              <strong>{activeCase.patient}</strong>
              <p>
                {activeCase.community} | {activeCase.priorityGroup} | Risco {activeCase.risk}
              </p>
              <dl className="clinical-risk-list">
                <div>
                  <dt>Sintomas</dt>
                  <dd>{activeCase.symptoms}</dd>
                </div>
                <div>
                  <dt>Exposicao</dt>
                  <dd>{activeCase.exposureSummary}</dd>
                </div>
                <div>
                  <dt>Proximo passo</dt>
                  <dd>{activeCase.nextStep}</dd>
                </div>
                <div>
                  <dt>Retorno</dt>
                  <dd>{activeCase.returnAt || 'Sem retorno agendado'}</dd>
                </div>
              </dl>
            </div>

            <div className="triage-action-grid">
              <label className="field">
                <span>Nota da triagem</span>
                <textarea
                  className="clinical-note"
                  onChange={(event) => setTriageNote(event.target.value)}
                  placeholder="Registre sinais vitais, sintomas, consumo de peixe, gestacao, prioridade e observacoes."
                  value={triageNote}
                />
              </label>

              <label className="field">
                <span>Data e hora do retorno</span>
                <input
                  onChange={(event) => setReturnAt(event.target.value)}
                  type="datetime-local"
                  value={returnAt}
                />
              </label>
            </div>

            {actionError ? <p className="form-error">{actionError}</p> : null}

            <div className="clinical-actions">
              <button
                className="button button-secondary"
                disabled={pendingAction !== null}
                onClick={() => void updateTriage('classify_priority')}
                type="button"
              >
                <CheckCircle2 size={16} />
                {pendingAction === 'classify_priority'
                  ? 'Classificando...'
                  : 'Classificar prioridade'}
              </button>
              <button
                className="button button-secondary"
                disabled={pendingAction !== null}
                onClick={() => void updateTriage('schedule_return')}
                type="button"
              >
                <CalendarClock size={16} />
                {pendingAction === 'schedule_return'
                  ? 'Marcando...'
                  : 'Marcar retorno'}
              </button>
              <button
                className="button button-secondary"
                disabled={pendingAction !== null}
                onClick={() => void updateTriage('request_biomarker')}
                type="button"
              >
                <TestTubeDiagonal size={16} />
                {pendingAction === 'request_biomarker'
                  ? 'Solicitando...'
                  : 'Solicitar biomarcador'}
              </button>
              <button
                className="button button-primary"
                disabled={pendingAction !== null}
                onClick={() => void updateTriage('send_to_doctor')}
                type="button"
              >
                <Send size={16} />
                {pendingAction === 'send_to_doctor'
                  ? 'Encaminhando...'
                  : 'Encaminhar ao medico'}
              </button>
            </div>
          </div>
        </Panel>
      ) : null}

      <Panel title="Notas da fila" icon={<ClipboardPlus size={18} />}>
        <ul className="clean-list">
          {data.queueNotes.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </Panel>
    </>
  )
}
