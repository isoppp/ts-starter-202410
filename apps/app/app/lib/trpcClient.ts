import type { AppRouter } from '@repo/api-hono/dist/src/trpc'
import { createTRPCReact } from '@trpc/react-query'
export const trpc = createTRPCReact<AppRouter>()
