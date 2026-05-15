import { Router } from 'express'
import { asyncHandler } from '../../common/middleware/index.js'
import { getBoard } from './leaderboard.controller.js'

export const leaderboardRouter = Router()

leaderboardRouter.get('/', asyncHandler(getBoard))
