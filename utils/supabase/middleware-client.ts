import { type NextRequest, NextResponse } from 'next/server'
import { createShimClient } from './shimCore'

const COOKIE_NAME = 'aa_session'

export const createClient = (request: NextRequest) => {
    const response = NextResponse.next({
        request: { headers: request.headers },
    })
    const token = request.cookies.get(COOKIE_NAME)?.value
    const headers: Record<string, string> = {}
    if (token) {
        headers['Cookie'] = `${COOKIE_NAME}=${token}`
        headers['Authorization'] = `Bearer ${token}`
    }
    const supabase = createShimClient({
        fetcher: (...args) => fetch(...args),
        init: { headers, cache: 'no-store' },
    })
    return { supabase, response }
}
