/**
 * Structured error hierarchy. Throw these from services; the global
 * error handler turns them into well-formed JSON responses.
 */

export class AppError extends Error {
    readonly statusCode: number
    readonly code: string
    readonly details?: unknown

    constructor(
        message: string,
        opts: { statusCode?: number; code?: string; details?: unknown } = {}
    ) {
        super(message)
        this.name = this.constructor.name
        this.statusCode = opts.statusCode ?? 500
        this.code = opts.code ?? 'internal_error'
        this.details = opts.details
        Error.captureStackTrace?.(this, this.constructor)
    }
}

export class BadRequestError extends AppError {
    constructor(message = 'bad_request', details?: unknown) {
        super(message, { statusCode: 400, code: 'bad_request', details })
    }
}

export class UnauthorizedError extends AppError {
    constructor(message = 'unauthenticated') {
        super(message, { statusCode: 401, code: 'unauthenticated' })
    }
}

export class ForbiddenError extends AppError {
    constructor(message = 'forbidden') {
        super(message, { statusCode: 403, code: 'forbidden' })
    }
}

export class NotFoundError extends AppError {
    constructor(message = 'not_found') {
        super(message, { statusCode: 404, code: 'not_found' })
    }
}

export class ConflictError extends AppError {
    constructor(message = 'conflict', details?: unknown) {
        super(message, { statusCode: 409, code: 'conflict', details })
    }
}

export class GoneError extends AppError {
    constructor(message = 'gone') {
        super(message, { statusCode: 410, code: 'gone' })
    }
}

export class ValidationError extends BadRequestError {
    constructor(details: unknown, message = 'invalid_body') {
        super(message, details)
    }
}
