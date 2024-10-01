import { getPrisma } from '@/lib/prisma'
import { generateRandomURLString } from '@/utils/auth'
import type { VerificationType } from '@prisma/client'
import { addMinutes } from 'date-fns'

export const getRecentUnusedVerification = async (email: string, type: VerificationType) => {
  return getPrisma().verification.findFirst({
    where: {
      to: email,
      type,
      createdAt: {
        gte: addMinutes(new Date(), -1),
      },
      usedAt: null,
    },
  })
}

export const getValidVerification = async (email: string, token: string, type: VerificationType) => {
  return getPrisma().verification.findUnique({
    where: {
      to: email,
      token,
      type,
      expiresAt: {
        gte: new Date(),
      },
      usedAt: null,
    },
  })
}

export const addVerificationAttempt = async (id: string) => {
  return getPrisma().verification.update({
    where: {
      id,
    },
    data: {
      attempt: {
        increment: 1,
      },
    },
  })
}

export const isAttemptExceeded = (attempt: number) => attempt > 3

export const useVerification = async (id: string) => {
  return getPrisma().verification.update({
    where: {
      id,
    },
    data: {
      usedAt: new Date(),
    },
  })
}

export const createVerification = async (email: string, type: VerificationType) => {
  return getPrisma().verification.create({
    data: {
      type,
      token: generateRandomURLString(128),
      expiresAt: addMinutes(new Date(), 5),
      to: email,
    },
  })
}
