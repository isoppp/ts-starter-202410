import { createTRPCReact } from '@trpc/react-query'
import type { AppRouter } from '../../../api-hono/src/trpc'

export const trpc = createTRPCReact<AppRouter>()
