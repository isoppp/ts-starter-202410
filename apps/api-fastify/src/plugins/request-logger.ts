import { logger } from '@/lib/logger'
import chalk from 'chalk'
import type { FastifyPluginAsync } from 'fastify'
import fp from 'fastify-plugin'

const getStatusColor = (status: number) => {
  if (status >= 500) return chalk.red(status)
  if (status >= 400) return chalk.red(status)
  if (status >= 300) return chalk.yellow(status)
  if (status >= 200) return chalk.blue(status)
  return status
}

const getDurationInMilliseconds = (start: [number, number]) => {
  const diff = process.hrtime(start)
  return diff[0] * 1000 + diff[1] / 1e6
}
// プラグインの定義
const requestLogger: FastifyPluginAsync = async (fastify) => {
  // Fastifyにロガーインスタンスを追加
  // fastify.decorate('logger', logger)
  let start: [number, number] = [0, 0]

  // ログをリクエスト時とレスポンス時に出力する
  fastify.addHook('onRequest', (request, _, done) => {
    start = process.hrtime()
    logger.info(`<-- ${request.id} ${request.method} ${request.url}`, {
      ip: request.ip,
      requestId: request.id,
      hostname: request.hostname,
    })
    done()
  })

  fastify.addHook('onResponse', (request, reply, done) => {
    const durationInMilliseconds = getDurationInMilliseconds(start)

    logger.info(
      `--> ${request.id} ${request.method} ${getStatusColor(reply.statusCode)} ${request.url} ${durationInMilliseconds}ms`,
      {
        ip: request.ip,
        requestId: request.id,
        ms: durationInMilliseconds,
      },
    )
    done()
  })
}

export default fp(requestLogger)
