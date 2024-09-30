import { defineUserFactory, defineVerificationFactory } from '@/generated/fabbrica'
import { prisma } from '@/lib/prisma'
import type { Context } from '@/trpc/trpc'
import { signInVerificationUsecase } from '@/usecases/auth/signInVerficaitionUsecase'
import { faker } from '@faker-js/faker'
import { addMinutes } from 'date-fns'
import { vitest } from 'vitest'

const UserFactory = defineUserFactory({
  defaultData: async () => ({
    email: `test-${faker.string.nanoid()}@example.com`,
  }),
})
const VerificationFactory = defineVerificationFactory({
  defaultData: {
    type: 'EMAIL_SIGN_IN',
    expiresAt: addMinutes(new Date(), 5),
  },
})
const createCtx = (ctx: Partial<Context> = {}): Context => {
  const setVerificationEmail = vitest.fn() as Context['setVerificationEmail']
  const setSessionId = vitest.fn() as Context['setSessionId']
  return {
    verificationEmail: null,
    userId: null,
    sessionId: null,
    setVerificationEmail,
    setSessionId,
    ...(ctx ?? {}),
  }
}

describe(signInVerificationUsecase.name, async () => {
  const fn = vitest.fn()
  let verification = await VerificationFactory.create()
  let user = await UserFactory.create()
  let ctx = createCtx({
    verificationEmail: verification.to,
  })

  beforeEach(async () => {
    await prisma.user.deleteMany()
    await prisma.verification.deleteMany()
    await prisma.session.deleteMany()
    user = await UserFactory.create()
    verification = await VerificationFactory.create({
      to: user.email,
    })
    ctx = createCtx({
      verificationEmail: user.email,
    })
    vitest.clearAllMocks()
  })

  it('should be success and set session variables', async () => {
    const res = await signInVerificationUsecase({
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
    expect(fn).toHaveBeenCalledWith('session created')
    expect(updatedVerification.attempt).toBe(1)
    expect(updatedVerification.usedAt).not.toBeNull()
    expect(ctx.setVerificationEmail).toHaveBeenCalledWith(null)
    expect(ctx.setSessionId).toHaveBeenCalled()
  })

  it('should be failed since user is not found', async () => {
    const user = await UserFactory.create()
    const verification = await VerificationFactory.create({
      to: `${user.email}invalid`,
      attempt: 3,
    })
    const ctx = createCtx({
      verificationEmail: `${user.email}invalid`,
    })
    const res = await signInVerificationUsecase({
      ctx,
      input: {
        token: verification.token,
      },
      testFn: fn,
    })
    expect(res.ok).toBe(false)
    expect(fn).toHaveBeenCalledWith('user not found')
  })

  it('should be failed since no email field', async () => {
    await expect(
      signInVerificationUsecase({
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

  it('should be failed since no verification record', async () => {
    const res = await signInVerificationUsecase({
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
    const user = await UserFactory.create()
    const verification = await VerificationFactory.create({
      to: user.email,
      expiresAt: addMinutes(new Date(), -1),
    })
    const ctx = createCtx({
      verificationEmail: user.email,
    })
    const res = await signInVerificationUsecase({
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
    const user = await UserFactory.create()
    const verification = await VerificationFactory.create({
      to: user.email,
      usedAt: new Date(),
    })
    const ctx = createCtx({
      verificationEmail: user.email,
    })
    const res = await signInVerificationUsecase({
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
    const user = await UserFactory.create()
    const verification = await VerificationFactory.create({
      to: user.email,
      attempt: 3,
    })
    const ctx = createCtx({
      verificationEmail: user.email,
    })
    const res = await signInVerificationUsecase({
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
