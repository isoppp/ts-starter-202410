import type { Context } from '@/trpc/trpc'
import { vitest } from 'vitest'

export const testEmail = 'test@example.com'

export const createTestCtx = (ctx: Partial<Context> = {}): Context => {
  const setVerificationEmail = vitest.fn() as Context['setVerificationEmail']
  const setSessionId = vitest.fn() as Context['setSessionId']
  return {
    verificationEmail: null,
    userId: null,
    sessionId: null,
    setVerificationEmail,
    setSessionId,
    ...(ctx ?? {}),
  }
}
