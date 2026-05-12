import type { Request, Response, NextFunction } from 'express'
import { COOKIE_NAME, verifyToken, type JwtPayload } from './service.js'

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Express {
        interface Request {
            user?: JwtPayload
        }
    }
}

function extractToken(req: Request): string | null {
    const cookieToken = (req as any).cookies?.[COOKIE_NAME]
    if (cookieToken) return cookieToken
    const auth = req.headers.authorization
    if (auth?.startsWith('Bearer ')) return auth.slice(7)
    return null
}

export function withUser(req: Request, _res: Response, next: NextFunction) {
    const token = extractToken(req)
    if (token) {
        const payload = verifyToken(token)
        if (payload) req.user = payload
    }
    next()
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
    const token = extractToken(req)
    if (!token) return res.status(401).json({ error: 'unauthenticated' })
    const payload = verifyToken(token)
    if (!payload) return res.status(401).json({ error: 'invalid_token' })
    req.user = payload
    next()
}
