import { createTRPCReact } from '@trpc/react-query'
import type { AppRouter } from '../../types/trpc'
export const trpc = createTRPCReact<AppRouter>()
