import { TraceExporter } from '@google-cloud/opentelemetry-cloud-trace-exporter'
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http'
import { WinstonInstrumentation } from '@opentelemetry/instrumentation-winston'
import { NodeSDK } from '@opentelemetry/sdk-node'
import { PrismaInstrumentation } from '@prisma/instrumentation'

export const initOpenTelemetry = () => {
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    const sdk = new NodeSDK({
      traceExporter: new TraceExporter({
        keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
      }),
      instrumentations: [new HttpInstrumentation(), new WinstonInstrumentation(), new PrismaInstrumentation()],
    })

    sdk.start()
  }
}
