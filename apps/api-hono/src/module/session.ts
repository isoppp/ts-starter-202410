import { getPrisma } from '@/lib/prisma'
import { SESSION_EXPIRATION_SEC } from '@/middlewares/cookie-session'
import { addSeconds } from 'date-fns'

export const createNewSession = async (userId: string) => {
  return getPrisma().session.create({
    data: {
      expiresAt: addSeconds(new Date(), SESSION_EXPIRATION_SEC),
      userId,
    },
  })
}
