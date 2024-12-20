import { sign, unsign } from '@/lib/crypt'
import { env } from '@/lib/env'
import { factory } from '@/lib/hono'
import { logger } from '@/lib/logger'
import type { EnvHono } from '@/types/hono-context'
import type { Context } from 'hono'
import { deleteCookie, getCookie, setCookie } from 'hono/cookie'

const cookieName = env.APP_ENV === 'local' ? '_session' : '__Host-session'
export const SESSION_EXPIRATION_SEC = 60 * 60 * 24 * 90 // 90 days

export const parseSessionId = (c: Context<EnvHono>): { sessionId: string | null } => {
  const sessionCookie = getCookie(c, cookieName)

  if (!sessionCookie) return { sessionId: null }

  try {
    const unsignedSessionId = unsign<string>(sessionCookie, env.APP_SECRET)
    return { sessionId: unsignedSessionId }
  } catch (e) {
    logger.error('Failed to unsign session cookie:', e)
  }
  return { sessionId: null }
}

export const cookieSession = factory.createMiddleware(async (c, next) => {
  const { sessionId } = parseSessionId(c)
  c.set('sessionId', sessionId)

  await next()

  const newValue = c.get('sessionId')

  if (sessionId && !newValue) {
    deleteCookie(c, cookieName, {
      secure: env.APP_ENV !== 'local',
    })
    return
  }

  if (newValue !== sessionId) {
    const newSessionCookie = sign(newValue, env.APP_SECRET)
    setCookie(c, cookieName, newSessionCookie, {
      httpOnly: true,
      secure: env.APP_ENV !== 'local',
      sameSite: 'Lax',
      maxAge: 60 * 60 * 24 * 90, // 90 days
    })
    return
  }
})
