/**
 * Application-wide constants.
 * Anything that's a magic number / string elsewhere in the app belongs
 * here. Per-module specifics live in `<module>/<module>.constants.ts`.
 */

export const APP = {
    NAME: 'asanaai-backend',
    VERSION: '1.0.0',
} as const

export const HTTP = {
    JSON_BODY_LIMIT: '1mb',
    REQUEST_TIMEOUT_MS: 30_000,
} as const

export const ROUTE_PREFIX = {
    HEALTH: '/health',
    AUTH: '/api/auth',
    USERS: '/api/users',
    POSES: '/api/poses',
    POSE_LEGACY: '/api/pose',
    LEADERBOARD: '/api/leaderboard',
    DIET: '/api/diet',
    ACHIEVEMENTS: '/api/achievements',
    DB_PASSTHROUGH: '/api/db',
} as const

export const COOKIE = {
    SESSION: 'aa_session',
    TTL_DAYS: 7,
    TTL_MS: 7 * 24 * 60 * 60 * 1000,
} as const

export const JWT = {
    TTL: '7d',
    ALGORITHM: 'HS256',
} as const

export const PASSWORD = {
    MIN_LENGTH: 6,
    BCRYPT_ROUNDS: 10,
} as const

export const LEADERBOARD = {
    MAX_ROWS: 100,
} as const

export const SECONDS_PER_MS = 1 / 1000
