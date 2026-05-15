import type { Request, Response, NextFunction } from 'express'
import { COOKIE } from '../../config/index.js'
import { UnauthorizedError } from '../../common/errors/index.js'
import { AUTH_ERRORS } from './auth.constants.js'
import { verifyToken } from './auth.service.js'

function extractToken(req: Request): string | null {
    const cookieToken = (req as any).cookies?.[COOKIE.SESSION]
    if (cookieToken) return cookieToken
    const auth = req.headers.authorization
    if (auth?.startsWith('Bearer ')) return auth.slice(7)
    return null
}

/**
 * Soft auth: populates req.user when a valid token is present, never fails.
 */
export function withUser(req: Request, _res: Response, next: NextFunction) {
    const token = extractToken(req)
    if (token) {
        const payload = verifyToken(token)
        if (payload) req.user = payload
    }
    next()
}

/**
 * Hard auth: requires a valid session, otherwise 401.
 */
export function requireAuth(req: Request, _res: Response, next: NextFunction) {
    const token = extractToken(req)
    if (!token) return next(new UnauthorizedError())
    const payload = verifyToken(token)
    if (!payload) return next(new UnauthorizedError(AUTH_ERRORS.INVALID_TOKEN))
    req.user = payload
    next()
}
