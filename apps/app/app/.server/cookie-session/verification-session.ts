import { env } from '@/lib/env'
import { createCookieSessionStorage } from '@remix-run/node'

export const VERIFICATION_KEY = 'verification'

const verificationSessionStorage = createCookieSessionStorage({
  cookie: {
    name: env.APP_ENV === 'local' ? '_verification' : '__Host-verification',
    sameSite: 'lax',
    path: '/',
    httpOnly: true,
    maxAge: 60 * 60, // sec = 60min but token will be expired in 5min
    secrets: env.SESSION_SECRET.split(','),
    secure: true,
  },
})
export const getVerificationSessionEmail = async (req: Request) => {
  const session = await verificationSessionStorage.getSession(req.headers.get('Cookie'))
  return session.get(VERIFICATION_KEY)
}

export const commitVerificationSessionWithValue = async (req: Request, email: string | undefined) => {
  const session = await verificationSessionStorage.getSession(req.headers.get('Cookie'))
  session.set(VERIFICATION_KEY, email)
  return await verificationSessionStorage.commitSession(session)
}

export const destroyStrVerificationSession = async (req: Request) => {
  const session = await verificationSessionStorage.getSession(req.headers.get('Cookie'))
  return await verificationSessionStorage.destroySession(session)
}
