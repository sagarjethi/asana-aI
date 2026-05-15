/**
 * Express application factory. Pure — no `app.listen()` here so it can
 * be imported by tests and serverless adapters alike.
 */
import express, { type Express } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'

import { env, HTTP, ROUTE_PREFIX } from './config/index.js'
import {
    errorHandler,
    notFoundHandler,
    requestLogger,
} from './common/middleware/index.js'

import { healthRouter } from './modules/health/index.js'
import { authRouter } from './modules/auth/index.js'
import { usersRouter } from './modules/users/index.js'
import { posesRouter } from './modules/poses/index.js'
import { poseLegacyRouter } from './modules/poses/pose-legacy.routes.js'
import { leaderboardRouter } from './modules/leaderboard/index.js'
import { dietRouter } from './modules/diet/index.js'
import { achievementsRouter } from './modules/achievements/index.js'
import { dbPassthroughRouter } from './modules/db-passthrough/index.js'

export function createApp(): Express {
    const app = express()

    /* Infra middleware ---------------------------------------------------- */
    app.disable('x-powered-by')
    app.set('trust proxy', 1)
    app.use(helmet())
    app.use(
        cors({
            origin: env.FRONTEND_ORIGIN,
            credentials: true,
        })
    )
    app.use(express.json({ limit: HTTP.JSON_BODY_LIMIT }))
    app.use(cookieParser())
    app.use(requestLogger)

    /* Feature routers ----------------------------------------------------- */
    app.use(ROUTE_PREFIX.HEALTH, healthRouter)
    app.use(ROUTE_PREFIX.AUTH, authRouter)
    app.use(ROUTE_PREFIX.USERS, usersRouter)
    app.use(ROUTE_PREFIX.POSES, posesRouter)
    app.use(ROUTE_PREFIX.POSE_LEGACY, poseLegacyRouter)
    app.use(ROUTE_PREFIX.LEADERBOARD, leaderboardRouter)
    app.use(ROUTE_PREFIX.DIET, dietRouter)
    app.use(ROUTE_PREFIX.ACHIEVEMENTS, achievementsRouter)
    app.use(ROUTE_PREFIX.DB_PASSTHROUGH, dbPassthroughRouter)

    /* Tail: 404 + global error handler ----------------------------------- */
    app.use(notFoundHandler)
    app.use(errorHandler)

    return app
}
