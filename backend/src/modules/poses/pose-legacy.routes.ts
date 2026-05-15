/**
 * Backwards-compatible alias for /api/pose so older clients keep working.
 * New consumers should use /api/poses.
 */
import { Router } from 'express'
import { asyncHandler } from '../../common/middleware/index.js'
import { requireAuth } from '../auth/auth.middleware.js'
import { getCatalogHandler, postLog } from './poses.controller.js'

export const poseLegacyRouter = Router()

poseLegacyRouter.post('/log', requireAuth, asyncHandler(postLog))
poseLegacyRouter.get('/catalog', getCatalogHandler)
