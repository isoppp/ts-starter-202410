import type { RequestIdVariables } from 'hono/request-id'

interface EnvHonoVariables extends RequestIdVariables {
  userId: string | null
}

export interface EnvHono {
  Variables: EnvHonoVariables
}
