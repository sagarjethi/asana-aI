import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { APIYogaPosePerformanceData } from '@/types'

const API_BASE =
    process.env.BACKEND_INTERNAL_URL ?? 'http://127.0.0.1:8080'
const COOKIE_NAME = 'aa_session'

export async function POST(request: NextRequest) {
    const body: APIYogaPosePerformanceData = await request.json()

    const token = cookies().get(COOKIE_NAME)?.value
    if (!token) {
        return NextResponse.json({ message: 'unauthenticated' }, { status: 401 })
    }

    // Translate Supabase-style payload to /api/poses/log
    const durationSeconds = Number(body.duration ?? 0)
    const accuracyAvg =
        Array.isArray(body.accuracy) && body.accuracy.length > 0
            ? body.accuracy.reduce((s: number, v: number) => s + v, 0) /
              body.accuracy.length
            : 0

    const res = await fetch(`${API_BASE}/api/poses/log`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Cookie: `${COOKIE_NAME}=${token}`,
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
            poseId: String(body.poseID ?? 'unknown'),
            accuracy: Math.min(1, Math.max(0, accuracyAvg)),
            durationMs: durationSeconds, // already ms in source
        }),
    })

    if (!res.ok) {
        return NextResponse.json(
            { message: 'error in inserting data to database' },
            { status: 500 }
        )
    }
    return NextResponse.json({ message: 'data inserted' }, { status: 200 })
}
