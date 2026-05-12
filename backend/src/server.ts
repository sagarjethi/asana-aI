import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import { health } from './routes/health.js'
import { pose } from './routes/pose.js'

const app = express()
const PORT = Number(process.env.PORT ?? 8080)
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN ?? '*'

app.use(helmet())
app.use(cors({ origin: FRONTEND_ORIGIN }))
app.use(express.json({ limit: '1mb' }))
app.use(morgan('tiny'))

app.use('/health', health)
app.use('/api/pose', pose)

app.use((_req, res) => res.status(404).json({ error: 'not_found' }))

app.listen(PORT, () => {
    console.log(`asanaai-backend listening on :${PORT}`)
})
