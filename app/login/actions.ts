'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

const API_BASE =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080'
const COOKIE_NAME = 'aa_session'

interface AuthResult {
    ok: boolean
    error?: string
}

async function authFetch(path: string, payload: any): Promise<AuthResult> {
    try {
        const res = await fetch(`${API_BASE}${path}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            cache: 'no-store',
        })
        const body = await res.json().catch(() => ({}))
        if (!res.ok) {
            return { ok: false, error: body?.error ?? 'auth_failed' }
        }
        if (body?.token) {
            cookies().set(COOKIE_NAME, body.token, {
                httpOnly: true,
                sameSite: 'lax',
                path: '/',
                maxAge: 7 * 24 * 60 * 60,
                secure: process.env.NODE_ENV === 'production',
            })
        }
        return { ok: true }
    } catch (e: any) {
        return { ok: false, error: e?.message ?? 'network_error' }
    }
}

export async function signIn(formData: FormData) {
    const email = String(formData.get('email') ?? '')
    const password = String(formData.get('password') ?? '')
    const result = await authFetch('/api/auth/login', { email, password })
    if (!result.ok) {
        redirect(
            `/login?message=${encodeURIComponent(result.error ?? 'Login failed')}`
        )
    }
    redirect('/dashboard')
}

export async function signUp(formData: FormData) {
    const email = String(formData.get('email') ?? '')
    const password = String(formData.get('password') ?? '')
    const name = String(formData.get('name') ?? '')
    const result = await authFetch('/api/auth/signup', {
        email,
        password,
        name,
    })
    if (!result.ok) {
        redirect(
            `/login?message=${encodeURIComponent(result.error ?? 'Signup failed')}`
        )
    }
    redirect('/dashboard')
}

/**
 * Legacy OAuth entry point — preserved as a server action so existing imports
 * keep working. Self-hosted backend has no OAuth provider configured; redirect
 * back to /login with a message.
 */
export async function oAuthSignIn(_provider: string) {
    redirect('/login?message=OAuth+is+not+configured.+Use+email+and+password.')
}
