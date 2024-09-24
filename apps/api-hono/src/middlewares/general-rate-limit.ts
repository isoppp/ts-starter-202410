import { logger } from '@/lib/logger'
import type { EnvHono } from '@/types/hono-context'
import { getConnInfo } from '@hono/node-server/conninfo'
import { rateLimiter } from 'hono-rate-limiter'

/**
 * rateLimit middleware
 * limit 10 req per second per IP address
 */
export const generalRateLimit = rateLimiter<EnvHono>({
  windowMs: 1000,
  limit: 10,
  standardHeaders: 'draft-6',
  keyGenerator: (c) => {
    const info = getConnInfo(c)
    const key = [info.remote.address].filter((v) => !!v).join('') || 'unknown'
    logger.debug(`Rate limit key: ${key}`)
    return key
  },
  skipFailedRequests: true,
})

// TODO protect auth apis with stronger rate limit
