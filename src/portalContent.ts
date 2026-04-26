import type { UserRole } from './portalTypes'

// Conteudo leve e compartilhado por telas de entrada.
// Fica separado para evitar texto fixo espalhado em componentes.
export const landingCards: Array<{
  role: UserRole
  points: string[]
}> = [
  {
    role: 'population',
    points: [
      'Comunicados da comunidade',
      'Visitas e retornos',
      'Registros do dia',
    ],
  },
  {
    role: 'nurse',
    points: [
      'Fila de triagem',
      'Classificacao de prioridade',
      'Encaminhamento ao medico',
    ],
  },
  {
    role: 'doctor',
    points: [
      'Casos mais urgentes do dia',
      'Conduta rapida',
      'Recados do territorio',
    ],
  },
  {
    role: 'collector',
    points: [
      'Checklist antes de sair',
      'Rota do dia',
      'Coletas prioritarias',
    ],
  },
]

export const homeSteps = [
  // Sequencia curta para orientar rapidamente o uso do portal.
  'Escolha o perfil correto.',
  'Entre com o login de teste.',
  'Acesse o painel do seu perfil.',
]
