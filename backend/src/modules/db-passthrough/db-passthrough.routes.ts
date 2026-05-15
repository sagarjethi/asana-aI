import { Router } from 'express'
import { asyncHandler } from '../../common/middleware/index.js'
import { withUser } from '../auth/auth.middleware.js'
import { postPassthrough } from './db-passthrough.controller.js'

export const dbPassthroughRouter = Router()

dbPassthroughRouter.post('/', withUser, asyncHandler(postPassthrough))
