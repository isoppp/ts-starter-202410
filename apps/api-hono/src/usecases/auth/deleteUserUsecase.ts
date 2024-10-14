import { RESPONSE_CODE } from '@/constants/response-code'
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

export const deleteUserUsecase = async ({ ctx }: UseCaseArgs): Promise<UseCaseResult> => {
  if (ctx.userId === null) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: RESPONSE_CODE.R_UNAUTHORIZED,
    })
  }
  const deleted = await getPrisma().user.delete({
    where: {
      id: ctx.userId,
    },
  })

  ctx.setSessionId(null)

  return { ok: true, user: deleted }
}
