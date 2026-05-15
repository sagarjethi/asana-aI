import type { User } from '../../db/schema/users.js'

export interface JwtPayload {
    sub: string
    email: string
}

export interface SessionUser {
    id: string
    email: string
    user_metadata: { name: string }
    created_at: string
}

export interface AuthResult {
    token: string
    user: SessionUser
}

export function toSessionUser(u: User): SessionUser {
    return {
        id: u.id,
        email: u.email,
        user_metadata: { name: u.name ?? '' },
        created_at: u.createdAt.toISOString(),
    }
}
