import pg from 'pg'
import { drizzle } from 'drizzle-orm/node-postgres'
import { env } from '../config/index.js'
import * as schema from './schema/index.js'

const { Pool } = pg

export const pool = new Pool({
    connectionString: env.DATABASE_URL,
})

export const db = drizzle(pool, { schema })
export { schema }
export type Db = typeof db
