import { env } from '@/lib/env'
import { createCookieSessionStorage } from '@remix-run/node'

export const AUTH_KEY = 'verification'
export const AUTH_SESSION_EXPIRATION_SEC = 60 * 60 * 24 * 30 // 180days
const authSessionStorage = createCookieSessionStorage({
  cookie: {
    name: env.APP_ENV === 'local' ? '_session' : '__Host-session',
    sameSite: 'lax',
    path: '/',
    httpOnly: true,
    maxAge: AUTH_SESSION_EXPIRATION_SEC, // sec
    secrets: [process.env.SESSION_SECRET ?? ''],
    secure: true,
  },
})

export const getAuthSessionId = async (req: Request) => {
  const session = await authSessionStorage.getSession(req.headers.get('Cookie'))
  return session.get(AUTH_KEY)
}

export const commitAuthSessionWithValue = async (req: Request, id: string | undefined) => {
  const session = await authSessionStorage.getSession(req.headers.get('Cookie'))
  session.set(AUTH_KEY, id)
  return await authSessionStorage.commitSession(session)
}

export const destroyStrAuthSession = async (req: Request) => {
  const session = await authSessionStorage.getSession(req.headers.get('Cookie'))
  return await authSessionStorage.destroySession(session)
}
