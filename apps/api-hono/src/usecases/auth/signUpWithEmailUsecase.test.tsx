import { defineUserFactory, defineVerificationFactory, initialize } from '@/generated/fabbrica'
import { prisma } from '@/lib/prisma'
import { createTestCtx, testEmail } from '@/test/helper'
import { signUpWithEmailUsecase } from '@/usecases/auth/signUpWithEmailUsecase'
import { addMinutes, addSeconds } from 'date-fns'
import { describe, expect, vitest } from 'vitest'

const setup = async () => {
  const fn = vitest.fn()
  const ctx = createTestCtx()
  return {
    fn,
    ctx,
  }
}

describe(signUpWithEmailUsecase.name, () => {
  beforeEach(async () => {
    initialize({ prisma })
  })

  it('should be success', async () => {
    const { ctx, fn } = await setup()
    const res = await signUpWithEmailUsecase({
      ctx,
      input: {
        email: testEmail,
      },
      testFn: fn,
    })

    expect(res.ok).toBe(true)
    expect(fn).not.toHaveBeenCalled()
    expect(ctx.setVerificationEmail).toHaveBeenCalledWith(testEmail)
    expect(
      await prisma.verification.findFirst({
        where: {
          type: 'EMAIL_SIGN_UP',
          expiresAt: {
            gte: new Date(),
          },
          to: testEmail,
        },
      }),
    ).toBeTruthy()
  })

  it('should be failed since email duplicate', async () => {
    const user = await defineUserFactory().create({ email: testEmail })
    const { ctx, fn } = await setup()
    const res = await signUpWithEmailUsecase({
      ctx,
      input: {
        email: user.email,
      },
      testFn: fn,
    })
    expect(res.ok).toBe(false)
    expect(fn).toHaveBeenCalledWith('user already exists')
  })

  it('should be failed when send request within 1min', async () => {
    const { ctx, fn } = await setup()
    await defineVerificationFactory().create({
      type: 'EMAIL_SIGN_UP',
      to: testEmail,
      expiresAt: addMinutes(new Date(), 5),
      usedAt: null,
    })
    await expect(
      signUpWithEmailUsecase({
        ctx,
        input: {
          email: testEmail,
        },
        testFn: fn,
      }),
    ).rejects.toThrowError()
    expect(fn).toHaveBeenCalledWith('signup request is already sent')
  })

  it('should be success when send request after 61 sec', async () => {
    const { ctx, fn } = await setup()
    await defineVerificationFactory().create({
      type: 'EMAIL_SIGN_UP',
      to: testEmail,
      expiresAt: addSeconds(addMinutes(new Date(), 5), -61),
      createdAt: addSeconds(new Date(), -61),
      usedAt: null,
    })
    const res = await signUpWithEmailUsecase({
      ctx,
      input: {
        email: testEmail,
      },
      testFn: fn,
    })
    expect(res.ok).toBe(true)
    expect(fn).not.toHaveBeenCalled()
  })
})
