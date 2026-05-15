import { z } from 'zod'

export const logPoseSchema = z.object({
    poseId: z.string().min(1).max(80),
    accuracy: z.number().min(0).max(1),
    durationMs: z.number().int().nonnegative(),
})
export type LogPoseInput = z.infer<typeof logPoseSchema>
