import { defineUserFactory, initialize } from '@/generated/fabbrica'
import { prisma } from '@/lib/prisma'
import { createTestCtx, testEmail } from '@/test/helper'
import { describe, expect } from 'vitest'
import { meUsecase } from './meUsecase'

const testUserFactory = defineUserFactory({ defaultData: { email: testEmail } })
const setup = async () => {
  const user = await testUserFactory.create()
  const ctx = createTestCtx({
    userId: user.id,
  })
  return {
    ctx,
  }
}

describe(meUsecase.name, () => {
  beforeEach(async () => {
    initialize({ prisma })
  })

  it('should get the data and api key already decrypted', async () => {
    const { ctx } = await setup()
    if (!ctx.userId) throw Error('ctx.userId is null')

    const res = await meUsecase({
      ctx,
    })
    expect(res.ok).toBe(true)
    expect(res.user?.id).toBe(ctx.userId)
  })

  it('should be not found', async () => {
    const { ctx } = await setup()
    await expect(
      meUsecase({
        ctx: {
          ...ctx,
          userId: null,
        },
      }),
    ).rejects.toThrowError()
  })
})
