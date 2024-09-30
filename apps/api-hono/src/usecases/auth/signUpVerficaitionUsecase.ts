import { logger } from '@/lib/logger'
import { prisma } from '@/lib/prisma'
import { SESSION_EXPIRATION_SEC } from '@/middlewares/cookie-session'
import type { Context } from '@/trpc/trpc'
import { TRPCError } from '@trpc/server'
import { addSeconds } from 'date-fns'
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

  const txResult = await prisma.$transaction(async (prisma): Promise<TxResult> => {
    const existing = await prisma.user.findUnique({
      where: {
        email,
      },
    })
    if (existing) {
      logger.debug('user already exists')
      testFn?.('user already exists')
      return { ok: false, attemptExceeded: false }
    }

    const verification = await prisma.verification.findUnique({
      where: {
        to: email,
        token: input.token,
        type: 'EMAIL_SIGN_UP',
        expiresAt: {
          gte: new Date(),
        },
      },
    })

    if (!verification) {
      logger.debug('verification not found')
      testFn?.('verification not found')
      return { ok: false, attemptExceeded: false }
    }
    if (verification.usedAt) {
      logger.debug('verification already used')
      testFn?.('verification already used')
      return { ok: false, attemptExceeded: false }
    }

    const updatedVerification = await prisma.verification.update({
      where: {
        id: verification.id,
      },
      data: {
        attempt: {
          increment: 1,
        },
      },
    })

    const attemptExceeded = updatedVerification.attempt > 3

    if (attemptExceeded) {
      logger.debug('attempt exceeded')
      testFn?.('attempt exceeded')
      return { ok: false, attemptExceeded }
    }

    await prisma.verification.update({
      where: {
        id: verification.id,
      },
      data: {
        usedAt: new Date(),
      },
    })

    const createdUser = await prisma.user.create({
      data: {
        email: verification.to,
      },
    })

    const createdSession = await prisma.session.create({
      data: {
        expiresAt: addSeconds(new Date(), SESSION_EXPIRATION_SEC),
        userId: createdUser.id,
      },
    })

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
