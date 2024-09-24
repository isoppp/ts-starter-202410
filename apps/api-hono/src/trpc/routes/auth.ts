import { isSignedInUseCase } from '@/trpc/routes/auth/isSignedIn'
import { signInVerificationSchema, signInVerificationUsecase } from '@/trpc/routes/auth/signInVerficaitionUsecase'
import { signInWithEmailSchema, signInWithEmailUsecase } from '@/trpc/routes/auth/signInWithEmailUsecase'
import { signUpVerificationSchema, signUpVerificationUsecase } from '@/trpc/routes/auth/signUpVerficaitionUsecase'
import { signUpWithEmailSchema, signUpWithEmailUsecase } from '@/trpc/routes/auth/signUpWithEmailUsecase'
import { createTRPCRouter, p } from '@/trpc/trpc'
import * as v from 'valibot'

export const authRouter = createTRPCRouter({
  isSignedIn: p.auth.query(async (args) => {
    const result = await isSignedInUseCase(args)
    return { isSignedIn: result.ok }
  }),
  signupWithEmail: p.public.input(v.parser(signUpWithEmailSchema)).mutation(async (args) => {
    const result = await signUpWithEmailUsecase(args)
    return result
  }),
  signInWithEmail: p.public.input(v.parser(signInWithEmailSchema)).mutation(async (args) => {
    const result = await signInWithEmailUsecase(args)
    return result
  }),
  signInVerification: p.public.input(v.parser(signInVerificationSchema)).mutation(async (args) => {
    const result = await signInVerificationUsecase(args)
    return result
  }),
  signUpVerification: p.public.input(v.parser(signUpVerificationSchema)).mutation(async (args) => {
    const result = await signUpVerificationUsecase(args)
    return result
  }),
})
