import { RESPONSE_CODE } from '@/constants/response-code'
import { VerificationType } from '@/constants/verification-type'
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
  email: v.optional(v.nullable(v.pipe(v.string(), v.minLength(1)))),
})

type UseCaseArgs = {
  input: v.InferInput<typeof signUpVerificationSchema>
  ctx: Context
  testFn?: ReturnType<typeof vitest.fn>
}
type UseCaseResult = {
  ok: true
}
export const signUpVerificationUsecase = async ({ ctx, input, testFn }: UseCaseArgs): Promise<UseCaseResult> => {
  const email = ctx.verificationEmail || input.email
  if (!email) {
    logger.info('email not found')
    testFn?.('email not found')

    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Invalid Request',
    })
  }

  const txResult = await withTransaction(async () => {
    const existing = await getUserByEmail(email)
    if (existing) {
      logger.info('user already exists')
      testFn?.('user already exists')
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: RESPONSE_CODE.R_CANNOT_CONTINUE_VERIFICATION,
      })
    }

    const verification = await getValidVerification(email, input.token, VerificationType.EMAIL_USER_REGISTRATION)

    if (!verification) {
      logger.info('valid verification not found')
      testFn?.('valid verification not found')
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: RESPONSE_CODE.R_CANNOT_CONTINUE_VERIFICATION,
      })
    }

    const updatedVerification = await addVerificationAttempt(verification.id)
    if (isAttemptExceeded(updatedVerification.attempt)) {
      logger.info('attempt exceeded')
      testFn?.('attempt exceeded')
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: RESPONSE_CODE.R_CANNOT_CONTINUE_VERIFICATION,
      })
    }

    await useVerification(updatedVerification.id)

    const createdUser = await createUserByEmail(verification.to)
    const createdSession = await createNewSession(createdUser.id)

    logger.info('session and user created')
    testFn?.('session and user created')

    return {
      sessionId: createdSession.id,
    }
  })

  ctx.setSessionId(txResult.sessionId)
  ctx.setVerificationEmail(null)
  return { ok: true }
}
