import { TraceExporter } from '@google-cloud/opentelemetry-cloud-trace-exporter'
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express'
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http'
import { WinstonInstrumentation } from '@opentelemetry/instrumentation-winston'
import { NodeSDK } from '@opentelemetry/sdk-node'
import p from '@prisma/instrumentation'
import { RemixInstrumentation } from 'opentelemetry-instrumentation-remix'

export const initOpenTelemetry = () => {
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    const sdk = new NodeSDK({
      traceExporter: new TraceExporter({
        keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
      }),
      instrumentations: [
        new ExpressInstrumentation(),
        new HttpInstrumentation(),
        new WinstonInstrumentation(),
        new p.PrismaInstrumentation(),
        new RemixInstrumentation(),
      ],
    })

    sdk.start()
  }
}
