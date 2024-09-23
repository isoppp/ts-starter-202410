// plugins/compress.ts
import fp from 'fastify-plugin'
import fastifyCompress from '@fastify/compress'
import { FastifyPluginAsync } from 'fastify'

const compressPlugin: FastifyPluginAsync = async (fastify, opts) => {
  fastify.register(fastifyCompress, opts)
}

export default fp(compressPlugin)
