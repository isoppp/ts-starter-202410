import { sign, unsign } from '@/lib/crypt'
import { env } from '@/lib/env'
import { factory } from '@/lib/hono'
import { logger } from '@/lib/logger'
import { getCookie, setCookie } from 'hono/cookie'

export interface Session {
  sessionId: string | null
  verificationEmail: string | null
}

const cookieName = env.APP_ENV === 'local' ? '_session' : '__Host-session'

export const cookieSession = factory.createMiddleware(async (c, next) => {
  const sessionCookie = getCookie(c, cookieName)
  let session: Session = {
    sessionId: null,
    verificationEmail: null,
  }

  if (sessionCookie) {
    try {
      const unsignedSession = unsign<Session>(sessionCookie, env.SESSION_SECRET)
      if (unsignedSession) {
        session = {
          ...session,
          ...unsignedSession,
        }
      }
    } catch (e) {
      logger.error(e)
    }
  }

  logger.debug(JSON.stringify(session))
  c.set('session', session)

  await next()

  // Update session cookie after the request is handled
  const newSessionCookie = sign(c.get('session'), env.SESSION_SECRET)
  setCookie(c, cookieName, newSessionCookie, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // Use secure in production
    sameSite: 'Lax',
    maxAge: 60 * 60 * 24 * 14, // 30 days
  })
})
