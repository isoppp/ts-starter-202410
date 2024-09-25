import { factory } from '@/lib/hono'
import { getConnInfo } from '@hono/node-server/conninfo'
import { SpanStatusCode, trace } from '@opentelemetry/api'

const tracer = trace.getTracer('hono')
export const requestSpan = factory.createMiddleware(async (c, next) => {
  const url = new URL(c.req.url)
  const pathname = url.pathname
  const info = getConnInfo(c)

  await tracer.startActiveSpan(`${c.req.method} ${pathname}`, async (span) => {
    // request info
    span.setAttribute('http.method', c.req.method)
    span.setAttribute('http.url', c.req.url)
    span.setAttribute('http.target', pathname)
    span.setAttribute('http.host', url.host)
    span.setAttribute('http.scheme', url.protocol.slice(0, -1))
    span.setAttribute('http.user_agent', c.req.header('User-Agent') || '')
    span.setAttribute('http.request_content_length', Number.parseInt(c.req.header('Content-Length') || '0', 10))

    // query params
    url.searchParams.forEach((value, key) => {
      span.setAttribute(`http.query.${key}`, value)
    })

    // request header
    const headerEntries = Object.entries(c.req.header())
    for (const [key, value] of headerEntries) {
      span.setAttribute(`http.request.header.${key.toLowerCase()}`, value)
    }

    // client info
    const clientIP = c.req.header('X-Forwarded-For') || c.req.header('X-Real-IP') || info.remote.address
    if (clientIP) {
      span.setAttribute('http.client_ip', clientIP)
    }

    try {
      await next()
    } catch (error) {
      span.recordException(error as Error)
      span.setStatus({ code: SpanStatusCode.ERROR, message: (error as Error).message })
      throw error
    } finally {
      // response info
      span.setAttribute('http.status_code', c.res.status)
      span.setAttribute('http.response_content_length', Number.parseInt(c.res.headers.get('Content-Length') || '0', 10))

      // response header
      c.res.headers.forEach((value, key) => {
        span.setAttribute(`http.response.header.${key.toLowerCase()}`, value)
      })

      if (c.res.status >= 400) {
        span.setStatus({ code: SpanStatusCode.ERROR })
      } else {
        span.setStatus({ code: SpanStatusCode.OK })
      }

      span.end()
    }
  })
})
