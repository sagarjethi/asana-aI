import type { Request, Response } from 'express'
import { getWeeklyBoard } from './leaderboard.service.js'

export async function getBoard(_req: Request, res: Response) {
    const board = await getWeeklyBoard()
    res.json(board)
}
