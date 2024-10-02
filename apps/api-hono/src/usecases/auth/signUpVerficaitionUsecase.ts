import { logger } from '@/lib/logger'
import { withTransaction } from '@/lib/prisma'
import { createNewSession } from '@/module/session'
import { createUserByEmail, getUserByEmail } from '@/module/user'
import { addVerificationAttempt, getValidVerification, isAttemptExceeded, useVerification } from '@/module/verification'
import type { Context } from '@/trpc/trpc'
import { TRPCError } from '@trpc/server'
import * as v from 'valibot'

export const signUpVerificationSchema = v.object({
  token: v.pipe(v.string(), v.minLength(1)),
})

type UseCaseArgs = {
  input: v.InferInput<typeof signUpVerificationSchema>
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
type TxResult =
  | {
      ok: true
      sessionId: string
    }
  | {
      ok: false
      attemptExceeded: boolean
    }
export const signUpVerificationUsecase = async ({ ctx, input, testFn }: UseCaseArgs): Promise<UseCaseResult> => {
  const email = ctx.verificationEmail
  if (!email) {
    logger.debug('email not found')
    testFn?.('email not found')

    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Invalid Request',
    })
  }

  const txResult = await withTransaction(async (): Promise<TxResult> => {
    const existing = await getUserByEmail(email)
    if (existing) {
      logger.debug('user already exists')
      testFn?.('user already exists')
      return { ok: false, attemptExceeded: false }
    }

    const verification = await getValidVerification(email, input.token, 'EMAIL_SIGN_UP')

    if (!verification) {
      logger.debug('valid verification not found')
      testFn?.('valid verification not found')
      return { ok: false, attemptExceeded: false }
    }

    const updatedVerification = await addVerificationAttempt(verification.id)
    const _isAttemptExceeded = isAttemptExceeded(updatedVerification.attempt)
    if (isAttemptExceeded(updatedVerification.attempt)) {
      logger.debug('attempt exceeded')
      testFn?.('attempt exceeded')
      return { ok: false, attemptExceeded: _isAttemptExceeded }
    }

    await useVerification(updatedVerification.id)

    const createdUser = await createUserByEmail(verification.to)
    const createdSession = await createNewSession(createdUser.id)

    logger.debug('session and user created')
    testFn?.('session and user created')
    return {
      ok: true,
      sessionId: createdSession.id,
    }
  })

  if (!txResult.ok) {
    logger.debug('txResult not ok')
    return txResult
  }

  ctx.setSessionId(txResult.sessionId ?? null)
  ctx.setVerificationEmail(null)
  return { ok: true }
}
