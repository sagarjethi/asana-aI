import { z } from 'zod'

export const unlockSchema = z.object({
    code: z.string().min(1).max(80),
})
export type UnlockInput = z.infer<typeof unlockSchema>
