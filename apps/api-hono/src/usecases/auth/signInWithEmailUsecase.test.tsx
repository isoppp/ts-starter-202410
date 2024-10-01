import { defineUserFactory, defineVerificationFactory, initialize } from '@/generated/fabbrica'
import { prisma } from '@/lib/prisma'
import { createTestCtx, testEmail } from '@/test/helper'
import { signInWithEmailUsecase } from '@/usecases/auth/signInWithEmailUsecase'
import { addMinutes, addSeconds } from 'date-fns'
import { describe, expect, vitest } from 'vitest'

const userFactory = defineUserFactory({
  defaultData: {
    email: testEmail,
  },
})

const setup = async () => {
  const user = await userFactory.create()
  const fn = vitest.fn()
  const ctx = createTestCtx({
    verificationEmail: user.email,
  })
  return {
    user,
    fn,
    ctx,
  }
}

describe(signInWithEmailUsecase.name, () => {
  beforeEach(async () => {
    initialize({ prisma })
  })

  it('should be success', async () => {
    const { user, ctx, fn } = await setup()
    const res = await signInWithEmailUsecase({
      ctx,
      input: {
        email: user.email,
      },
      testFn: fn,
    })

    expect(res.ok).toBe(true)
    expect(fn).not.toHaveBeenCalled()
    expect(ctx.setVerificationEmail).toHaveBeenCalledWith(testEmail)
  })

  it('should be failed since user is not found', async () => {
    const { user, ctx, fn } = await setup()
    const res = await signInWithEmailUsecase({
      ctx,
      input: {
        email: `${user.email}notfound`,
      },
      testFn: fn,
    })

    expect(res.ok).toBe(false)
    expect(fn).toHaveBeenCalledWith('user not found')
  })

  it('should be failed when send request within 1min', async () => {
    const { user, ctx, fn } = await setup()
    await defineVerificationFactory().create({
      type: 'EMAIL_SIGN_IN',
      to: user.email,
      expiresAt: addMinutes(new Date(), 5),
      usedAt: null,
    })
    await expect(
      signInWithEmailUsecase({
        ctx,
        input: {
          email: user.email,
        },
        testFn: fn,
      }),
    ).rejects.toThrowError()
    expect(fn).toHaveBeenCalledWith('signin request is already sent')
  })

  it('should be success when send request after 61 sec', async () => {
    const { user, ctx, fn } = await setup()
    await defineVerificationFactory().create({
      type: 'EMAIL_SIGN_IN',
      to: user.email,
      expiresAt: addSeconds(addMinutes(new Date(), 5), -61),
      createdAt: addSeconds(new Date(), -61),
      usedAt: null,
    })
    const res = await signInWithEmailUsecase({
      ctx,
      input: {
        email: user.email,
      },
      testFn: fn,
    })
    expect(res.ok).toBe(true)
    expect(fn).not.toHaveBeenCalled()
  })
})
