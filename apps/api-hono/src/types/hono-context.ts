import type { Session } from '@/middlewares/cookie-session'
import type { RequestIdVariables } from 'hono/request-id'

interface EnvHonoVariables extends RequestIdVariables {
  userId: string | null
  session: Session
  setSessionValue: <K extends keyof Session>(key: K, value: Session[K]) => void
  commitSession: boolean
}

export interface EnvHono {
  Variables: EnvHonoVariables
}
