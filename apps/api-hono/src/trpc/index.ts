import { authRouter } from '@/trpc/routes/auth'
import { exampleRouter } from '@/trpc/routes/example'
import { router, t } from '@/trpc/trpc'

export const appRouter = router({
  example: exampleRouter,
  auth: authRouter,
})
export type AppRouter = typeof appRouter

export const createCaller = t.createCallerFactory(appRouter)
