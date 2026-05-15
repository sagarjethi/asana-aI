import type { ErrorRequestHandler, RequestHandler } from 'express'
import { ZodError } from 'zod'
import { AppError } from '../errors/index.js'
import { logger } from '../utils/logger.js'
import { isProd } from '../../config/index.js'

/**
 * Catch-all error handler. Sits at the end of the middleware chain.
 */
export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
    if (err instanceof ZodError) {
        return res.status(400).json({
            error: 'invalid_body',
            issues: err.issues,
        })
    }

    if (err instanceof AppError) {
        if (err.statusCode >= 500) {
            logger.error({ err, path: req.path }, 'app_error_5xx')
        } else {
            logger.warn(
                { code: err.code, path: req.path, msg: err.message },
                'app_error'
            )
        }
        return res.status(err.statusCode).json({
            error: err.code,
            message: err.message,
            details: err.details ?? undefined,
        })
    }

    logger.error({ err, path: req.path }, 'unhandled_error')
    return res.status(500).json({
        error: 'internal_error',
        message: isProd
            ? 'Something went wrong.'
            : (err as Error)?.message ?? 'unknown',
    })
}

/**
 * 404 fallthrough — last route handler.
 */
export const notFoundHandler: RequestHandler = (req, res) => {
    res.status(404).json({ error: 'not_found', path: req.path })
}
