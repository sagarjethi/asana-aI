import { NextResponse, type NextRequest } from 'next/server'

/**
 * No-op stand-in for Supabase's session refresh middleware helper. The new
 * backend issues a JWT cookie that doesn't need refreshing on each request.
 */
export async function updateSession(request: NextRequest) {
    return NextResponse.next({
        request: { headers: request.headers },
    })
}
