import { NextResponse } from 'next/server'
import { getAuthUrl } from '@/lib/google'

/**
 * GET /api/google-auth
 *
 * Starts the Google OAuth flow. Redirects the visitor to Google's consent
 * screen where they sign in as sales@massapro.com and grant Calendar + Gmail
 * permissions to this app. After consent, Google redirects to
 * /api/google-callback which captures the refresh token.
 *
 * Run this ONCE during setup. After the refresh token is captured and added
 * to .env.local, this route can be left in place (harmless) or removed.
 */
export async function GET() {
  try {
    const url = getAuthUrl()
    return NextResponse.redirect(url)
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : 'OAuth setup failed' },
      { status: 500 }
    )
  }
}
