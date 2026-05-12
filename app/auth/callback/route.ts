import { NextResponse } from 'next/server'

/**
 * Legacy OAuth callback. Self-hosted backend uses email+password only.
 * This route remains so any cached redirect_to URLs return a polite 410.
 */
export async function GET(request: Request) {
    const { origin } = new URL(request.url)
    return NextResponse.redirect(
        `${origin}/login?message=OAuth+is+no+longer+supported.+Please+log+in+with+email+and+password.`
    )
}
