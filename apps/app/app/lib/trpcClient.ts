import type { AppRouter } from '@/generated/trpc/trpc'
import { createTRPCReact } from '@trpc/react-query'
export const trpc = createTRPCReact<AppRouter>()
