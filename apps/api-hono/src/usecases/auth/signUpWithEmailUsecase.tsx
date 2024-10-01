import SignUpVerification from '@/infrastructure/email/templates/SignUpVerification'
import { logger } from '@/lib/logger'
import { prisma } from '@/lib/prisma'
import type { Context } from '@/trpc/trpc'
import { generateRandomURLString } from '@/utils/auth'
import { sendEmail } from '@/utils/email'
import { TRPCError } from '@trpc/server'
import { addMinutes } from 'date-fns'
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
  const txRes = await prisma.$transaction(async (prisma) => {
    const existingUser = await prisma.user.findUnique({
      where: {
        email: input.email,
      },
    })

    // Don't send any detailed message but may be good to send sign-in email instead.
    if (existingUser) {
      logger.debug('user already exists')
      testFn?.('user already exists')
      return { ok: false }
    }

    const dupVerification = await prisma.verification.findFirst({
      where: {
        to: input.email,
        type: 'EMAIL_SIGN_UP',
        createdAt: {
          gte: addMinutes(new Date(), -1),
        },
        usedAt: null,
      },
    })

    if (dupVerification) {
      logger.debug('signup request is already sent', { email: input.email })
      testFn?.('signup request is already sent')
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'signup request is already sent',
      })
    }

    const created = await prisma.verification.create({
      data: {
        type: 'EMAIL_SIGN_UP',
        token: generateRandomURLString(128),
        expiresAt: addMinutes(new Date(), 5),
        to: input.email,
      },
    })

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
