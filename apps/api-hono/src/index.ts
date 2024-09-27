import { env } from '@/lib/env'
import { factory } from '@/lib/hono'
import { cookieEmailVerification } from '@/middlewares/cookie-email-verification'
import { cookieSession } from '@/middlewares/cookie-session'
import { generalRateLimit } from '@/middlewares/general-rate-limit'
import { httpRedirect } from '@/middlewares/http-redirect'
import { requestSpan } from '@/middlewares/request-span'
import { appRouter } from '@/trpc'
import { createContext } from '@/trpc/trpc'
import { serve } from '@hono/node-server'
import { trpcServer } from '@hono/trpc-server'
import { compress } from 'hono/compress'
import { cors } from 'hono/cors'
import { logger as requestLogger } from 'hono/logger'
import { requestId } from 'hono/request-id'
import { secureHeaders } from 'hono/secure-headers'
import { logger } from './lib/logger'
import { initOpenTelemetry } from './lib/open-telemetry'
initOpenTelemetry()

const newApp = () => {
  const app = factory.createApp()
  app.use(requestSpan)
  app.use(
    requestLogger((message: string, ...rest: string[]) => {
      logger.info(message, ...rest)
    }),
  )
  app.use(httpRedirect)
  app.use(cookieSession)
  app.use(cookieEmailVerification)
  app.use(requestId())
  app.use(generalRateLimit)
  app.use(
    cors({
      origin: env.WEBAPP_URL,
      allowHeaders: [
        'Content-Type', // Specify the format of the data
        // 'Authorization', // Authentication information (if needed)
        'Accept', // Indicate the response format the client accepts
        'Origin', // Indicate the origin of the CORS request
        'Cookie', // Cookie information (sent from frontend)
        'Set-Cookie', // Set cookies (sent from server)
        'Cache-Control', // Control caching strategy
        'Referer', // Referrer information
        'Content-Length', // Specify the size of the payload
        'Accept-Language', // For multi-language support
      ],
      allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      credentials: true,
    }),
  )
  app.use(secureHeaders({ removePoweredBy: true }))
  app.use(compress())

  app.get('/', (c) => {
    return c.text('Hello Hono!')
  })

  app.use(
    '/api/trpc/*',
    trpcServer({
      endpoint: '/api/trpc',
      router: appRouter,
      createContext,
    }),
  )

  return app
}

const app = newApp()
logger.info(`Server is running on port ${env.PORT}`)
serve({
  fetch: app.fetch,
  port: env.PORT,
})
