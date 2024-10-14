import { getPrisma } from '@/lib/prisma'
import type { Context } from '@/trpc/trpc'
import type { User } from '@prisma/client'
import { TRPCError } from '@trpc/server'

type UseCaseArgs = {
  ctx: Context
}
type UseCaseResult = {
  ok: true
  user: User
}
export const meUsecase = async ({ ctx }: UseCaseArgs): Promise<UseCaseResult> => {
  if (ctx.userId === null) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Unauthorized',
    })
  }

  const user = await getPrisma().user.findUnique({
    where: {
      id: ctx.userId,
    },
  })
  if (!user) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: 'User not found',
    })
  }

  return { ok: true, user }
}
