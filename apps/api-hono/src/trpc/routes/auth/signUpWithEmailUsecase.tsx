import { commitVerificationSessionWithValue } from '@/feature/auth/cookie-session/verification-session'
import SignUpVerification from '@/feature/email/components/SignUpVerification'
import { prisma } from '@/lib/prisma'
import type { Context } from '@/trpc/trpc'
import { generateRandomURLString } from '@/utils/auth'
import { sendEmail } from '@/utils/email'
import { addMinutes } from 'date-fns'
import * as v from 'valibot'

export const signUpWithEmailSchema = v.object({
  email: v.pipe(v.string(), v.email()),
})

type UseCaseArgs = {
  input: v.InferInput<typeof signUpWithEmailSchema>
  ctx: Context
}
export const signUpWithEmailUsecase = async ({ ctx, input }: UseCaseArgs): Promise<{ ok: true }> => {
  const txRes = await prisma.$transaction(async (prisma) => {
    const existingUser = await prisma.user.findUnique({
      where: {
        email: input.email,
      },
    })

    // Don't send any detailed message but may be good to send sign-in email instead.
    if (existingUser) {
      return { ok: false }
    }

    const created = await prisma.verification.create({
      data: {
        type: 'email',
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
  if (!txRes.ok) return { ok: true }

  ctx.resHeaders.append('Set-Cookie', await commitVerificationSessionWithValue(ctx.req, input.email))
  return { ok: true }
}
