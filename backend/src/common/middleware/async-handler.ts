import type { Request, Response, NextFunction, RequestHandler } from 'express'

/**
 * Wrap an async Express handler so rejected promises flow to next(err)
 * instead of becoming silent unhandled rejections.
 */
export function asyncHandler<T extends RequestHandler>(fn: T): RequestHandler {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next)
    }
}
