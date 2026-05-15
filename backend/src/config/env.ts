import 'dotenv/config'
import { z } from 'zod'

/**
 * Centralized, type-safe runtime config.
 * Reading `env` for the first time validates the process environment
 * and crashes early with a clear message if anything is missing.
 */

const schema = z.object({
    NODE_ENV: z
        .enum(['development', 'test', 'production'])
        .default('development'),
    PORT: z.coerce.number().int().positive().default(8080),
    FRONTEND_ORIGIN: z.string().url().default('http://localhost:3000'),

    DATABASE_URL: z
        .string()
        .url()
        .default('postgres://asanaai:asanaai@localhost:5432/asanaai'),

    JWT_SECRET: z
        .string()
        .min(16, 'JWT_SECRET must be at least 16 characters')
        .default('dev-secret-change-me-dev-secret-change-me'),

    LOG_LEVEL: z
        .enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal', 'silent'])
        .default('info'),
})

const parsed = schema.safeParse(process.env)
if (!parsed.success) {
    // eslint-disable-next-line no-console
    console.error(
        '\n❌ Invalid environment configuration:\n',
        parsed.error.flatten().fieldErrors
    )
    process.exit(1)
}

export const env = parsed.data
export type Env = typeof env

export const isProd = env.NODE_ENV === 'production'
export const isDev = env.NODE_ENV === 'development'
export const isTest = env.NODE_ENV === 'test'
