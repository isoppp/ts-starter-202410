import { sign, unsign } from '@/lib/crypt'
import { env } from '@/lib/env'
import { factory } from '@/lib/hono'
import { logger } from '@/lib/logger'
import type { EnvHono } from '@/types/hono-context'
import type { Context } from 'hono'
import { deleteCookie, getCookie, setCookie } from 'hono/cookie'

const cookieName = env.APP_ENV === 'local' ? '_verification' : '__Host-verification'

export const parseVerification = (c: Context<EnvHono>): { hasCookie: boolean; verificationEmail: string | null } => {
  const sessionCookie = getCookie(c, cookieName)
  const hasCookie = !!sessionCookie

  if (!sessionCookie) return { hasCookie, verificationEmail: null }

  try {
    const unsignedSessionId = unsign<string>(sessionCookie, env.APP_SECRET)
    return { hasCookie, verificationEmail: unsignedSessionId }
  } catch (e) {
    logger.error('Failed to unsign verification cookie:', e)
  }
  return { hasCookie, verificationEmail: null }
}

export const cookieEmailVerification = factory.createMiddleware(async (c, next) => {
  const { hasCookie, verificationEmail } = parseVerification(c)
  c.set('verificationEmail', verificationEmail)

  await next()

  const newValue = c.get('verificationEmail')

  if (hasCookie && !newValue) {
    deleteCookie(c, cookieName, {
      secure: env.APP_ENV !== 'local',
    })
    return
  }

  if (newValue !== verificationEmail) {
    const newSessionCookie = sign(newValue, env.APP_SECRET)
    setCookie(c, cookieName, newSessionCookie, {
      httpOnly: true,
      secure: env.APP_ENV !== 'local',
      sameSite: 'Lax',
      maxAge: 60 * 60, // 1 hour
    })
    return
  }
})
