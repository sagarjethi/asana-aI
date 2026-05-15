import type { JwtPayload } from '../../modules/auth/auth.types.js'

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Express {
        interface Request {
            user?: JwtPayload
        }
    }
}

export {}
