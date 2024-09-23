import winston from 'winston'

// Imports the Google Cloud client library for Winston
import { LoggingWinston } from '@google-cloud/logging-winston'

export const logger = winston.createLogger({
  level: 'info',
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), winston.format.cli()),
    }),
    process.env.GOOGLE_APPLICATION_CREDENTIALS
      ? new LoggingWinston({
          keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
        })
      : null,
  ].filter((v) => !!v),
})
