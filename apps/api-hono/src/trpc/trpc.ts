import { env } from '@/lib/env'
import { prisma } from '@/lib/prisma'
import type { User } from '@prisma/client'

import type { EnvHono } from '@/types/hono-context'
import { TRPCError, initTRPC } from '@trpc/server'
import type { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch'
import type { Context as HonoContext } from 'hono'

type TestContext = {
  req: Request
  resHeaders: Headers
  user: null
}

export async function createTestContext(): Promise<TestContext> {
  return {
    req: new Request('http://localhost:3000'),
    resHeaders: new Headers(),
    user: null,
  }
}

export function createLoaderContext({
  req,
}: {
  req: Request
}): TestContext {
  return { req, resHeaders: new Headers(), user: null }
}

export async function createContext(opts: FetchCreateContextFnOptions, c: HonoContext<EnvHono>) {
  const session = c.get('session')
  const setSessionValue = c.get('setSessionValue')
  let user: User | null = null
  if (session.sessionId) {
    const sessionData = await prisma.session.findUnique({
      where: { id: session.sessionId },
      select: { id: true, user: true },
    })
    user = sessionData?.user ?? null
  }

  return { ...opts, session, setSessionValue, user }
}

export type Context = Awaited<ReturnType<typeof createContext>>

export const t = initTRPC.context<Context>().create({
  errorFormatter({ shape }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        // zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    }
  },
  isDev: env.APP_ENV === 'local',
})

const authed = t.middleware(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }

  return next({
    ctx,
  })
})
const unauthed = t.middleware(async ({ ctx, next }) => {
  if (ctx.user) {
    throw new TRPCError({ code: 'FORBIDDEN' })
  }

  return next({
    ctx,
  })
})

export const router = t.router
const publicProcedure = t.procedure
const authProcedure = t.procedure.use(authed)
const unAuthProcedure = t.procedure.use(unauthed)

export const createTRPCRouter = t.router
export const p = {
  public: publicProcedure,
  auth: authProcedure,
  unAuth: unAuthProcedure,
}
