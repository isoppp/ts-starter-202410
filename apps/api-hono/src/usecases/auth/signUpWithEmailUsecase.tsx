import SignUpVerification from '@/infrastructure/email/templates/SignUpVerification'
import { logger } from '@/lib/logger'
import { withTransaction } from '@/lib/prisma'
import { getUserByEmail } from '@/module/user'
import { createVerification, getRecentUnusedVerification } from '@/module/verification'
import type { Context } from '@/trpc/trpc'
import { sendEmail } from '@/utils/email'
import { TRPCError } from '@trpc/server'
import * as v from 'valibot'

export const signUpWithEmailSchema = v.object({
  email: v.pipe(v.string(), v.email()),
})

type UseCaseArgs = {
  input: v.InferInput<typeof signUpWithEmailSchema>
  ctx: Context
  testFn?: ReturnType<typeof vitest.fn>
}
export const signUpWithEmailUsecase = async ({ ctx, input, testFn }: UseCaseArgs): Promise<{ ok: boolean }> => {
  const txRes = await withTransaction(async () => {
    const existingUser = await getUserByEmail(input.email)

    // Don't send any detailed message but may be good to send sign-in email instead.
    if (existingUser) {
      logger.debug('user already exists')
      testFn?.('user already exists')
      return { ok: false }
    }

    const dupVerification = await getRecentUnusedVerification(input.email, 'EMAIL_SIGN_UP')

    if (dupVerification) {
      logger.debug('signup request is already sent', { email: input.email })
      testFn?.('signup request is already sent')
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'signup request is already sent',
      })
    }

    const created = await createVerification(input.email, 'EMAIL_SIGN_UP')

    // TODO send email
    await sendEmail({
      to: input.email,
      subject: 'Sign up to remix-starter',
      react: <SignUpVerification pathname={`/signup/verification/${created.token}`} />,
    })

    return { ok: true }
  })

  // Don't send any detailed message for security.
  if (!txRes.ok) {
    logger.debug('transaction failed')
    testFn?.('transaction failed')
    return { ok: false }
  }

  ctx.setVerificationEmail(input.email)
  return { ok: true }
}
