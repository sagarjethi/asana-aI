import { eq } from 'drizzle-orm'
import { db, schema } from '../../db/client.js'
import { NotFoundError } from '../../common/errors/index.js'
import type { User } from '../../db/schema/users.js'
import type { UpdateMeInput } from './users.schema.js'

type PublicUser = Pick<
    User,
    | 'id'
    | 'name'
    | 'avatarUrl'
    | 'country'
    | 'userPublicId'
    | 'profileType'
>

export async function findById(id: string): Promise<PublicUser | null> {
    const [u] = await db
        .select({
            id: schema.users.id,
            name: schema.users.name,
            avatarUrl: schema.users.avatarUrl,
            country: schema.users.country,
            userPublicId: schema.users.userPublicId,
            profileType: schema.users.profileType,
        })
        .from(schema.users)
        .where(eq(schema.users.id, id))
    return u ?? null
}

export async function updateMe(userId: string, patch: UpdateMeInput) {
    const [u] = await db
        .update(schema.users)
        .set(patch)
        .where(eq(schema.users.id, userId))
        .returning()
    if (!u) throw new NotFoundError('user_not_found')
    return u
}
