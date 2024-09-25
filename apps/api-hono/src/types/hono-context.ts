import type { Session } from '@/middlewares/cookie-session'
import type { RequestIdVariables } from 'hono/request-id'

interface EnvHonoVariables extends RequestIdVariables {
  userId: string | null
  session: Session
}

export interface EnvHono {
  Variables: EnvHonoVariables
}
