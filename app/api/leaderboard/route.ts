export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'

const API_BASE =
    process.env.BACKEND_INTERNAL_URL ?? 'http://127.0.0.1:8080'

export async function GET(_req: NextRequest) {
    try {
        const res = await fetch(`${API_BASE}/api/leaderboard`, {
            cache: 'no-store',
        })
        const body = await res.json().catch(() => null)
        if (!res.ok || !body) {
            return NextResponse.json(
                { message: 'No data found' },
                { status: 404 }
            )
        }
        return NextResponse.json({ source: 'backend', ...body })
    } catch (e: any) {
        return NextResponse.json(
            { message: 'No data found', error: e?.message ?? 'fetch_failed' },
            { status: 502 }
        )
    }
}
