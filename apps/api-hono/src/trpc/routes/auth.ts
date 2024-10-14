import { getPrisma } from '@/lib/prisma'
import { createTRPCRouter, p } from '@/trpc/trpc'
import { deleteUserUsecase } from '@/usecases/auth/deleteUserUsecase'
import { loginOrRegisterWithEmail, signInWithEmailSchema } from '@/usecases/auth/loginOrRegisterWithEmail'
import { signInVerificationSchema, signInVerificationUsecase } from '@/usecases/auth/loginVerficaitionUsecase'
import { meUsecase } from '@/usecases/auth/meUsecase'
import { signUpVerificationSchema, signUpVerificationUsecase } from '@/usecases/auth/signUpVerificationUsecase'
import { TRPCError } from '@trpc/server'
import * as v from 'valibot'

export const authRouter = createTRPCRouter({
  me: p.auth.query(async ({ ctx }) => {
    const res = await meUsecase({ ctx })
    return res
  }),
  isSignedIn: p.public.query(async (args) => {
    return { isSignedIn: !!args.ctx.sessionId }
  }),
  loginOrRegisterWithEmail: p.public.input(v.parser(signInWithEmailSchema)).mutation(async (args) => {
    await loginOrRegisterWithEmail(args)
    return { ok: true } // ignore any reason for security
  }),
  signInVerification: p.public.input(v.parser(signInVerificationSchema)).mutation(async (args) => {
    return await signInVerificationUsecase(args)
  }),
  signUpVerification: p.public.input(v.parser(signUpVerificationSchema)).mutation(async (args) => {
    return await signUpVerificationUsecase(args)
  }),
  logout: p.public.mutation(async (args) => {
    if (!args.ctx.sessionId) {
      throw new TRPCError({ code: 'UNAUTHORIZED', message: 'You are not signed in' })
    }

    await getPrisma().session.delete({
      where: {
        id: args.ctx.sessionId,
      },
    })
    args.ctx.setSessionId(null)
    return { ok: true }
  }),
  deleteUser: p.auth.mutation(async ({ ctx }) => {
    const res = await deleteUserUsecase({ ctx })
    return res
  }),
})
