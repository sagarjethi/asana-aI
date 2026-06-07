/**
 * Yoga Drishti — database client (node-postgres + Drizzle).
 *
 * LAZY by design: the Pool is only constructed when DATABASE_URL is present.
 * Importing this module must NEVER throw — the pilot runs in-memory when no
 * database is configured. `db` is a proxy that throws only if you actually use
 * it without a DATABASE_URL; `hasDb` lets callers branch cleanly.
 */
import { Pool } from "pg";
import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "./schema";

export { schema };

export const hasDb: boolean = Boolean(process.env.DATABASE_URL);

type DB = NodePgDatabase<typeof schema>;

let _pool: Pool | null = null;
let _db: DB | null = null;

/** Build (once) the real drizzle client. Only call when hasDb is true. */
function getDb(): DB {
  if (_db) return _db;
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL is not set — the database is unavailable. " +
        "Guard data access with `hasDb` and fall back to in-memory data.",
    );
  }
  _pool = new Pool({ connectionString: process.env.DATABASE_URL });
  _db = drizzle(_pool, { schema });
  return _db;
}

/**
 * Proxy that defers all work to the real client and only initializes the Pool
 * on first property access. Safe to import in any environment.
 */
export const db: DB = new Proxy({} as DB, {
  get(_target, prop, receiver) {
    const real = getDb();
    const value = Reflect.get(real as object, prop, receiver);
    return typeof value === "function" ? value.bind(real) : value;
  },
}) as DB;

/** Close the pool (useful in scripts/tests). No-op if never opened. */
export async function closeDb(): Promise<void> {
  if (_pool) {
    await _pool.end();
    _pool = null;
    _db = null;
  }
}
