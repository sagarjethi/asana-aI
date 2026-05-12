/**
 * Generic table passthrough for the Supabase-shim compatibility layer.
 * Only a small allowlist of logical table names is permitted; each maps to
 * a real Drizzle table. The shim sends raw filters / column updates, we
 * translate to Drizzle queries.
 */
import { Router } from 'express'
import { z } from 'zod'
import { and, eq, sql } from 'drizzle-orm'
import { db, schema } from '../db/client.js'
import { withUser } from '../auth/middleware.js'

export const dbRoutes = Router()

type Op = 'select' | 'insert' | 'update' | 'delete'

interface Filter {
    column: string
    value?: any
}

// Allowlist + column mapping. The frontend used Supabase tables with
// kebab-case names; we expose those as the public table id.
const TABLES: Record<
    string,
    {
        table: any
        // Column alias -> drizzle column path
        cols: Record<string, any>
    }
> = {
    'user-db': {
        table: schema.users,
        cols: {
            id: schema.users.id,
            userID: schema.users.id, // md5 used to be the lookup key; we now treat it as plain id
            email: schema.users.email,
            name: schema.users.name,
            profile_pic: schema.users.avatarUrl,
            avatar_url: schema.users.avatarUrl,
            country: schema.users.country,
            profile_type: schema.users.profileType,
            user_public_id: schema.users.userPublicId,
            created_at: schema.users.createdAt,
        },
    },
    'pose-performance-data': {
        table: schema.posePerformance,
        cols: {
            id: schema.posePerformance.id,
            userID: schema.posePerformance.userId,
            user_id: schema.posePerformance.userId,
            poseID: schema.posePerformance.poseId,
            pose_id: schema.posePerformance.poseId,
            week_start: schema.posePerformance.weekStart,
            totalSeconds: schema.posePerformance.totalSeconds,
            duration: schema.posePerformance.totalSeconds,
            accuracy: schema.posePerformance.avgAccuracy,
        },
    },
    'pose-logs': {
        table: schema.poseLogs,
        cols: {
            id: schema.poseLogs.id,
            userID: schema.poseLogs.userId,
            user_id: schema.poseLogs.userId,
            poseID: schema.poseLogs.poseId,
            pose_id: schema.poseLogs.poseId,
            accuracy: schema.poseLogs.accuracy,
            duration_ms: schema.poseLogs.durationMs,
            created_at: schema.poseLogs.createdAt,
        },
    },
    'food-data': {
        // No physical food table; return empty data sets so the diet UI doesn't crash.
        table: null as any,
        cols: {},
    },
}

const reqSchema = z.object({
    table: z.string(),
    op: z.enum(['select', 'insert', 'update', 'delete']),
    columns: z.string().optional(),
    filters: z
        .array(z.object({ column: z.string(), value: z.any() }))
        .optional()
        .default([]),
    values: z.any().optional(),
    single: z.boolean().optional(),
})

function buildWhere(spec: (typeof TABLES)[string], filters: Filter[]) {
    const conds = filters
        .map((f) => {
            const col = spec.cols[f.column]
            if (!col) return null
            return eq(col, f.value)
        })
        .filter(Boolean) as any[]
    if (conds.length === 0) return undefined
    return conds.length === 1 ? conds[0] : and(...conds)
}

dbRoutes.post('/', withUser, async (req, res) => {
    const parsed = reqSchema.safeParse(req.body)
    if (!parsed.success)
        return res
            .status(400)
            .json({ error: 'invalid_body', issues: parsed.error.issues })
    const { table, op, filters, values, single } = parsed.data
    const spec = TABLES[table]
    if (!spec)
        return res.status(400).json({ error: 'table_not_allowed', table })

    // food-data short-circuit (no backing storage)
    if (spec.table === null) {
        if (op === 'select') return res.json({ data: [], error: null })
        return res.json({ data: null, error: null })
    }

    try {
        if (op === 'select') {
            const where = buildWhere(spec, filters)
            let q: any = db.select().from(spec.table)
            if (where) q = q.where(where)
            const rows = await q
            if (single) return res.json({ data: rows[0] ?? null, error: null })
            return res.json({ data: rows, error: null })
        }
        if (op === 'insert') {
            const inserted = await db
                .insert(spec.table)
                .values(values)
                .returning()
            return res.json({ data: inserted, error: null })
        }
        if (op === 'update') {
            const where = buildWhere(spec, filters)
            if (!where)
                return res
                    .status(400)
                    .json({ error: 'update_requires_filter' })
            const out = (await db
                .update(spec.table)
                .set(values)
                .where(where)
                .returning()) as any[]
            if (single) return res.json({ data: out[0] ?? null, error: null })
            return res.json({ data: out, error: null })
        }
        if (op === 'delete') {
            const where = buildWhere(spec, filters)
            if (!where)
                return res
                    .status(400)
                    .json({ error: 'delete_requires_filter' })
            await db.delete(spec.table).where(where)
            return res.json({ data: null, error: null })
        }
        return res.status(400).json({ error: 'unknown_op' })
    } catch (err: any) {
        return res
            .status(500)
            .json({ data: null, error: { message: err?.message ?? 'db_error' } })
    }
})

void sql
