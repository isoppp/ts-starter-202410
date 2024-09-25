import { env } from '@/lib/env'
import { factory } from '@/lib/hono'
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
  app.use(requestId())
  app.use(generalRateLimit)
  app.use(
    cors({
      origin: env.WEBAPP_URL,
      credentials: true,
    }),
  )
  app.use(secureHeaders({ removePoweredBy: true }))
  app.use(compress())

  app.get('/', (c) => {
    return c.text('Hello Hono!')
  })

  app.get('/a', (c) => {
    const session = c.get('session')
    c.set('session', {
      ...session,
      verificationEmail: '123',
    })
    c.get('setSessionValue')('verificationEmail', '1240')
    c.get('setSessionValue')('verificationEmail', '1245')
    return c.text('Set value to session')
  })
  app.get('/b', (c) => {
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
