import { getPrisma } from '@/lib/prisma'

export const getUserByEmail = async (email: string) => {
  return getPrisma().user.findUnique({
    where: {
      email,
    },
  })
}

export const createUserByEmail = async (email: string) => {
  return getPrisma().user.create({
    data: {
      email,
    },
  })
}
