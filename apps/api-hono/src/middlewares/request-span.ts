import { factory } from '@/lib/hono'
import { type Span, trace } from '@opentelemetry/api'

const tracer = trace.getTracer('hono')
export const requestSpan = factory.createMiddleware(async (c, next) => {
  const pathname = new URL(c.req.url).pathname
  await tracer.startActiveSpan(`hono-request: ${pathname}`, async (span: Span) => {
    span.setAttribute('url', c.req.url)
    span.setAttribute('method', c.req.method)
    await next()
    span.setAttribute('status', c.res.status)
    span.end()
  })
})
