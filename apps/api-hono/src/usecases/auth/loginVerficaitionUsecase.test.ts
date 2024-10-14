import { RESPONSE_CODE } from '@/constants/response-code'
import { VerificationType } from '@/constants/verification-type'
import { defineUserFactory, defineVerificationFactory, initialize } from '@/generated/fabbrica'
import { prisma } from '@/lib/prisma'
import { createTestCtx, testEmail } from '@/test/helper'
import { signInVerificationUsecase } from '@/usecases/auth/loginVerficaitionUsecase'
import { TRPCError } from '@trpc/server'
import { addMinutes } from 'date-fns'
import { vitest } from 'vitest'

const UserFactory = defineUserFactory({
  defaultData: async () => ({
    email: testEmail,
  }),
})
const VerificationFactory = defineVerificationFactory({
  defaultData: {
    type: VerificationType.EMAIL_LOGIN,
    expiresAt: addMinutes(new Date(), 5),
  },
})

const setup = async () => {
  const fn = vitest.fn()
  const user = await UserFactory.create()
  const verification = await VerificationFactory.create({
    to: user.email,
  })
  const ctx = createTestCtx({
    verificationEmail: user.email,
  })
  return {
    fn,
    user,
    verification,
    ctx,
  }
}

describe(signInVerificationUsecase.name, async () => {
  beforeEach(async () => {
    initialize({ prisma })
  })

  it('should be success by session email and set session variables', async () => {
    const { verification, ctx, fn } = await setup()
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

  it('should be success by sending email and set session variables', async () => {
    const { verification, ctx, fn } = await setup()
    const res = await signInVerificationUsecase({
      ctx: {
        ...ctx,
        verificationEmail: null,
      },
      input: {
        token: verification.token,
        email: ctx.verificationEmail,
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
    const fn = vitest.fn()
    const user = await UserFactory.create()
    const verification = await VerificationFactory.create({
      to: `${user.email}invalid`,
      attempt: 3,
    })
    const ctx = createTestCtx({
      verificationEmail: `${user.email}invalid`,
    })
    try {
      await signInVerificationUsecase({
        ctx,
        input: {
          token: verification.token,
        },
        testFn: fn,
      })
      throw new Error('Expected error was not thrown')
    } catch (error) {
      expect(fn).toHaveBeenCalledWith('user not found')
      expect(error).toBeInstanceOf(TRPCError)
      if (error instanceof TRPCError) {
        expect(error.message).toBe(RESPONSE_CODE.R_CANNOT_CONTINUE_VERIFICATION)
        expect(error.code).toBe('BAD_REQUEST')
      }
    }
  })

  it('should be failed since no email field', async () => {
    const { verification, ctx, fn } = await setup()
    try {
      await signInVerificationUsecase({
        ctx: {
          ...ctx,
          verificationEmail: null,
        },
        input: {
          token: verification.token,
        },
        testFn: fn,
      })
      throw new Error('Expected error was not thrown')
    } catch (error) {
      expect(fn).toHaveBeenCalledWith('email not found')
      expect(error).toBeInstanceOf(TRPCError)
      if (error instanceof TRPCError) {
        expect(error.message).toBe(RESPONSE_CODE.R_CANNOT_CONTINUE_VERIFICATION)
        expect(error.code).toBe('BAD_REQUEST')
      }
    }
  })

  it('should be failed since no verification record', async () => {
    const { verification, ctx, fn } = await setup()
    try {
      await signInVerificationUsecase({
        ctx,
        input: {
          token: `${verification.token}invalid`,
        },
        testFn: fn,
      })
      throw new Error('Expected error was not thrown')
    } catch (error) {
      expect(fn).toHaveBeenCalledWith('valid verification not found')
      expect(error).toBeInstanceOf(TRPCError)
      if (error instanceof TRPCError) {
        expect(error.message).toBe(RESPONSE_CODE.R_CANNOT_CONTINUE_VERIFICATION)
        expect(error.code).toBe('BAD_REQUEST')
      }
    }
  })

  it('should be failed since it was already expired ( not found )', async () => {
    const fn = vitest.fn()
    const user = await UserFactory.create()
    const verification = await VerificationFactory.create({
      to: user.email,
      expiresAt: addMinutes(new Date(), -1),
    })
    const ctx = createTestCtx({
      verificationEmail: user.email,
    })
    try {
      await signInVerificationUsecase({
        ctx,
        input: {
          token: verification.token,
        },
        testFn: fn,
      })
      throw new Error('Expected error was not thrown')
    } catch (error) {
      expect(fn).toHaveBeenCalledWith('valid verification not found')
      expect(error).toBeInstanceOf(TRPCError)
      if (error instanceof TRPCError) {
        expect(error.message).toBe(RESPONSE_CODE.R_CANNOT_CONTINUE_VERIFICATION)
        expect(error.code).toBe('BAD_REQUEST')
      }
    }
  })

  it('should be failed since it was already used', async () => {
    const fn = vitest.fn()
    const user = await UserFactory.create()
    const verification = await VerificationFactory.create({
      to: user.email,
      usedAt: new Date(),
    })
    const ctx = createTestCtx({
      verificationEmail: user.email,
    })
    try {
      await signInVerificationUsecase({
        ctx,
        input: {
          token: verification.token,
        },
        testFn: fn,
      })
      throw new Error('Expected error was not thrown')
    } catch (error) {
      expect(fn).toHaveBeenCalledWith('valid verification not found')
      expect(error).toBeInstanceOf(TRPCError)
      if (error instanceof TRPCError) {
        expect(error.message).toBe(RESPONSE_CODE.R_CANNOT_CONTINUE_VERIFICATION)
        expect(error.code).toBe('BAD_REQUEST')
      }
    }
  })

  it('should be failed since attempt exceeded', async () => {
    const fn = vitest.fn()
    const user = await UserFactory.create()
    const verification = await VerificationFactory.create({
      to: user.email,
      attempt: 3,
    })
    const ctx = createTestCtx({
      verificationEmail: user.email,
    })
    try {
      await signInVerificationUsecase({
        ctx,
        input: {
          token: verification.token,
        },
        testFn: fn,
      })
      throw new Error('Expected error was not thrown')
    } catch (error) {
      expect(fn).toHaveBeenCalledWith('attempt exceeded')
      expect(error).toBeInstanceOf(TRPCError)
      if (error instanceof TRPCError) {
        expect(error.message).toBe(RESPONSE_CODE.R_CANNOT_CONTINUE_VERIFICATION)
        expect(error.code).toBe('BAD_REQUEST')
      }
    }
  })
})
