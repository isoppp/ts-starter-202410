import { factory } from '@/lib/hono'

export const httpRedirect = factory.createMiddleware(async (c, next) => {
  if (c.req.method !== 'GET') return next()

  const proto = c.req.header('X-Forwarded-Proto')
  if (proto === 'http') {
    const url = new URL(c.req.url)
    url.protocol = 'https'
    const newUrl = url.href
    return c.redirect(newUrl)
  }

  await next()
})
