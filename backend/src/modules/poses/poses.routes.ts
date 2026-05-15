import { Router } from 'express'
import { asyncHandler } from '../../common/middleware/index.js'
import { requireAuth } from '../auth/auth.middleware.js'
import { getCatalogHandler, postLog } from './poses.controller.js'

export const posesRouter = Router()

posesRouter.post('/log', requireAuth, asyncHandler(postLog))
posesRouter.get('/catalog', getCatalogHandler)
