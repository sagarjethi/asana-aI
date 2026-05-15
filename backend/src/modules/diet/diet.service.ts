import { and, desc, eq } from 'drizzle-orm'
import { db, schema } from '../../db/client.js'
import type { CreateDietEntryInput } from './diet.schema.js'

export async function listForUser(userId: string) {
    return db
        .select()
        .from(schema.dietEntries)
        .where(eq(schema.dietEntries.userId, userId))
        .orderBy(desc(schema.dietEntries.takenAt))
}

export async function createForUser(
    userId: string,
    input: CreateDietEntryInput
) {
    const [row] = await db
        .insert(schema.dietEntries)
        .values({ ...input, userId })
        .returning()
    return row
}

export async function deleteForUser(userId: string, entryId: string) {
    await db
        .delete(schema.dietEntries)
        .where(
            and(
                eq(schema.dietEntries.id, entryId),
                eq(schema.dietEntries.userId, userId)
            )
        )
}
