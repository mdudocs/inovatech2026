// Adaptador para ambiente serverless.
// Reaproveita a mesma app Express do projeto e garante a infraestrutura antes da resposta.
import { app, ensureInfrastructure } from '../server/index.js'

export default async function handler(request, response) {
  await ensureInfrastructure()
  return app(request, response)
}
