/**
 * Process entrypoint. Reads env, builds the Express app, listens, and
 * wires graceful shutdown.
 */
import { createApp } from './app.js'
import { env } from './config/index.js'
import { logger } from './common/utils/logger.js'
import { pool } from './db/client.js'

async function main() {
    const app = createApp()

    const server = app.listen(env.PORT, () => {
        logger.info(
            { port: env.PORT, env: env.NODE_ENV },
            'asanaai-backend listening'
        )
    })

    const shutdown = async (signal: string) => {
        logger.info({ signal }, 'shutting down')
        server.close(() => logger.info('http server closed'))
        try {
            await pool.end()
            logger.info('pg pool closed')
        } catch (err) {
            logger.error({ err }, 'pg pool close failed')
        }
        process.exit(0)
    }

    process.on('SIGINT', () => void shutdown('SIGINT'))
    process.on('SIGTERM', () => void shutdown('SIGTERM'))
}

main().catch((err) => {
    logger.fatal({ err }, 'failed to start')
    process.exit(1)
})
