import { z } from 'zod'

export const createDietEntrySchema = z.object({
    mealId: z.string().min(1),
    calories: z.number().int().nonnegative().optional(),
    notes: z.string().max(500).optional(),
})
export type CreateDietEntryInput = z.infer<typeof createDietEntrySchema>
