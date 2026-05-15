import { Router } from 'express'
import { asyncHandler } from '../../common/middleware/index.js'
import { requireAuth } from '../auth/auth.middleware.js'
import { getById, patchMe } from './users.controller.js'

export const usersRouter = Router()

// PATCH /me must be declared before /:id to avoid being shadowed.
usersRouter.patch('/me', requireAuth, asyncHandler(patchMe))
usersRouter.get('/:id', asyncHandler(getById))
