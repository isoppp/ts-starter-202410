import { RESPONSE_CODE } from '@/constants/response-code'
import { VerificationType } from '@/constants/verification-type'
import { sendEmail } from '@/infrastructure/email/sendEmail'
import { LoginVerificationEmail } from '@/infrastructure/email/templates/LoginVerificationEmail'
import { SignUpVerificationEmail } from '@/infrastructure/email/templates/SignUpVerificationEmail'
import { logger } from '@/lib/logger'
import { withTransaction } from '@/lib/prisma'
import { getUserByEmail } from '@/module/user'
import { createVerification, getRecentUnusedVerification } from '@/module/verification'
import type { Context } from '@/trpc/trpc'
import { TRPCError } from '@trpc/server'
import * as v from 'valibot'
export const signInWithEmailSchema = v.object({
  email: v.pipe(v.string(), v.email()),
})

type UseCaseArgs = {
  input: v.InferInput<typeof signInWithEmailSchema>
  ctx: Context
  testFn?: ReturnType<typeof vitest.fn>
}
export const loginOrRegisterWithEmail = async ({ ctx, input, testFn }: UseCaseArgs): Promise<{ ok: boolean }> => {
  const txRes = await withTransaction(async () => {
    const existingUser = await getUserByEmail(input.email)
    const isRegistration = !existingUser

    if (isRegistration) {
      logger.info('start to handle login request as registration', { email: input.email })
      const dupVerification = await getRecentUnusedVerification(input.email, VerificationType.EMAIL_USER_REGISTRATION)

      if (dupVerification) {
        logger.info('signup request is already sent', { email: input.email })
        testFn?.('signup request is already sent')
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: RESPONSE_CODE.R_VERIFICATION_REQUEST_ALREADY_SENT,
        })
      }

      const created = await createVerification(input.email, VerificationType.EMAIL_USER_REGISTRATION)

      await sendEmail({
        to: input.email,
        subject: 'Secure link to create an account to ts-starter.app',
        react: <SignUpVerificationEmail pathname={`/signup/verification/${created.token}`} />,
      })
      logger.info('sent sign up email', { email: input.email })
      testFn?.('sent sign up email')
    } else {
      logger.info('start to handle login request as login', { email: input.email })
      const dupVerification = await getRecentUnusedVerification(input.email, VerificationType.EMAIL_LOGIN)

      if (dupVerification) {
        logger.info('signin request is already sent', { email: input.email })
        testFn?.('signin request is already sent')
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: RESPONSE_CODE.R_VERIFICATION_REQUEST_ALREADY_SENT,
        })
      }

      const created = await createVerification(input.email, VerificationType.EMAIL_LOGIN)

      await sendEmail({
        to: input.email,
        subject: 'Secure link to log in to ts-starter.app',
        react: <LoginVerificationEmail pathname={`/login/verification/${created.token}`} />,
      })
      logger.info('sent login email', { email: input.email })
      testFn?.('sent login email')
    }

    return { ok: true }
  })

  if (!txRes.ok) {
    logger.info('transaction failed')
    testFn?.('transaction failed')
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: RESPONSE_CODE.R_INTERNAL_SERVER_ERROR,
    })
  }

  ctx.setVerificationEmail(input.email)
  return { ok: true }
}
