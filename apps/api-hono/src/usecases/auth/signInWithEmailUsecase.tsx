import SignInVerification from '@/infrastructure/email/templates/SignInVerification'
import { logger } from '@/lib/logger'
import { withTransaction } from '@/lib/prisma'
import { getUserByEmail } from '@/module/user'
import { createVerification, getRecentUnusedVerification } from '@/module/verification'
import type { Context } from '@/trpc/trpc'
import { sendEmail } from '@/utils/email'
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
export const signInWithEmailUsecase = async ({ ctx, input, testFn }: UseCaseArgs): Promise<{ ok: boolean }> => {
  const txRes = await withTransaction(async () => {
    const existingUser = await getUserByEmail(input.email)

    if (!existingUser) {
      logger.debug('user not found', { email: input.email })
      testFn?.('user not found')
      return { ok: false }
    }

    const dupVerification = await getRecentUnusedVerification(input.email, 'EMAIL_SIGN_IN')

    if (dupVerification) {
      logger.debug('signin request is already sent', { email: input.email })
      testFn?.('signin request is already sent')
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'signin request is already sent',
      })
    }

    const created = await createVerification(input.email, 'EMAIL_SIGN_IN')

    await sendEmail({
      to: input.email,
      subject: 'Sign in to remix-starter',
      react: <SignInVerification pathname={`/signin/verification/${created.token}`} />,
    })

    return { ok: true }
  })

  if (!txRes.ok) return { ok: false }

  ctx.setVerificationEmail(input.email)
  return { ok: true }
}
