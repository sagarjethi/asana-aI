import { eq } from 'drizzle-orm'
import { db, pool, schema } from './client.js'
import { hashPassword } from '../modules/auth/auth.service.js'
import { logger } from '../common/utils/logger.js'

const TEST_USER = {
    email: 'test@asanaai.local',
    password: 'test1234',
    name: 'Test User',
    avatarUrl: 'animal-1',
    country: 'IN',
    userPublicId: 'test01',
} as const

const SEED_POSES = [
    { poseId: 'tadasana', totalSeconds: 240, avgAccuracy: '0.91' },
    { poseId: 'vrikshasana', totalSeconds: 180, avgAccuracy: '0.84' },
] as const

function currentWeekStartISO() {
    const d = new Date()
    d.setUTCDate(d.getUTCDate() - d.getUTCDay())
    return d.toISOString().slice(0, 10)
}

async function main() {
    const existing = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.email, TEST_USER.email))

    let userId: string
    if (existing.length === 0) {
        const passwordHash = await hashPassword(TEST_USER.password)
        const [u] = await db
            .insert(schema.users)
            .values({
                email: TEST_USER.email,
                passwordHash,
                name: TEST_USER.name,
                avatarUrl: TEST_USER.avatarUrl,
                country: TEST_USER.country,
                userPublicId: TEST_USER.userPublicId,
            })
            .returning()
        userId = u.id
        logger.info({ email: TEST_USER.email }, 'seeded test user')
    } else {
        userId = existing[0].id
        logger.info({ email: TEST_USER.email }, 'test user already present')
    }

    const weekStart = currentWeekStartISO()
    for (const p of SEED_POSES) {
        await db
            .insert(schema.posePerformance)
            .values({ userId, weekStart, ...p })
            .onConflictDoNothing()
        await db.insert(schema.poseLogs).values({
            userId,
            poseId: p.poseId,
            accuracy: p.avgAccuracy,
            durationMs: p.totalSeconds * 1000,
        })
    }
    logger.info({ count: SEED_POSES.length }, 'seeded pose data')

    await pool.end()
}

main().catch((err) => {
    logger.fatal({ err }, 'seed failed')
    process.exit(1)
})
