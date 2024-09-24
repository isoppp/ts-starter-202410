import type { FastifyPluginAsync } from 'fastify'
// plugins/httpsRedirect.ts
import fp from 'fastify-plugin'

const httpsRedirectPlugin: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('onRequest', (request, reply, done) => {
    if (request.headers['x-forwarded-proto'] === 'http') {
      reply.redirect(`https://${request.hostname}${request.url}`)
    } else {
      done()
    }
  })
}

export default fp(httpsRedirectPlugin)