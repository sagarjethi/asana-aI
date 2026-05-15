import { cookies } from 'next/headers'
import { createShimClient } from './shimCore'

const COOKIE_NAME = 'aa_session'

/**
 * Server-side compatibility shim. Forwards the aa_session cookie via the
 * Cookie header so the backend can authenticate the request.
 */
export function createClient() {
    const cookieStore = cookies()
    const token = cookieStore.get(COOKIE_NAME)?.value
    const headers: Record<string, string> = {}
    if (token) {
        headers['Cookie'] = `${COOKIE_NAME}=${token}`
        headers['Authorization'] = `Bearer ${token}`
    }
    return createShimClient({
        fetcher: (...args) => fetch(...args),
        init: { headers, cache: 'no-store' },
        // Server-side has no implicit origin — point at the backend directly.
        baseUrl: process.env.BACKEND_INTERNAL_URL ?? 'http://127.0.0.1:8080',
    })
}
