import { and, eq } from 'drizzle-orm'
import { db } from '../../db/client.js'
import { BadRequestError } from '../../common/errors/index.js'
import { ALLOWED_TABLES, type TableSpec } from './db-passthrough.constants.js'
import type { Filter, PassthroughInput } from './db-passthrough.schema.js'

function buildWhere(spec: TableSpec, filters: Filter[]) {
    const conds = filters
        .map((f) => {
            const col = spec.cols[f.column]
            return col ? eq(col, f.value) : null
        })
        .filter(Boolean) as any[]
    if (conds.length === 0) return undefined
    return conds.length === 1 ? conds[0] : and(...conds)
}

export interface PassthroughResult {
    data: any
    error: { message: string } | null
}

export async function runPassthrough(
    input: PassthroughInput
): Promise<PassthroughResult> {
    const spec = ALLOWED_TABLES[input.table]
    if (!spec) {
        throw new BadRequestError('table_not_allowed', { table: input.table })
    }

    // Short-circuit for the unbacked food-data table.
    if (spec.table === null) {
        if (input.op === 'select') return { data: [], error: null }
        return { data: null, error: null }
    }

    const where = buildWhere(spec, input.filters ?? [])

    switch (input.op) {
        case 'select': {
            const q = where
                ? db.select().from(spec.table).where(where)
                : db.select().from(spec.table)
            const rows = await q
            return {
                data: input.single ? (rows[0] ?? null) : rows,
                error: null,
            }
        }

        case 'insert': {
            const rows = await db
                .insert(spec.table)
                .values(input.values)
                .returning()
            return { data: rows, error: null }
        }

        case 'update': {
            if (!where) {
                throw new BadRequestError('update_requires_filter')
            }
            const rows = (await db
                .update(spec.table)
                .set(input.values)
                .where(where)
                .returning()) as any[]
            return {
                data: input.single ? (rows[0] ?? null) : rows,
                error: null,
            }
        }

        case 'delete': {
            if (!where) {
                throw new BadRequestError('delete_requires_filter')
            }
            await db.delete(spec.table).where(where)
            return { data: null, error: null }
        }
    }
}
