import { app, ensureInfrastructure } from '../server/index.js'

export default async function handler(request, response) {
  await ensureInfrastructure()
  return app(request, response)
}
