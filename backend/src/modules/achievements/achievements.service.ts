import { eq } from 'drizzle-orm'
import { db, schema } from '../../db/client.js'

export async function listForUser(userId: string) {
    return db
        .select()
        .from(schema.achievements)
        .where(eq(schema.achievements.userId, userId))
}

export async function unlock(userId: string, code: string) {
    const [row] = await db
        .insert(schema.achievements)
        .values({ userId, code })
        .onConflictDoNothing()
        .returning()
    return { achievement: row ?? null, alreadyUnlocked: !row }
}
