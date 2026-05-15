import { z } from 'zod'
import { PASSWORD } from '../../config/index.js'

export const signupSchema = z.object({
    email: z.string().email(),
    password: z.string().min(PASSWORD.MIN_LENGTH),
    name: z.string().optional(),
})
export type SignupInput = z.infer<typeof signupSchema>

export const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
})
export type LoginInput = z.infer<typeof loginSchema>
