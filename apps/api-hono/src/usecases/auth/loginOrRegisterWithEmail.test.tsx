import { VerificationType } from '@/constants/verification-type'
import { defineUserFactory, defineVerificationFactory, initialize } from '@/generated/fabbrica'
import { prisma } from '@/lib/prisma'
import { createTestCtx, testEmail } from '@/test/helper'
import { loginOrRegisterWithEmail } from '@/usecases/auth/loginOrRegisterWithEmail'
import { addMinutes, addSeconds } from 'date-fns'
import { describe, expect, vitest } from 'vitest'

describe(loginOrRegisterWithEmail.name, () => {
  beforeEach(async () => {
    initialize({ prisma })
  })

  describe('login flow', async () => {
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

    it('should be success', async () => {
      const { user, ctx, fn } = await setup()
      const res = await loginOrRegisterWithEmail({
        ctx,
        input: {
          email: user.email,
        },
        testFn: fn,
      })

      expect(res.ok).toBe(true)
      expect(fn).toHaveBeenCalledWith('sent login email')
      expect(ctx.setVerificationEmail).toHaveBeenCalledWith(testEmail)
    })

    it('should be failed when send request within 1min', async () => {
      const { user, ctx, fn } = await setup()
      await defineVerificationFactory().create({
        type: VerificationType.EMAIL_LOGIN,
        to: user.email,
        expiresAt: addMinutes(new Date(), 5),
        usedAt: null,
      })
      await expect(
        loginOrRegisterWithEmail({
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
        type: VerificationType.EMAIL_LOGIN,
        to: user.email,
        expiresAt: addSeconds(addMinutes(new Date(), 5), -61),
        createdAt: addSeconds(new Date(), -61),
        usedAt: null,
      })
      const res = await loginOrRegisterWithEmail({
        ctx,
        input: {
          email: user.email,
        },
        testFn: fn,
      })
      expect(res.ok).toBe(true)
      expect(fn).toHaveBeenCalledWith('sent login email')
    })
  })

  describe('registration flow', async () => {
    const setup = async () => {
      const fn = vitest.fn()
      const ctx = createTestCtx()
      return {
        fn,
        ctx,
      }
    }

    it('should be success', async () => {
      const { ctx, fn } = await setup()
      const res = await loginOrRegisterWithEmail({
        ctx,
        input: {
          email: testEmail,
        },
        testFn: fn,
      })

      expect(res.ok).toBe(true)
      expect(fn).toHaveBeenCalledWith('sent sign up email')
      expect(ctx.setVerificationEmail).toHaveBeenCalledWith(testEmail)
      expect(
        await prisma.verification.findFirst({
          where: {
            type: VerificationType.EMAIL_USER_REGISTRATION,
            expiresAt: {
              gte: new Date(),
            },
            to: testEmail,
          },
        }),
      ).toBeTruthy()
    })

    it('should be failed when send request within 1min', async () => {
      const { ctx, fn } = await setup()
      await defineVerificationFactory().create({
        type: VerificationType.EMAIL_USER_REGISTRATION,
        to: testEmail,
        expiresAt: addMinutes(new Date(), 5),
        usedAt: null,
      })
      await expect(
        loginOrRegisterWithEmail({
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
        type: VerificationType.EMAIL_USER_REGISTRATION,
        to: testEmail,
        expiresAt: addSeconds(addMinutes(new Date(), 5), -61),
        createdAt: addSeconds(new Date(), -61),
        usedAt: null,
      })
      const res = await loginOrRegisterWithEmail({
        ctx,
        input: {
          email: testEmail,
        },
        testFn: fn,
      })
      expect(res.ok).toBe(true)
      expect(fn).toHaveBeenCalledWith('sent sign up email')
    })
  })
})
