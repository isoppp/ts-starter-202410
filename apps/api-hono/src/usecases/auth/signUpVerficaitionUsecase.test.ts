import { defineVerificationFactory, initialize } from '@/generated/fabbrica'
import { prisma } from '@/lib/prisma'
import { createTestCtx, testEmail } from '@/test/helper'
import { addMinutes } from 'date-fns'
import { expect, vitest } from 'vitest'
import { signUpVerificationUsecase } from './signUpVerficaitionUsecase'

const VerificationFactory = defineVerificationFactory({
  defaultData: {
    type: 'EMAIL_SIGN_UP',
    expiresAt: addMinutes(new Date(), 5),
    to: testEmail,
  },
})

const setup = async () => {
  const fn = vitest.fn()
  const verification = await VerificationFactory.create()
  const ctx = createTestCtx({
    verificationEmail: verification.to,
  })
  return {
    fn,
    verification,
    ctx,
  }
}

describe(signUpVerificationUsecase.name, async () => {
  beforeEach(async () => {
    initialize({ prisma })
  })

  it('should be success then create user and set session variables', async () => {
    const { verification, ctx, fn } = await setup()
    const res = await signUpVerificationUsecase({
      ctx,
      input: {
        token: verification.token,
      },
      testFn: fn,
    })

    const updatedVerification = await prisma.verification.findUniqueOrThrow({
      where: {
        id: verification.id,
      },
    })

    expect(res.ok).toBe(true)
    expect(fn).toHaveBeenCalledWith('session and user created')
    expect(updatedVerification.attempt).toBe(1)
    expect(updatedVerification.usedAt).not.toBeNull()
    expect(await prisma.user.findUnique({ where: { email: verification.to } })).not.toBeNull()
    expect(ctx.setVerificationEmail).toHaveBeenCalledWith(null)
    expect(ctx.setSessionId).toHaveBeenCalled()
  })

  it('should be failed since email is not provided', async () => {
    const { verification, ctx, fn } = await setup()
    await expect(
      signUpVerificationUsecase({
        ctx: {
          ...ctx,
          verificationEmail: null,
        },
        input: {
          token: verification.token,
        },
        testFn: fn,
      }),
    ).rejects.toThrowError()
    expect(fn).toHaveBeenCalledWith('email not found')
  })

  it('should be failed since user exists', async () => {
    const fn = vitest.fn()
    const verification = await VerificationFactory.create({
      usedAt: new Date(),
    })
    await prisma.user.create({
      data: {
        email: verification.to,
      },
    })

    const ctx = createTestCtx({
      verificationEmail: verification.to,
    })
    const res = await signUpVerificationUsecase({
      ctx,
      input: {
        token: verification.token,
      },
      testFn: fn,
    })
    expect(res.ok).toBe(false)
    expect(fn).toHaveBeenCalledWith('user already exists')
  })

  it('should be failed since no verification record', async () => {
    const { verification, ctx, fn } = await setup()
    const res = await signUpVerificationUsecase({
      ctx,
      input: {
        token: `${verification.token}invalid`,
      },
      testFn: fn,
    })
    expect(res.ok).toBe(false)
    expect(fn).toHaveBeenCalledWith('verification not found')
  })

  it('should be failed since it was already expired ( not found )', async () => {
    const fn = vitest.fn()
    const verification = await VerificationFactory.create({
      expiresAt: addMinutes(new Date(), -1),
    })
    const ctx = createTestCtx({
      verificationEmail: verification.to,
    })
    const res = await signUpVerificationUsecase({
      ctx,
      input: {
        token: verification.token,
      },
      testFn: fn,
    })
    expect(res.ok).toBe(false)
    expect(fn).toHaveBeenCalledWith('verification not found')
  })

  it('should be failed since it was already used', async () => {
    const fn = vitest.fn()

    const verification = await VerificationFactory.create({
      usedAt: new Date(),
    })
    const ctx = createTestCtx({
      verificationEmail: verification.to,
    })
    const res = await signUpVerificationUsecase({
      ctx,
      input: {
        token: verification.token,
      },
      testFn: fn,
    })
    expect(res.ok).toBe(false)
    expect(fn).toHaveBeenCalledWith('verification already used')
  })

  it('should be failed since attempt exceeded', async () => {
    const fn = vitest.fn()
    const verification = await VerificationFactory.create({
      attempt: 3,
    })
    const ctx = createTestCtx({
      verificationEmail: verification.to,
    })
    const res = await signUpVerificationUsecase({
      ctx,
      input: {
        token: verification.token,
      },
      testFn: fn,
    })
    expect(res.ok).toBe(false)
    expect(fn).toHaveBeenCalledWith('attempt exceeded')
  })
})
