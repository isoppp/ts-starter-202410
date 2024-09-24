import { logger } from '@/lib/logger'
import type { AutoloadPluginOptions } from '@fastify/autoload'
import chalk from 'chalk'
import type { FastifyPluginAsync, FastifyServerOptions } from 'fastify'
export interface AppOptions extends FastifyServerOptions, Partial<AutoloadPluginOptions> {}
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import AutoLoad from '@fastify/autoload'
import Fastify from 'fastify'
import { initOpenTelemetry } from './lib/open-telemetry'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Pass --options via CLI arguments in command to enable these options.
const options: AppOptions = {
  logger: false,
}

const app: FastifyPluginAsync<AppOptions> = async (fastify, opts): Promise<void> => {
  // Place here your custom code!
  initOpenTelemetry()

  // Do not touch the following lines
  void fastify.register(AutoLoad, {
    dir: join(__dirname, 'plugins'),
    options: opts,
  })

  void fastify.register(AutoLoad, {
    dir: join(__dirname, 'routes'),
    options: opts,
  })
}

// アプリケーションを起動する関数
const start = async () => {
  const fastify = Fastify(options)
  await fastify.register(app)
  try {
    fastify.listen({ port: 3000, host: '127.0.0.1' }, (err, address) => {
      if (err) {
        logger.error(err)
      } else {
        logger.info(chalk.blueBright(`Server listening on ${address}`))
      }
    })
  } catch (err) {
    logger.error(err)
    process.exit(1)
  }
}

await start()
