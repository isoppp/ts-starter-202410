import { TraceExporter } from '@google-cloud/opentelemetry-cloud-trace-exporter'
import { FastifyInstrumentation } from '@opentelemetry/instrumentation-fastify'
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http'
import { PinoInstrumentation } from '@opentelemetry/instrumentation-pino'
import { WinstonInstrumentation } from '@opentelemetry/instrumentation-winston'
import { NodeSDK } from '@opentelemetry/sdk-node'
import p from '@prisma/instrumentation'

export const initOpenTelemetry = () => {
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    const sdk = new NodeSDK({
      traceExporter: new TraceExporter({
        keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
      }),
      instrumentations: [
        new FastifyInstrumentation(),
        new HttpInstrumentation(),
        new PinoInstrumentation(),
        new WinstonInstrumentation(),
        new p.PrismaInstrumentation(),
      ],
    })

    sdk.start()
  }
}
