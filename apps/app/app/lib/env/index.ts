import * as v from 'valibot'
const existStringSchema = v.pipe(v.string(), v.minLength(1))
const envSchema = v.object({
  APP_ENV: existStringSchema,
  API_BASE_URL: existStringSchema,
})

// 設定を検証
export const clientEnv = v.parse(envSchema, {
  APP_ENV: import.meta.env.VITE_APP_ENV,
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
})
