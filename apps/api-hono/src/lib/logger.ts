import winston from 'winston'

// Imports the Google Cloud client library for Winston
import { LoggingWinston } from '@google-cloud/logging-winston'

const pinoLikeFormat = winston.format.printf(({ level, message, timestamp }) => {
  const pid = process.pid
  const formattedMessage = `[${timestamp}] ${level.toUpperCase()} (${pid}): ${message}`
  return formattedMessage
})

export const logger = winston.createLogger({
  level: 'debug',
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        // winston.format.colorize(),
        winston.format.timestamp({
          format: 'HH:mm:ss.SSS',
        }),
        // winston.format.cli(),
        pinoLikeFormat,
      ),
    }),
    process.env.GOOGLE_APPLICATION_CREDENTIALS
      ? new LoggingWinston({
          keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
        })
      : null,
  ].filter((v) => !!v),
})
