import { migrate } from 'drizzle-orm/node-postgres/migrator'
import { db, pool } from './client.js'
import { logger } from '../common/utils/logger.js'

async function main() {
    logger.info('Running drizzle migrations from ./drizzle ...')
    await migrate(db, { migrationsFolder: './drizzle' })
    await pool.end()
    logger.info('Migrations complete.')
}

main().catch((err) => {
    logger.fatal({ err }, 'Migration failed')
    process.exit(1)
})
