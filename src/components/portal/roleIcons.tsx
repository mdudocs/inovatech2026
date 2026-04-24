import { ShieldUser, Stethoscope, TestTubeDiagonal, Users } from 'lucide-react'

export const roleIcons = {
  population: Users,
  doctor: Stethoscope,
  collector: TestTubeDiagonal,
  admin: ShieldUser,
} as const
