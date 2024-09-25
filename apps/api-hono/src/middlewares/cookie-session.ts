import { sign, unsign } from '@/lib/crypt'
import { env } from '@/lib/env'
import { factory } from '@/lib/hono'
import { logger } from '@/lib/logger'
import type { EnvHono } from '@/types/hono-context'
import type { Context } from 'hono'
import { getCookie, setCookie } from 'hono/cookie'

const cookieName = env.APP_ENV === 'local' ? '_session' : '__Host-session'

export interface Session {
  sessionId: string | null
  verificationEmail: string | null
}

const defaultSession: Session = { sessionId: null, verificationEmail: null }
export const getSession = (c: Context<EnvHono>): Session => {
  const sessionCookie = getCookie(c, cookieName)

  if (!sessionCookie) return defaultSession

  try {
    const unsignedSession = unsign<Session>(sessionCookie, env.SESSION_SECRET)
    return unsignedSession ? { ...defaultSession, ...unsignedSession } : defaultSession
  } catch (e) {
    logger.error('Failed to unsign session:', e)
    return defaultSession
  }
}

export const cookieSession = factory.createMiddleware(async (c, next) => {
  let session = getSession(c)
  c.set('session', session)
  c.set('commitSession', false)

  c.set('setSessionValue', <K extends keyof Session>(key: K, value: Session[K]) => {
    session = { ...session, [key]: value }
    c.set('session', session)
    c.set('commitSession', true)
  })

  await next()

  if (c.get('commitSession')) {
    const newSessionCookie = sign(session, env.SESSION_SECRET)
    setCookie(c, cookieName, newSessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
      maxAge: 60 * 60 * 24 * 14, // 14 days
    })
  }
})
