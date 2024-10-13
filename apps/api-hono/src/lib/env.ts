import * as v from 'valibot'

const envSchema = v.object({
  APP_ENV: v.picklist(['local', 'test', 'development', 'staging', 'production']),
  WEBAPP_URL: v.pipe(v.string(), v.minLength(1)),
  APP_SECRET: v.pipe(v.string(), v.minLength(1)),
  PORT: v.optional(v.pipe(v.string(), v.transform<string, number>(Number)), '3000'),
})

export const env = v.parse(envSchema, process.env)
