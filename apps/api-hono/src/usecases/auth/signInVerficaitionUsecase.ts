import { prisma } from '@/lib/prisma'
import { SESSION_EXPIRATION_SEC } from '@/middlewares/cookie-session'
import type { Context } from '@/trpc/trpc'
import { TRPCError } from '@trpc/server'
import { addSeconds } from 'date-fns'
import * as v from 'valibot'

export const signInVerificationSchema = v.object({
  token: v.pipe(v.string(), v.minLength(1)),
})

type UseCaseArgs = {
  input: v.InferInput<typeof signInVerificationSchema>
  ctx: Context
}
type UseCaseResult =
  | {
      ok: true
    }
  | {
      ok: false
      attemptExceeded: boolean
    }
export const signInVerificationUsecase = async ({ ctx, input }: UseCaseArgs): Promise<UseCaseResult> => {
  const email = ctx.verificationEmail
  if (!email) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Invalid Request',
    })
  }

  const txResult = await prisma.$transaction(async (prisma) => {
    const verification = await prisma.verification.findUnique({
      where: {
        to: email,
        token: input.token,
        type: 'EMAIL_SIGN_IN',
        expiresAt: {
          gte: new Date(),
        },
      },
    })

    if (!verification) {
      return { ok: false }
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
      return { ok: false, attemptExceeded }
    }

    if (verification.usedAt) {
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

    const createdUser = await prisma.user.findUnique({
      where: {
        email: email,
      },
    })

    if (!createdUser) return { ok: false, attemptExceeded }

    const createdSession = await prisma.session.create({
      data: {
        expiresAt: addSeconds(new Date(), SESSION_EXPIRATION_SEC),
        userId: createdUser.id,
      },
    })

    return {
      ok: true,
      sessionId: createdSession.id,
    }
  })

  if (!txResult.ok) return { ok: false, attemptExceeded: !!txResult.attemptExceeded }

  ctx.setSessionId(txResult.sessionId ?? null)
  ctx.setVerificationEmail(null)
  return { ok: true }
}
