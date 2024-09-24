import { prisma } from '@/lib/prisma'
import type { Context } from '@/trpc/trpc'
import { addSeconds, isBefore } from 'date-fns'
import * as v from 'valibot'

export const signUpVerificationSchema = v.object({
  token: v.pipe(v.string(), v.minLength(1)),
})

type UseCaseArgs = {
  input: v.InferInput<typeof signUpVerificationSchema>
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
type TxResult =
  | {
      ok: true
      sessionId: string
    }
  | {
      ok: false
      attemptExceeded: boolean
    }
export const signUpVerificationUsecase = async ({ ctx, input }: UseCaseArgs): Promise<UseCaseResult> => {
  // TODO
  // const email = await getVerificationSessionEmail(ctx.req)
  const email = 'test@example.com'
  if (!email) {
    return { ok: false, attemptExceeded: false }
  }

  const txRes = await prisma.$transaction(async (prisma): Promise<TxResult> => {
    const verification = await prisma.verification.findUnique({
      where: {
        to: email,
        token: input.token,
      },
    })

    if (!verification) {
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
      return { ok: false, attemptExceeded }
    }

    if (verification.usedAt) {
      return { ok: false, attemptExceeded }
    }

    if (isBefore(verification.expiresAt, new Date())) {
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

    const existing = await prisma.user.findUnique({
      where: {
        email: verification.to,
      },
    })
    if (existing) {
      return { ok: false, attemptExceeded }
    }
    const createdUser = await prisma.user.create({
      data: {
        email: verification.to,
      },
    })

    const createdSession = await prisma.session.create({
      data: {
        expiresAt: addSeconds(new Date(), 60 * 60 * 24 * 30), // TODO
        userId: createdUser.id,
      },
    })

    return {
      ok: true,
      sessionId: createdSession.id,
    }
  })

  if (!txRes.ok) return txRes

  // ctx.resHeaders.append('Set-Cookie', await commitAuthSessionWithValue(ctx.req, txRes.sessionId))
  // ctx.resHeaders.append('Set-Cookie', await destroyStrVerificationSession(ctx.req))
  return { ok: true }
}
