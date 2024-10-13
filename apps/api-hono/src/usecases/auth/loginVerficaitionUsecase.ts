import { RESPONSE_CODE } from '@/constants/response-code'
import { VerificationType } from '@/constants/verification-type'
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
  email: v.optional(v.nullable(v.pipe(v.string(), v.minLength(1)))),
})

type UseCaseArgs = {
  input: v.InferInput<typeof signInVerificationSchema>
  ctx: Context
  testFn?: ReturnType<typeof vitest.fn>
}
type UseCaseResult = {
  ok: true
}
export const signInVerificationUsecase = async ({ ctx, input, testFn }: UseCaseArgs): Promise<UseCaseResult> => {
  const email = ctx.verificationEmail || input.email
  if (!email) {
    logger.info('email not found')
    testFn?.('email not found')
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: RESPONSE_CODE.R_CANNOT_CONTINUE_VERIFICATION,
    })
  }

  const txResult = await withTransaction(async () => {
    const existingUser = await getUserByEmail(email)

    if (!existingUser) {
      logger.info('user not found')
      testFn?.('user not found')
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: RESPONSE_CODE.R_CANNOT_CONTINUE_VERIFICATION,
      })
    }

    const verification = await getValidVerification(email, input.token, VerificationType.EMAIL_LOGIN)
    if (!verification) {
      logger.info('valid verification not found')
      testFn?.('valid verification not found')
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: RESPONSE_CODE.R_CANNOT_CONTINUE_VERIFICATION,
      })
    }

    const updatedVerification = await addVerificationAttempt(verification.id)
    const _isAttemptExceeded = isAttemptExceeded(updatedVerification.attempt)

    if (_isAttemptExceeded) {
      logger.info('attempt exceeded')
      testFn?.('attempt exceeded')
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: RESPONSE_CODE.R_CANNOT_CONTINUE_VERIFICATION,
      })
    }

    await useVerification(updatedVerification.id)

    const createdSession = await createNewSession(existingUser.id)

    logger.info('session created')
    testFn?.('session created')
    return {
      sessionId: createdSession.id,
    }
  })

  ctx.setSessionId(txResult.sessionId)
  ctx.setVerificationEmail(null)
  return { ok: true }
}
