import { HeartPulse, ShieldUser, Stethoscope, TestTubeDiagonal, Users } from 'lucide-react'

export const roleIcons = {
  population: Users,
  nurse: HeartPulse,
  doctor: Stethoscope,
  collector: TestTubeDiagonal,
  admin: ShieldUser,
} as const
