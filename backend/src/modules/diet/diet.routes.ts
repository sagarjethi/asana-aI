import { Router } from 'express'
import { asyncHandler } from '../../common/middleware/index.js'
import { requireAuth } from '../auth/auth.middleware.js'
import { deleteMine, getMine, postMine } from './diet.controller.js'

export const dietRouter = Router()

dietRouter.use(requireAuth)
dietRouter.get('/me', asyncHandler(getMine))
dietRouter.post('/me', asyncHandler(postMine))
dietRouter.delete('/me/:id', asyncHandler(deleteMine))
