'use client'
import { useEffect } from 'react'

/**
 * Previously created a Supabase user-db row after first OAuth login. The
 * self-hosted backend now creates the user row at /api/auth/signup time, so
 * this is a no-op kept for import-stability with existing call sites.
 */
export default function SupabasePostAuthHelper() {
    useEffect(() => {
        // no-op
    }, [])
    return <></>
}
