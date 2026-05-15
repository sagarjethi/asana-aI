import { z } from 'zod'

export const updateMeSchema = z.object({
    name: z.string().min(1).max(80).optional(),
    avatarUrl: z.string().max(255).optional(),
    country: z.string().length(2).nullable().optional(),
    profileType: z.enum(['public', 'private']).optional(),
})
export type UpdateMeInput = z.infer<typeof updateMeSchema>
