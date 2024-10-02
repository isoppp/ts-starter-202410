import { logger } from '@/lib/logger'
import { withTransaction } from '@/lib/prisma'
import { createNewSession } from '@/module/session'
import { getUserByEmail } from '@/module/user'
import { addVerificationAttempt, getValidVerification, isAttemptExceeded, useVerification } from '@/module/verification'
import type { Context } from '@/trpc/trpc'
import { TRPCError } from '@trpc/server'
import * as v from 'valibot'

export const signInVerificationSchema = v.object({
  token: v.pipe(v.string(), v.minLength(1)),
})

type UseCaseArgs = {
  input: v.InferInput<typeof signInVerificationSchema>
  ctx: Context
  testFn?: ReturnType<typeof vitest.fn>
}
type UseCaseResult =
  | {
      ok: true
    }
  | {
      ok: false
      attemptExceeded: boolean
    }
export const signInVerificationUsecase = async ({ ctx, input, testFn }: UseCaseArgs): Promise<UseCaseResult> => {
  const email = ctx.verificationEmail
  if (!email) {
    logger.debug('email not found')
    testFn?.('email not found')
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Invalid Request',
    })
  }

  const txResult = await withTransaction(async () => {
    const existingUser = await getUserByEmail(email)

    if (!existingUser) {
      logger.debug('user not found')
      testFn?.('user not found')
      return { ok: false }
    }

    const verification = await getValidVerification(email, input.token, 'EMAIL_SIGN_IN')
    if (!verification) {
      logger.debug('valid verification not found')
      testFn?.('valid verification not found')
      return { ok: false }
    }

    const updatedVerification = await addVerificationAttempt(verification.id)
    const _isAttemptExceeded = isAttemptExceeded(updatedVerification.attempt)

    if (_isAttemptExceeded) {
      logger.debug('attempt exceeded')
      testFn?.('attempt exceeded')
      return { ok: false, attemptExceeded: _isAttemptExceeded }
    }

    await useVerification(updatedVerification.id)

    const createdSession = await createNewSession(existingUser.id)

    logger.debug('session created')
    testFn?.('session created')
    return {
      ok: true,
      sessionId: createdSession.id,
    }
  })

  if (!txResult.ok) {
    logger.debug('txResult not ok')
    return { ok: false, attemptExceeded: !!txResult.attemptExceeded }
  }

  ctx.setSessionId(txResult.sessionId ?? null)
  ctx.setVerificationEmail(null)
  return { ok: true }
}
