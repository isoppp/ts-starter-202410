import { getAuthSessionId } from '@/feature/auth/cookie-session/auth-session'
import { env } from '@/lib/env'
import { prisma } from '@/lib/prisma'
import { TRPCError, initTRPC } from '@trpc/server'

export async function createTestContext() {
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
}) {
  return { req, resHeaders: new Headers(), user: null }
}

export async function createContext({
  req,
  resHeaders,
}: {
  req: Request
  resHeaders: Headers
}) {
  const sessionId = await getAuthSessionId(req)
  if (sessionId) {
    const sessionData = await prisma.session.findUnique({ where: { id: sessionId }, select: { id: true, user: true } })
    if (sessionData?.user) {
      return { req, resHeaders, user: sessionData.user }
    }
  }

  return { req, resHeaders, user: null }
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
