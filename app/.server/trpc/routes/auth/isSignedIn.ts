import { destroyStrAuthSession, getAuthSessionId } from '@/.server/cookie-session/auth-session'
import type { Context } from '@/.server/trpc/trpc'
import { prisma } from '@/lib/prisma'
import { isBefore } from 'date-fns'

type UseCaseArgs = {
  ctx: Context
}

export const isSignedInUseCase = async ({ ctx }: UseCaseArgs): Promise<{ ok: boolean }> => {
  const sessionId = await getAuthSessionId(ctx.req)
  if (!sessionId) {
    return { ok: false } // Don't throw error
  }

  const row = await prisma.session.findUnique({
    where: {
      id: sessionId,
    },
  })

  if (!row || isBefore(row?.expiresAt, new Date())) {
    ctx.resHeaders.append('Set-Cookie', await destroyStrAuthSession(ctx.req))
    return { ok: false }
  }
  return { ok: true }
}
