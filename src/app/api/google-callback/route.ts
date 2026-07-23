import { NextResponse } from 'next/server'
import { exchangeCodeForTokens } from '@/lib/google'

/**
 * GET /api/google-callback?code=XXX
 *
 * OAuth callback endpoint. Google redirects here after the user grants
 * Calendar + Gmail permissions. We exchange the authorization code for a
 * refresh token and display it so the user can copy it into .env.local.
 *
 * This route is hit ONCE during setup. After GOOGLE_REFRESH_TOKEN is set in
 * .env.local, the onboarding flow uses it directly (this route isn't called
 * again unless the user re-runs /api/google-auth).
 */
export async function GET(req: Request) {
  const url = new URL(req.url)
  const code = url.searchParams.get('code')
  const error = url.searchParams.get('error')

  if (error) {
    return new NextResponse(renderPage({
      ok: false,
      title: 'Authorization canceled',
      message: `Google returned an error: ${error}`,
      refreshToken: null,
    }), { headers: { 'Content-Type': 'text/html; charset=utf-8' } })
  }

  if (!code) {
    return new NextResponse(renderPage({
      ok: false,
      title: 'Missing authorization code',
      message: 'No code parameter in the callback URL.',
      refreshToken: null,
    }), { headers: { 'Content-Type': 'text/html; charset=utf-8' } })
  }

  try {
    const tokens = await exchangeCodeForTokens(code)

    return new NextResponse(renderPage({
      ok: true,
      title: 'Refresh token captured',
      message: `Authorized as: ${tokens.email || '(unknown email)'}\n\nCopy the refresh token below and paste it into your .env.local file as GOOGLE_REFRESH_TOKEN, then restart the dev server.`,
      refreshToken: tokens.refreshToken,
    }), { headers: { 'Content-Type': 'text/html; charset=utf-8' } })
  } catch (err) {
    return new NextResponse(renderPage({
      ok: false,
      title: 'Token exchange failed',
      message: err instanceof Error ? err.message : 'Unknown error',
      refreshToken: null,
    }), { headers: { 'Content-Type': 'text/html; charset=utf-8' } })
  }
}

function renderPage({ ok, title, message, refreshToken }: {
  ok: boolean
  title: string
  message: string
  refreshToken: string | null
}): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Allbuild — OAuth callback</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #FAE3E3; color: #2D1B2E; padding: 40px 16px; margin: 0; }
    .card { max-width: 640px; margin: 0 auto; background: #FFFFFF; border-radius: 24px; padding: 32px; }
    h1 { margin: 0 0 8px; font-size: 24px; font-family: Georgia, serif; font-weight: 500; }
    .badge { display: inline-block; padding: 4px 10px; border-radius: 999px; font-size: 11px; font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase; margin-bottom: 16px; }
    .badge.ok { background: rgba(137, 84, 171, 0.1); color: #8954AB; }
    .badge.err { background: rgba(243, 49, 103, 0.1); color: #F33167; }
    p { font-size: 14px; line-height: 1.6; white-space: pre-wrap; margin: 0 0 16px; }
    label { display: block; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #6B4D5C; margin-bottom: 6px; }
    textarea { width: 100%; box-sizing: border-box; padding: 12px; border: 1px solid #F0D0D0; border-radius: 8px; font-family: monospace; font-size: 12px; background: #FAE3E3; color: #2D1B2E; resize: vertical; min-height: 80px; }
    .next { margin-top: 24px; padding-top: 24px; border-top: 1px solid #F0D0D0; font-size: 13px; line-height: 1.6; color: #6B4D5C; }
    .next code { background: #FAE3E3; padding: 2px 6px; border-radius: 4px; font-size: 12px; }
    a { color: #8954AB; }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge ${ok ? 'ok' : 'err'}">${ok ? '✓ Success' : '✗ Failed'}</div>
    <h1>${title}</h1>
    <p>${message}</p>
    ${refreshToken ? `
      <div style="margin-top: 24px;">
        <label>Refresh token (copy this)</label>
        <textarea readonly onclick="this.select()">${refreshToken}</textarea>
      </div>
      <div class="next">
        <strong>Next steps:</strong><br>
        1. Open <code>.env.local</code> in your project root.<br>
        2. Paste the token after <code>GOOGLE_REFRESH_TOKEN=</code><br>
        3. Restart the dev server: <code>bun run dev</code><br>
        4. Test the onboarding form — calendar event + confirmation email will now send automatically.
      </div>
    ` : ''}
  </div>
</body>
</html>`
}
