import 'dotenv/config'
import { db, pool, schema } from './client.js'
import { hashPassword } from '../auth/service.js'
import { eq } from 'drizzle-orm'

async function main() {
    const email = 'test@asanaai.local'
    const existing = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.email, email))
    let userId: string
    if (existing.length === 0) {
        const passwordHash = await hashPassword('test1234')
        const [u] = await db
            .insert(schema.users)
            .values({
                email,
                passwordHash,
                name: 'Test User',
                avatarUrl: 'animal-1',
                country: 'IN',
                userPublicId: 'test01',
            })
            .returning()
        userId = u.id
        console.log('Seeded user', email)
    } else {
        userId = existing[0].id
        console.log('User already exists', email)
    }

    const weekStart = new Date()
    weekStart.setDate(weekStart.getDate() - weekStart.getDay())
    const weekStartISO = weekStart.toISOString().slice(0, 10)

    const poses = [
        { poseId: 'tadasana', totalSeconds: 240, avgAccuracy: '0.91' },
        { poseId: 'vrikshasana', totalSeconds: 180, avgAccuracy: '0.84' },
    ]
    for (const p of poses) {
        await db
            .insert(schema.posePerformance)
            .values({ userId, weekStart: weekStartISO, ...p })
            .onConflictDoNothing()
        await db.insert(schema.poseLogs).values({
            userId,
            poseId: p.poseId,
            accuracy: p.avgAccuracy,
            durationMs: p.totalSeconds * 1000,
        })
    }
    console.log('Seeded pose data.')
    await pool.end()
}

main().catch((err) => {
    console.error(err)
    process.exit(1)
})
