import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import type { CookieOptions } from 'express'
import { eq } from 'drizzle-orm'
import { db, schema } from '../../db/client.js'
import { COOKIE, JWT, PASSWORD, env, isProd } from '../../config/index.js'
import {
    ConflictError,
    UnauthorizedError,
} from '../../common/errors/index.js'
import { AUTH_ERRORS } from './auth.constants.js'
import type { JwtPayload, AuthResult } from './auth.types.js'
import { toSessionUser } from './auth.types.js'
import type { SignupInput, LoginInput } from './auth.schema.js'

/* ----------------------------- crypto helpers ----------------------------- */

export async function hashPassword(plain: string) {
    return bcrypt.hash(plain, PASSWORD.BCRYPT_ROUNDS)
}

export async function verifyPassword(plain: string, hash: string) {
    return bcrypt.compare(plain, hash)
}

/* ------------------------------ JWT helpers ------------------------------ */

export function issueToken(payload: JwtPayload): string {
    return jwt.sign(payload, env.JWT_SECRET, {
        expiresIn: JWT.TTL,
        algorithm: JWT.ALGORITHM,
    })
}

export function verifyToken(token: string): JwtPayload | null {
    try {
        const decoded = jwt.verify(token, env.JWT_SECRET, {
            algorithms: [JWT.ALGORITHM],
        }) as JwtPayload
        return { sub: decoded.sub, email: decoded.email }
    } catch {
        return null
    }
}

/* ----------------------------- cookie options ---------------------------- */

export function sessionCookieOptions(): CookieOptions {
    return {
        httpOnly: true,
        secure: isProd,
        sameSite: 'lax',
        path: '/',
        maxAge: COOKIE.TTL_MS,
    }
}

/* --------------------------- business operations ------------------------- */

export async function signup(input: SignupInput): Promise<AuthResult> {
    const existing = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.email, input.email))

    if (existing.length > 0) {
        throw new ConflictError(AUTH_ERRORS.EMAIL_TAKEN)
    }

    const passwordHash = await hashPassword(input.password)
    const [u] = await db
        .insert(schema.users)
        .values({
            email: input.email,
            passwordHash,
            name: input.name,
        })
        .returning()

    const token = issueToken({ sub: u.id, email: u.email })
    return { token, user: toSessionUser(u) }
}

export async function login(input: LoginInput): Promise<AuthResult> {
    const [u] = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.email, input.email))

    if (!u) throw new UnauthorizedError(AUTH_ERRORS.INVALID_CREDENTIALS)

    const ok = await verifyPassword(input.password, u.passwordHash)
    if (!ok) throw new UnauthorizedError(AUTH_ERRORS.INVALID_CREDENTIALS)

    const token = issueToken({ sub: u.id, email: u.email })
    return { token, user: toSessionUser(u) }
}

export async function getSessionUser(userId: string) {
    const [u] = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.id, userId))
    return u ? toSessionUser(u) : null
}
