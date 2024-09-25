import { prisma } from '@/lib/prisma'
import type { Context } from '@/trpc/trpc'
import { isBefore } from 'date-fns'

type UseCaseArgs = {
  ctx: Context
}

export const isSignedInUseCase = async ({ ctx }: UseCaseArgs): Promise<{ ok: boolean }> => {
  const sessionId = ctx.sessionId
  if (!sessionId) {
    return { ok: false } // Don't throw error
  }

  const row = await prisma.session.findUnique({
    where: {
      id: sessionId,
    },
  })

  if (!row || isBefore(row?.expiresAt, new Date())) {
    ctx.setSessionId(null)
    return { ok: false }
  }
  return { ok: true }
}
