import type { RequestIdVariables } from 'hono/request-id'

interface EnvHonoVariables extends RequestIdVariables {
  userId: string | null
  sessionId: string | null
  verificationEmail: string | null
}

export interface EnvHono {
  Variables: EnvHonoVariables
}
