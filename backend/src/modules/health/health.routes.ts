import { Router } from 'express'
import { asyncHandler } from '../../common/middleware/index.js'
import { getLiveness, getReadiness } from './health.controller.js'

export const healthRouter = Router()

healthRouter.get('/', getLiveness)
healthRouter.get('/ready', asyncHandler(getReadiness))
