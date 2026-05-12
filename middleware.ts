import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const COOKIE_NAME = 'aa_session'
const API_BASE =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080'

async function isAuthenticated(request: NextRequest): Promise<boolean> {
    const token = request.cookies.get(COOKIE_NAME)?.value
    if (!token) return false
    try {
        const res = await fetch(`${API_BASE}/api/auth/session`, {
            headers: {
                Cookie: `${COOKIE_NAME}=${token}`,
                Authorization: `Bearer ${token}`,
            },
            cache: 'no-store',
        })
        if (!res.ok) return false
        const body = await res.json()
        return !!body?.session
    } catch {
        return false
    }
}

export default async function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname

    if (path === '/dashboard') {
        const authed = await isAuthenticated(request)
        if (!authed) {
            return NextResponse.redirect(new URL('/login', request.nextUrl))
        }
    }

    if (path === '/login') {
        const authed = await isAuthenticated(request)
        if (authed) {
            return NextResponse.redirect(
                new URL('/dashboard', request.nextUrl)
            )
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
