import type { EnvHono } from '@/types/hono-context'
import { createFactory } from 'hono/factory'

export const factory = createFactory<EnvHono>()
