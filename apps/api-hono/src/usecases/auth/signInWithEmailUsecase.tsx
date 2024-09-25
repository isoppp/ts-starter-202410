import SignInVerification from '@/infrastructure/email/templates/SignInVerification'
import { prisma } from '@/lib/prisma'
import type { Context } from '@/trpc/trpc'
import { generateRandomURLString } from '@/utils/auth'
import { sendEmail } from '@/utils/email'
import { TRPCError } from '@trpc/server'
import { addMinutes } from 'date-fns'
import * as v from 'valibot'
export const signInWithEmailSchema = v.object({
  email: v.pipe(v.string(), v.email()),
})

type UseCaseArgs = {
  input: v.InferInput<typeof signInWithEmailSchema>
  ctx: Context
}
export const signInWithEmailUsecase = async ({ ctx, input }: UseCaseArgs): Promise<{ ok: boolean }> => {
  const txRes = await prisma.$transaction(async (prisma) => {
    const user = await prisma.user.findUnique({
      where: {
        email: input.email,
      },
    })

    if (!user) return { ok: false }

    const hasValidVerification = await prisma.verification.findFirst({
      where: {
        to: input.email,
        type: 'EMAIL_SIGN_IN',
        expiresAt: {
          gte: new Date(),
        },
        attempt: {
          lte: 3,
        },
      },
    })

    if (hasValidVerification) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Email is already sent. Please check your email for verification',
      })
    }

    const created = await prisma.verification.create({
      data: {
        type: 'EMAIL_SIGN_IN',
        token: generateRandomURLString(128),
        expiresAt: addMinutes(new Date(), 5),
        to: input.email,
      },
    })

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