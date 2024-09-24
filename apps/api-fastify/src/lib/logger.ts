import winston from 'winston'

// Imports the Google Cloud client library for Winston
import { LoggingWinston } from '@google-cloud/logging-winston'

const pinoLikeFormat = winston.format.printf(({ level, message, timestamp, ...metadata }) => {
  const pid = process.pid

  const formattedMessage = `[${timestamp}] ${level.toUpperCase()} (${pid}): ${message}`
  // if (Object.keys(metadata).length > 0) {
  //   formattedMessage += JSON.stringify(metadata)
  // }
  return formattedMessage
})

export const logger = winston.createLogger({
  level: 'info',
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp({
          format: 'HH:mm:ss.SSS',
        }),
        winston.format.splat(),
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
