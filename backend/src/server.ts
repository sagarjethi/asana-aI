import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
import { health } from './routes/health.js'
import { pose } from './routes/pose.js'
import { auth } from './routes/auth.js'
import { users } from './routes/users.js'
import { poses } from './routes/poses.js'
import { leaderboard } from './routes/leaderboard.js'
import { diet } from './routes/diet.js'
import { achievements } from './routes/achievements.js'
import { dbRoutes } from './routes/db.js'

const app = express()
const PORT = Number(process.env.PORT ?? 8080)
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN ?? 'http://localhost:3000'

app.use(helmet())
app.use(
    cors({
        origin: FRONTEND_ORIGIN,
        credentials: true,
    })
)
app.use(express.json({ limit: '1mb' }))
app.use(cookieParser())
app.use(morgan('tiny'))

app.use('/health', health)
app.use('/api/pose', pose)
app.use('/api/poses', poses)
app.use('/api/auth', auth)
app.use('/api/users', users)
app.use('/api/leaderboard', leaderboard)
app.use('/api/diet', diet)
app.use('/api/achievements', achievements)
app.use('/api/db', dbRoutes)

app.use((_req, res) => res.status(404).json({ error: 'not_found' }))

app.listen(PORT, () => {
    console.log(`asanaai-backend listening on :${PORT}`)
})
