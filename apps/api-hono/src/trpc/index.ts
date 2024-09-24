import { authRouter } from '@/trpc/routes/auth'
import { exampleRouter } from '@/trpc/routes/example'
import { createLoaderContext, router, t } from './trpc'

export const appRouter = router({
  example: exampleRouter,
  auth: authRouter,
})

export type AppRouter = typeof appRouter

export const createCaller = t.createCallerFactory(appRouter)

export const createTrpcServerForLoader = (req: Request) =>
  createCaller(() => {
    return createLoaderContext({ req })
  })
