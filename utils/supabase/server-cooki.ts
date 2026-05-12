import { createShimClient } from './shimCore'

const COOKIE_NAME = 'aa_session'

export function createClientCookie(cookieStore: any) {
    const token = cookieStore?.get?.(COOKIE_NAME)?.value
    const headers: Record<string, string> = {}
    if (token) {
        headers['Cookie'] = `${COOKIE_NAME}=${token}`
        headers['Authorization'] = `Bearer ${token}`
    }
    return createShimClient({
        fetcher: (...args) => fetch(...args),
        init: { headers, cache: 'no-store' },
    })
}
