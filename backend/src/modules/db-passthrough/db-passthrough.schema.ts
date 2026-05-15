import { z } from 'zod'

export const passthroughSchema = z.object({
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
export type PassthroughInput = z.infer<typeof passthroughSchema>
export type Filter = NonNullable<PassthroughInput['filters']>[number]
