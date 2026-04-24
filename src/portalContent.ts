import type { UserRole } from './portalTypes'

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
  'Escolha o perfil correto.',
  'Entre com o login de teste.',
  'Acesse o painel do seu perfil.',
]
