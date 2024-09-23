import { authRouter } from '@/.server/trpc/routes/auth'
import { exampleRouter } from '@/.server/trpc/routes/example'
import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import { createContext, createLoaderContext, router, t } from './trpc'

const appRouter = router({
  example: exampleRouter,
  auth: authRouter,
})

export type AppRouter = typeof appRouter

export const handler = (request: Request, endpoint = '/api/trpc') => {
  return fetchRequestHandler({
    endpoint,
    req: request,
    router: appRouter,
    createContext,
  })
}

export const createCaller = t.createCallerFactory(appRouter)

export const createTrpcServerForLoader = (req: Request) =>
  createCaller(() => {
    return createLoaderContext({ req })
  })
