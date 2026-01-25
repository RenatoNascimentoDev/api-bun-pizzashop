import { config } from 'dotenv'
import { z } from 'zod'

config({ path: '.env' })
config({ path: '.env.local', override: true })

const envSchema = z.object({
  API_BASE_URL: z.string().url().min(1),
  AUTH_REDIRECT_URL: z.string().url().min(1),
  DATABASE_URL: z.string().url().min(1),
})

export const env = envSchema.parse({
  API_BASE_URL: process.env.API_BASE_URL,
  AUTH_REDIRECT_URL: process.env.AUTH_REDIRECT_URL,
  DATABASE_URL: process.env.DATABASE_URL,
})
