import { defineUserFactory, initialize } from '@/generated/fabbrica'
import { prisma } from '@/lib/prisma'
import { createTestCtx, testEmail } from '@/test/helper'
import { describe, expect } from 'vitest'
import { deleteUserUsecase } from './deleteUserUsecase'

const testUserFactory = defineUserFactory({ defaultData: { email: testEmail } })
const setup = async () => {
  const user = await testUserFactory.create()
  const ctx = createTestCtx({
    userId: user.id,
    setSessionId: vitest.fn(),
  })
  return {
    ctx,
  }
}

describe(deleteUserUsecase.name, () => {
  beforeEach(async () => {
    initialize({ prisma })
  })

  it('should delete user', async () => {
    const { ctx } = await setup()
    if (!ctx.userId) throw Error('ctx.userId is null')

    const res = await deleteUserUsecase({
      ctx,
    })
    expect(res.ok).toBe(true)
    expect(res.user?.id).toBe(ctx.userId)
    const deleted = await prisma.user.findUnique({
      where: { id: ctx.userId },
    })
    expect(deleted).toBeNull()
    expect(ctx.setSessionId).toBeCalledWith(null)

    const session = await prisma.session.findFirst({
      where: { userId: ctx.userId },
    })
    expect(session).toBeNull()
  })

  it('should be not found', async () => {
    const { ctx } = await setup()
    await expect(
      deleteUserUsecase({
        ctx: {
          ...ctx,
          userId: null,
        },
      }),
    ).rejects.toThrowError()
  })
})
