import fastifyCompress from '@fastify/compress'
import type { FastifyPluginAsync } from 'fastify'
// plugins/compress.ts
import fp from 'fastify-plugin'

const compressPlugin: FastifyPluginAsync = async (fastify, opts) => {
  fastify.register(fastifyCompress, opts)
}

export default fp(compressPlugin)
