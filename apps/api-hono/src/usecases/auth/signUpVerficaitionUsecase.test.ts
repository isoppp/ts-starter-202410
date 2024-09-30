import { defineVerificationFactory } from '@/generated/fabbrica'
import { prisma } from '@/lib/prisma'
import type { Context } from '@/trpc/trpc'
import { faker } from '@faker-js/faker'
import { addMinutes } from 'date-fns'
import { expect, vitest } from 'vitest'
import { signUpVerificationUsecase } from './signUpVerficaitionUsecase'

const VerificationFactory = defineVerificationFactory({
  defaultData: {
    type: 'EMAIL_SIGN_UP',
    expiresAt: addMinutes(new Date(), 5),
    to: `test-${faker.string.nanoid()}@example.com`,
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

describe(signUpVerificationUsecase.name, async () => {
  const fn = vitest.fn()
  let verification = await VerificationFactory.create()
  let ctx = createCtx({
    verificationEmail: verification.to,
  })

  beforeEach(async () => {
    await prisma.user.deleteMany()
    await prisma.verification.deleteMany()
    await prisma.session.deleteMany()
    verification = await VerificationFactory.create()
    ctx = createCtx({
      verificationEmail: verification.to,
    })
    vitest.clearAllMocks()
  })

  it('should be success then create user and set session variables', async () => {
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
    const verification = await VerificationFactory.create({
      usedAt: new Date(),
    })
    await prisma.user.create({
      data: {
        email: verification.to,
      },
    })

    const ctx = createCtx({
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
    const verification = await VerificationFactory.create({
      expiresAt: addMinutes(new Date(), -1),
    })
    const ctx = createCtx({
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
    const verification = await VerificationFactory.create({
      usedAt: new Date(),
    })
    const ctx = createCtx({
      verificationEmail: verification.to,
    })
    const res = await signUpVerificationUsecase({
      ctx,
      input: {
        token: verification.token,
      },
    })
    expect(res.ok).toBe(false)
  })

  it('should be failed since attempt exceeded', async () => {
    const verification = await VerificationFactory.create({
      attempt: 3,
    })
    const ctx = createCtx({
      verificationEmail: verification.to,
    })
    const res = await signUpVerificationUsecase({
      ctx,
      input: {
        token: verification.token,
      },
    })
    expect(res.ok).toBe(false)
  })
})
