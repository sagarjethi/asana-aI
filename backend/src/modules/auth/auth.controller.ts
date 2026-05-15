import type { Request, Response } from 'express'
import { COOKIE } from '../../config/index.js'
import { GoneError, NotFoundError } from '../../common/errors/index.js'
import { AUTH_ERRORS } from './auth.constants.js'
import { signupSchema, loginSchema } from './auth.schema.js'
import {
    getSessionUser,
    login,
    sessionCookieOptions,
    signup,
} from './auth.service.js'

export async function postSignup(req: Request, res: Response) {
    const input = signupSchema.parse(req.body)
    const result = await signup(input)
    res.cookie(COOKIE.SESSION, result.token, sessionCookieOptions())
    res.status(201).json(result)
}

export async function postLogin(req: Request, res: Response) {
    const input = loginSchema.parse(req.body)
    const result = await login(input)
    res.cookie(COOKIE.SESSION, result.token, sessionCookieOptions())
    res.json(result)
}

export function postLogout(_req: Request, res: Response) {
    res.clearCookie(COOKIE.SESSION, { path: '/' })
    res.json({ ok: true })
}

export async function getSession(req: Request, res: Response) {
    if (!req.user) return res.json({ session: null, user: null })
    const user = await getSessionUser(req.user.sub)
    if (!user) return res.json({ session: null, user: null })
    res.json({ session: { user, expires_at: null }, user })
}

export async function getUser(req: Request, res: Response) {
    const user = await getSessionUser(req.user!.sub)
    if (!user) throw new NotFoundError('user_not_found')
    res.json({ user })
}

export function postExchange(_req: Request, _res: Response) {
    throw new GoneError(AUTH_ERRORS.OAUTH_DEPRECATED)
}
