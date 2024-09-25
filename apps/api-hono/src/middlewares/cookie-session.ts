import { sign, unsign } from '@/lib/crypt'
import { env } from '@/lib/env'
import { factory } from '@/lib/hono'
import { logger } from '@/lib/logger'
import type { EnvHono } from '@/types/hono-context'
import type { Context } from 'hono'
import { deleteCookie, getCookie, setCookie } from 'hono/cookie'

const cookieName = env.APP_ENV === 'local' ? '_session' : '__Host-session'
export const SESSION_EXPIRATION_SEC = 60 * 60 * 24 * 90 // 90 days

export const parseSessionId = (c: Context<EnvHono>): { hasCookie: boolean; sessionId: string | null } => {
  const sessionCookie = getCookie(c, cookieName)
  const hasCookie = !!sessionCookie

  if (!sessionCookie) return { hasCookie, sessionId: null }

  try {
    const unsignedSessionId = unsign<string>(sessionCookie, env.SESSION_SECRET)
    return { hasCookie, sessionId: unsignedSessionId }
  } catch (e) {
    logger.error('Failed to unsign session cookie:', e)
  }
  return { hasCookie, sessionId: null }
}

export const cookieSession = factory.createMiddleware(async (c, next) => {
  const { hasCookie, sessionId } = parseSessionId(c)
  c.set('sessionId', sessionId)

  await next()

  const newValue = c.get('sessionId')

  if (hasCookie && !newValue) {
    deleteCookie(c, cookieName)
    return
  }

  if (newValue !== sessionId) {
    const newSessionCookie = sign(newValue, env.SESSION_SECRET)
    setCookie(c, cookieName, newSessionCookie, {
      httpOnly: true,
      secure: env.APP_ENV !== 'local',
      sameSite: 'Lax',
      maxAge: 60 * 60 * 24 * 90, // 90 days
    })
    return
  }
})
