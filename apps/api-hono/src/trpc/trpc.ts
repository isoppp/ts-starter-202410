import { env } from '@/lib/env'
import { prisma } from '@/lib/prisma'

import type { EnvHono } from '@/types/hono-context'
import { TRPCError, initTRPC } from '@trpc/server'
import type { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch'
import type { Context as HonoContext } from 'hono'

type TestContext = {
  req: Request
  resHeaders: Headers
  user: null
}

export async function createTestContext(): Promise<Context> {
  return {
    userId: null,
    verificationEmail: null,
    setVerificationEmail: () => {},
    sessionId: null,
    setSessionId: () => {},
  }
}

export function createLoaderContext({
  req,
}: {
  req: Request
}): TestContext {
  return { req, resHeaders: new Headers(), user: null }
}

export async function createContext(_: FetchCreateContextFnOptions, c: HonoContext<EnvHono>) {
  let sessionId = c.get('sessionId')
  let userId: string | null = null
  if (sessionId) {
    const sessionData = await prisma.session.findFirst({
      where: { id: sessionId },
      select: { id: true, user: true },
    })
    userId = sessionData?.user?.id ?? null

    // expire session if not found
    if (!sessionData) {
      c.set('sessionId', null)
      sessionId = null
      userId = null
    }
  }

  const setSessionId = (id: string | null) => c.set('sessionId', id)

  const verificationEmail = c.get('verificationEmail')
  const setVerificationEmail = (email: string | null) => c.set('verificationEmail', email)

  return { userId, sessionId, setSessionId, verificationEmail, setVerificationEmail }
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
  if (!ctx.userId) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }

  return next({
    ctx,
  })
})
const unauthed = t.middleware(async ({ ctx, next }) => {
  if (ctx.userId) {
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
