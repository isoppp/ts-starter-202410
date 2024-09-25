import * as v from 'valibot'

const envSchema = v.object({
  APP_ENV: v.picklist(['local', 'test', 'development', 'staging', 'production']),
  WEBAPP_URL: v.pipe(v.string(), v.minLength(1)),
  SESSION_SECRET: v.pipe(v.string(), v.minLength(1)),
  PORT: v.optional(v.number(), 3000),
})

const env = v.parse(envSchema, process.env)

export { env }
