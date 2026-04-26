import {
  AlertTriangle,
  BellRing,
  CalendarClock,
  CheckCircle2,
  ClipboardCheck,
  FileHeart,
  Route as RouteIcon,
  Send,
  ShieldCheck,
  Stethoscope,
} from 'lucide-react'
import { useState } from 'react'
import type {
  DoctorCase,
  DoctorCaseActionPayload,
  DoctorDashboard,
} from '../../portalTypes'
import { collectionCommunityOptions } from '../../utils/liveCollections'
import { AlertList } from '../../components/portal/AlertList'
import { Panel } from '../../components/portal/Panel'
import { LazyRiverMapPanel } from '../../components/LazyRiverMapPanel'
import { submitDoctorCaseAction } from '../../services/portalApi'

const ALL_TERRITORIES = 'all'

const initialCarePlan = {
  assessment: '',
  orientation: '',
  followUp: '',
}

const clinicalChecklist = [
  'Confirmar sinais neurologicos e tempo de evolucao.',
  'Relacionar consumo de peixe, agua e territorio de origem.',
  'Priorizar gestantes, criancas e sintomas progressivos.',
  'Definir biomarcador, retorno ou encaminhamento assistencial.',
]

export function DoctorView({
  data,
  token,
  initialTerritory,
}: {
  data: DoctorDashboard
  token: string
  initialTerritory: string
}) {
  // A view medica junta filtro territorial, fila de casos
  // e registro de conduta no mesmo espaco de trabalho.
  const [cases, setCases] = useState<DoctorCase[]>(data.cases)
  const [activeCaseId, setActiveCaseId] = useState(cases[0]?.id ?? '')
  const [selectedTerritory, setSelectedTerritory] = useState(ALL_TERRITORIES)
  const [clinicalNote, setClinicalNote] = useState('')
  const [carePlan, setCarePlan] = useState(initialCarePlan)
  const [pendingAction, setPendingAction] =
    useState<DoctorCaseActionPayload['action'] | null>(null)
  const [actionError, setActionError] = useState('')
  const [actionSuccess, setActionSuccess] = useState('')

  const territoryOptions = Array.from(
    new Set([
      ...collectionCommunityOptions.map((item) => item.name),
      ...cases.map((item) => item.community),
    ]),
  )
  const filteredCases =
    selectedTerritory === ALL_TERRITORIES
      ? cases
      : cases.filter((item) => item.community === selectedTerritory)
  const activeCase = filteredCases.find((item) => item.id === activeCaseId) ?? null
  const focusedCommunity =
    selectedTerritory === ALL_TERRITORIES ? undefined : selectedTerritory

  function buildDoctorNote() {
    // A nota final consolida campos estruturados e observacao livre
    // para persistir uma conduta mais legivel no backend.
    return [
      clinicalNote.trim(),
      carePlan.assessment ? `Avaliacao clinica: ${carePlan.assessment}` : '',
      carePlan.orientation ? `Orientacao ao paciente: ${carePlan.orientation}` : '',
      carePlan.followUp ? `Plano de seguimento: ${carePlan.followUp}` : '',
    ]
      .filter(Boolean)
      .join('\n')
  }

  async function updateCase(action: DoctorCaseActionPayload['action']) {
    if (!activeCase) {
      return
    }

    // Cada acao clinica reutiliza o mesmo endpoint, mudando apenas
    // o tipo de acao e a nota consolidada.
    setPendingAction(action)
    setActionError('')
    setActionSuccess('')

    try {
      const result = await submitDoctorCaseAction(token, activeCase.id, {
        action,
        note: buildDoctorNote(),
      })

      if (action === 'save_conduct') {
        setCases((currentCases) =>
          currentCases.filter((item) => item.id !== result.case.id),
        )
        setActiveCaseId('')
        setActionSuccess(
          `Conduta salva. ${result.case.patient} saiu da fila ativa do medico.`,
        )
      } else {
        setCases((currentCases) =>
          currentCases.map((item) =>
            item.id === result.case.id ? result.case : item,
          ),
        )
        setActiveCaseId(result.case.id)
        setActionSuccess('Atualizacao registrada no caso do paciente.')
      }

      setClinicalNote('')
      setCarePlan(initialCarePlan)
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : 'Nao foi possivel registrar a conduta.',
      )
    } finally {
      setPendingAction(null)
    }
  }

  return (
    <>
      <section className="dashboard-grid">
        <Panel title="Alertas do territorio" icon={<AlertTriangle size={18} />}>
          <AlertList alerts={data.alerts} />
        </Panel>
        <Panel title="Checklist clinico" icon={<ShieldCheck size={18} />}>
          <ul className="clean-list">
            {clinicalChecklist.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </Panel>
      </section>

      <Panel title="Territorio de atendimento" icon={<RouteIcon size={18} />}>
        <div className="doctor-territory-panel">
          <div>
            <span className="minor-tag">Territorio inicial</span>
            <strong>{initialTerritory || 'Nao informado'}</strong>
            <p>
              O medico pode mudar o territorio do plantao sem alterar o cadastro do
              usuario. Isso filtra os casos e aproxima o mapa da comunidade escolhida.
            </p>
          </div>

          <label className="field">
            <span>Atendendo agora</span>
            <select
              className="admin-select"
              value={selectedTerritory}
              onChange={(event) => {
                setSelectedTerritory(event.target.value)
                setActiveCaseId('')
                setActionSuccess('')
              }}
            >
              <option value={ALL_TERRITORIES}>Todos os territorios acompanhados</option>
              {territoryOptions.map((territory) => (
                <option key={territory} value={territory}>
                  {territory}
                </option>
              ))}
            </select>
          </label>
        </div>
      </Panel>

      <LazyRiverMapPanel
        focusCommunity={focusedCommunity}
        mode="technical"
        token={token}
      />

      <Panel title="Casos para ver hoje" icon={<Stethoscope size={18} />}>
        {actionSuccess ? (
          <div className="clinical-success-banner">
            <CheckCircle2 size={18} />
            <span>{actionSuccess}</span>
          </div>
        ) : null}

        <div className="case-table">
          {filteredCases.map((item) => (
            <article
              className={`case-row case-row-action ${
                activeCase?.id === item.id ? 'case-row-active' : ''
              }`}
              key={item.id}
              onClick={() => {
                setActiveCaseId(item.id)
                setActionSuccess('')
              }}
            >
              <div>
                <strong>{item.patient}</strong>
                <small>{item.community}</small>
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
                <strong>{item.nextStep}</strong>
                <small>Proximo passo</small>
              </div>
              <div>
                <strong>{item.lastAction}</strong>
                <small>Ultima acao</small>
              </div>
              <div>
                <strong>{item.updatedAt}</strong>
                <small>Atualizado</small>
              </div>
            </article>
          ))}
          {filteredCases.length === 0 ? (
            <article className="list-card">
              <strong>Nenhum caso neste territorio</strong>
              <p>Troque o territorio acima ou mantenha todos os territorios acompanhados.</p>
            </article>
          ) : null}
        </div>
      </Panel>

      {activeCase ? (
        <Panel title="Conduta do caso selecionado" icon={<ShieldCheck size={18} />}>
          <div className="clinical-workspace">
            <div className="doctor-patient-focus">
              <div className="doctor-patient-identity">
                <span className="section-badge">Paciente em atendimento</span>
                <strong>{activeCase.patient}</strong>
                <p>{activeCase.community}</p>
              </div>

              <div className="doctor-patient-flags">
                <span
                  className={`clinical-risk-pill clinical-risk-${activeCase.risk
                    .toLowerCase()
                    .replace(/\s+/g, '-')}`}
                >
                  Risco {activeCase.risk}
                </span>
                <span>{activeCase.priorityGroup}</span>
                <span>{activeCase.status}</span>
              </div>
            </div>

            <div className="clinical-summary">
              <dl className="clinical-risk-list clinical-risk-list-wide">
                <div>
                  <dt>Sintomas relatados</dt>
                  <dd>{activeCase.symptoms}</dd>
                </div>
                <div>
                  <dt>Exposicao alimentar ou territorial</dt>
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

              {activeCase.clinicalNote ? (
                <div className="clinical-note-readonly">
                  <ClipboardCheck size={16} />
                  <span>{activeCase.clinicalNote}</span>
                </div>
              ) : null}
            </div>

            <fieldset className="clinical-fieldset">
              <legend>
                <FileHeart size={16} />
                Plano clinico do atendimento
              </legend>
              <div className="doctor-care-plan">
                <label className="field">
                  <span>Avaliacao clinica</span>
                  <textarea
                    className="clinical-note"
                    onChange={(event) =>
                      setCarePlan((current) => ({
                        ...current,
                        assessment: event.target.value,
                      }))
                    }
                    placeholder="Hipotese, gravidade, sinais de alerta e impressao clinica."
                    value={carePlan.assessment}
                  />
                </label>
                <label className="field">
                  <span>Orientacao ao paciente</span>
                  <textarea
                    className="clinical-note"
                    onChange={(event) =>
                      setCarePlan((current) => ({
                        ...current,
                        orientation: event.target.value,
                      }))
                    }
                    placeholder="Orientacao alimentar, reducao de exposicao, sinais para retorno imediato."
                    value={carePlan.orientation}
                  />
                </label>
                <label className="field doctor-care-plan-wide">
                  <span>Plano de seguimento</span>
                  <textarea
                    className="clinical-note"
                    onChange={(event) =>
                      setCarePlan((current) => ({
                        ...current,
                        followUp: event.target.value,
                      }))
                    }
                    placeholder="Retorno, biomarcador, encaminhamento, acompanhamento familiar ou vigilancia territorial."
                    value={carePlan.followUp}
                  />
                </label>
              </div>
            </fieldset>

            <label className="field">
              <span>Nota complementar</span>
              <textarea
                className="clinical-note"
                value={clinicalNote}
                onChange={(event) => setClinicalNote(event.target.value)}
                placeholder="Observacoes livres da consulta."
              />
            </label>

            {actionError ? <p className="form-error">{actionError}</p> : null}

            <div className="clinical-actions">
              <button
                className="button button-secondary"
                disabled={pendingAction !== null}
                type="button"
                onClick={() => void updateCase('request_biomarker')}
              >
                <Send size={16} />
                {pendingAction === 'request_biomarker'
                  ? 'Solicitando...'
                  : 'Solicitar biomarcador'}
              </button>
              <button
                className="button button-secondary"
                disabled={pendingAction !== null}
                type="button"
                onClick={() => void updateCase('schedule_return')}
              >
                <CalendarClock size={16} />
                {pendingAction === 'schedule_return' ? 'Marcando...' : 'Marcar retorno'}
              </button>
              <button
                className="button button-primary"
                disabled={pendingAction !== null}
                type="button"
                onClick={() => void updateCase('save_conduct')}
              >
                <CheckCircle2 size={16} />
                {pendingAction === 'save_conduct'
                  ? 'Salvando...'
                  : 'Salvar conduta e retirar da fila'}
              </button>
            </div>
          </div>
        </Panel>
      ) : (
        <Panel title="Conduta do caso selecionado" icon={<ShieldCheck size={18} />}>
          <div className="clinical-empty-state">
            <Stethoscope size={20} />
            <strong>Nenhum paciente aberto agora</strong>
            <p>
              Selecione um paciente na fila para revisar sintomas, exposicao e registrar
              a conduta medica.
            </p>
          </div>
        </Panel>
      )}

      <section className="dashboard-grid">
        <Panel title="Agenda da equipe" icon={<RouteIcon size={18} />}>
          <ul className="clean-list">
            {data.agenda.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </Panel>
        <Panel title="Recados do territorio" icon={<BellRing size={18} />}>
          <ul className="clean-list">
            {data.territoryNotes.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </Panel>
      </section>
    </>
  )
}
