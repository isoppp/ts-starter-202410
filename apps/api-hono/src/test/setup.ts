import { vi } from 'vitest'

vi.mock('@/lib/prisma', () => ({
  prisma: vPrisma.client,
}))
