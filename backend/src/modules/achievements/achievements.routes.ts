import { Router } from 'express'
import { asyncHandler } from '../../common/middleware/index.js'
import { requireAuth } from '../auth/auth.middleware.js'
import { getMine, postUnlock } from './achievements.controller.js'

export const achievementsRouter = Router()

achievementsRouter.use(requireAuth)
achievementsRouter.get('/me', asyncHandler(getMine))
achievementsRouter.post('/unlock', asyncHandler(postUnlock))
