// Mapeamento visual entre perfil de usuario e icone usado no portal.
import { HeartPulse, ShieldUser, Stethoscope, TestTubeDiagonal, Users } from 'lucide-react'

export const roleIcons = {
  population: Users,
  nurse: HeartPulse,
  doctor: Stethoscope,
  collector: TestTubeDiagonal,
  admin: ShieldUser,
} as const
