import { Router } from 'express'
import { asyncHandler } from '../../common/middleware/index.js'
import { withUser, requireAuth } from './auth.middleware.js'
import {
    postSignup,
    postLogin,
    postLogout,
    getSession,
    getUser,
    postExchange,
} from './auth.controller.js'

export const authRouter = Router()

authRouter.post('/signup', asyncHandler(postSignup))
authRouter.post('/login', asyncHandler(postLogin))
authRouter.post('/logout', postLogout)
authRouter.get('/session', withUser, asyncHandler(getSession))
authRouter.get('/user', requireAuth, asyncHandler(getUser))
authRouter.post('/exchange', postExchange)
