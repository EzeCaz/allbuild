import { google } from 'googleapis'

/**
 * Google integration helpers for Allbuild onboarding.
 *
 * Responsibilities:
 *   1. Build OAuth URL for one-time authorization
 *   2. Exchange authorization code for refresh token (one-time setup)
 *   3. Create a Calendar event with Google Meet conference
 *   4. Send a confirmation email from sales@massapro.com via Gmail
 *
 * Required env vars (see .env.local):
 *   GOOGLE_CLIENT_ID
 *   GOOGLE_CLIENT_SECRET
 *   GOOGLE_REDIRECT_URI
 *   GOOGLE_REFRESH_TOKEN  (captured once via /api/google-auth → /api/google-callback)
 *   GOOGLE_CALENDAR_ID     (sales@massapro.com)
 */

export const GOOGLE_SCOPES = [
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/gmail.send',
  'openid',
  'email',
  'profile',
]

type GoogleEnv = {
  clientId: string
  clientSecret: string
  redirectUri: string
  refreshToken?: string
  calendarId: string
}

function getEnv(): GoogleEnv {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  const redirectUri = process.env.GOOGLE_REDIRECT_URI
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN
  const calendarId = process.env.GOOGLE_CALENDAR_ID || 'sales@massapro.com'

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error(
      'Missing Google OAuth env vars. Set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI in .env.local'
    )
  }

  return { clientId, clientSecret, redirectUri, refreshToken, calendarId }
}

/** True if Google integration is fully configured (refresh token present). */
export function isGoogleConfigured(): boolean {
  try {
    const env = getEnv()
    return !!env.refreshToken
  } catch {
    return false
  }
}

/** Build the OAuth URL the user visits once to grant Calendar + Gmail access. */
export function getAuthUrl(): string {
  const env = getEnv()
  const oauth2Client = new google.auth.OAuth2(
    env.clientId,
    env.clientSecret,
    env.redirectUri
  )
  return oauth2Client.generateAuthUrl({
    access_type: 'offline', // required to get a refresh_token
    prompt: 'consent',      // force consent screen so we always get a fresh refresh_token
    scope: GOOGLE_SCOPES,
  })
}

/**
 * Exchange an authorization code for tokens. Called by /api/google-callback.
 * Returns the refresh_token (which the user pastes into .env.local once).
 */
export async function exchangeCodeForTokens(code: string): Promise<{
  refreshToken: string | null
  accessToken: string
  expiryDate: number
  email?: string
}> {
  const env = getEnv()
  const oauth2Client = new google.auth.OAuth2(
    env.clientId,
    env.clientSecret,
    env.redirectUri
  )
  const { tokens } = await oauth2Client.getToken(code)
  if (!tokens.refresh_token) {
    throw new Error(
      'No refresh_token returned. Revoke app access at https://myaccount.google.com/permissions and try again — Google only returns refresh_token on first consent.'
    )
  }
  // Get the email address of the authorized account
  let email: string | undefined
  if (tokens.id_token) {
    try {
      const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client })
      const userinfo = await oauth2.userinfo.get()
      email = userinfo.data.email || undefined
    } catch {
      // non-fatal
    }
  }
  return {
    refreshToken: tokens.refresh_token,
    accessToken: tokens.access_token || '',
    expiryDate: tokens.expiry_date || 0,
    email,
  }
}

/** Build an authenticated OAuth2 client using the stored refresh token. */
function getAuthenticatedClient() {
  const env = getEnv()
  if (!env.refreshToken) {
    throw new Error('GOOGLE_REFRESH_TOKEN not set. Complete the OAuth flow at /api/google-auth first.')
  }
  const oauth2Client = new google.auth.OAuth2(
    env.clientId,
    env.clientSecret,
    env.redirectUri
  )
  oauth2Client.setCredentials({ refresh_token: env.refreshToken })
  return oauth2Client
}

// ====================================================================
//  CALENDAR — create event with Google Meet
// ====================================================================

export type BookingDetails = {
  firstName: string
  lastName: string
  email: string
  businessUrl?: string
  date: string      // yyyy-mm-dd
  ukStartHour: number  // 9, 11, 14, or 15
  ukEndHour: number    // 11, 13, 16, or 17
  ukSlotLabel: string  // "09:00–11:00 UK"
  userLocalLabel: string  // local time equivalent
}

/**
 * Convert a UK date + hour into a UTC ISO string.
 * Handles BST/GMT automatically by using Intl.DateTimeFormat on Europe/London.
 */
function ukHourToUtcIso(dateStr: string, ukHour: number): string {
  // Build a tentative UTC instant at the given hour
  const baseUtc = new Date(`${dateStr}T${String(ukHour).padStart(2, '0')}:00:00Z`)
  // Find London's offset for that instant (in minutes)
  const londonParts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Europe/London',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: false,
  }).formatToParts(baseUtc)
  const partMap: Record<string, string> = {}
  for (const p of londonParts) partMap[p.type] = p.value
  // Construct what London local time LOOKS like at this instant
  const londonLocalMs = Date.UTC(
    parseInt(partMap.year, 10),
    parseInt(partMap.month, 10) - 1,
    parseInt(partMap.day, 10),
    parseInt(partMap.hour, 10) === 24 ? 0 : parseInt(partMap.hour, 10),
    parseInt(partMap.minute, 10)
  )
  // The difference between baseUtc and londonLocalMs is London's offset
  const londonOffsetMs = londonLocalMs - baseUtc.getTime()
  // To get the actual UTC instant for "ukHour:00 London", subtract the offset
  return new Date(baseUtc.getTime() - londonOffsetMs).toISOString()
}

/**
 * Create a 30-minute Google Calendar event with an auto-generated Google Meet
 * conference. The user's email is added as an attendee so Google sends them
 * a calendar invite automatically.
 *
 * Returns the event + the Meet link.
 */
export async function createCalendarEventWithMeet(booking: BookingDetails): Promise<{
  event: { id: string; htmlLink: string; hangoutLink?: string }
  meetLink?: string
}> {
  const oauth2Client = getAuthenticatedClient()
  const calendar = google.calendar({ version: 'v3', auth: oauth2Client })
  const env = getEnv()

  const startIso = ukHourToUtcIso(booking.date, booking.ukStartHour)
  // 30-minute call
  const endIso = new Date(new Date(startIso).getTime() + 30 * 60 * 1000).toISOString()

  const dateDisplay = new Date(booking.date + 'T00:00:00').toLocaleDateString('en-GB', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })

  const event = await calendar.events.insert({
    calendarId: env.calendarId,
    conferenceDataVersion: 1,  // required to create Meet conference
    sendUpdates: 'all',         // Google emails all attendees automatically
    requestBody: {
      summary: `Allbuild call — ${booking.firstName} ${booking.lastName}`,
      description: `Sales call booked via allbuild landing page.

Founder: ${booking.firstName} ${booking.lastName}
Email: ${booking.email}
Business: ${booking.businessUrl || '(not provided)'}

UK time slot: ${booking.ukSlotLabel}
Founder's local time: ${booking.userLocalLabel}

This is a 30-minute call. The 2-hour slot is your availability window; the call starts at the top of the slot.`,
      start: { dateTime: startIso, timeZone: 'Europe/London' },
      end: { dateTime: endIso, timeZone: 'Europe/London' },
      attendees: [
        { email: booking.email, displayName: `${booking.firstName} ${booking.lastName}` },
        { email: env.calendarId, organizer: true },
      ],
      conferenceData: {
        createRequest: {
          requestId: `allbuild-${Date.now()}-${booking.email.replace(/[^a-z0-9]/gi, '')}`,
          conferenceSolutionKey: { type: 'hangoutsMeet' },
        },
      },
      guestsCanModify: false,
      guestsCanInviteOthers: false,
      guestsCanSeeOtherGuests: false,
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 60 * 24 },  // 1 day before
          { method: 'popup', minutes: 30 },         // 30 min before
          { method: 'popup', minutes: 10 },         // 10 min before
        ],
      },
    },
  })

  return {
    event: {
      id: event.data.id || '',
      htmlLink: event.data.htmlLink || '',
      hangoutLink: event.data.hangoutLink,
    },
    meetLink: event.data.hangoutLink,
  }
}

// ====================================================================
//  GMAIL — send confirmation email from sales@massapro.com
// ====================================================================

/**
 * Send a confirmation email to the founder (from sales@massapro.com) with
 * the Meet link, calendar link, and booking details.
 */
export async function sendConfirmationEmail(booking: BookingDetails, meetLink?: string, calendarLink?: string): Promise<void> {
  const oauth2Client = getAuthenticatedClient()
  const gmail = google.gmail({ version: 'v1', auth: oauth2Client })
  const env = getEnv()

  const dateDisplay = new Date(booking.date + 'T00:00:00').toLocaleDateString('en-GB', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })

  const startIso = ukHourToUtcIso(booking.date, booking.ukStartHour)
  const startTimeLondon = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/London', hour: '2-digit', minute: '2-digit', hour12: false,
  }).format(new Date(startIso))

  const subject = `Your Allbuild call is booked — ${dateDisplay} at ${startTimeLondon} UK`

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#FAE3E3;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#2D1B2E;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#FAE3E3;padding:32px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background-color:#FFFFFF;border-radius:24px;overflow:hidden;max-width:560px;">

        <!-- Header -->
        <tr><td style="background:linear-gradient(135deg,#8954AB 0%,#B464AD 50%,#F33167 100%);padding:40px 32px;text-align:center;">
          <h1 style="margin:0;color:#FFFFFF;font-size:28px;font-weight:500;font-family:Georgia,serif;">You are booked in.</h1>
          <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">Talk soon, ${booking.firstName}.</p>
        </td></tr>

        <!-- Body -->
        <tr><td style="padding:32px;">
          <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#2D1B2E;">
            Thanks for booking a call with the Allbuild team. Here are your details:
          </p>

          <!-- Booking details -->
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#FAE3E3;border-radius:16px;padding:20px;margin:0 0 24px;">
            <tr><td style="padding:6px 0;font-size:14px;color:#6B4D5C;">Date</td><td style="padding:6px 0;font-size:14px;font-weight:600;color:#2D1B2E;text-align:right;">${dateDisplay}</td></tr>
            <tr><td style="padding:6px 0;font-size:14px;color:#6B4D5C;">UK time</td><td style="padding:6px 0;font-size:14px;font-weight:600;color:#2D1B2E;text-align:right;">${startTimeLondon} UK (30 min)</td></tr>
            <tr><td style="padding:6px 0;font-size:14px;color:#6B4D5C;">Your local time</td><td style="padding:6px 0;font-size:14px;font-weight:600;color:#2D1B2E;text-align:right;">${booking.userLocalLabel}</td></tr>
          </table>

          ${meetLink ? `
          <!-- Meet link CTA -->
          <div style="text-align:center;margin:24px 0;">
            <a href="${meetLink}" style="display:inline-block;background-color:#F33167;color:#FFFFFF;font-weight:600;font-size:15px;padding:14px 32px;border-radius:999px;text-decoration:none;">Join the call with Google Meet</a>
          </div>
          <p style="margin:0 0 24px;font-size:12px;color:#6B4D5C;text-align:center;word-break:break-all;">Or paste this link: ${meetLink}</p>
          ` : ''}

          ${calendarLink ? `
          <p style="margin:0 0 24px;font-size:13px;text-align:center;">
            <a href="${calendarLink}" style="color:#8954AB;text-decoration:underline;">Add to your Google Calendar →</a>
          </p>
          ` : ''}

          <p style="margin:0 0 12px;font-size:14px;line-height:1.6;color:#2D1B2E;">
            <strong>What happens next?</strong>
          </p>
          <ul style="margin:0 0 24px;padding-left:20px;font-size:14px;line-height:1.7;color:#2D1B2E;">
            <li>You'll get a separate calendar invite from Google within a few minutes.</li>
            <li>The call is 30 minutes — come with whatever's on your mind.</li>
            <li>Need to reschedule? Just reply to this email.</li>
          </ul>

          <p style="margin:0;font-size:13px;color:#6B4D5C;line-height:1.6;border-top:1px solid #F0D0D0;padding-top:20px;">
            — The Allbuild team<br>
            <a href="mailto:sales@massapro.com" style="color:#8954AB;">sales@massapro.com</a>
          </p>
        </td></tr>
      </table>
      <p style="margin:16px 0 0;font-size:11px;color:#6B4D5C;text-align:center;">© 2026 Allbuild. A brand that shows up warm.</p>
    </td></tr>
  </table>
</body>
</html>
`

  // Gmail API requires raw RFC-822 message, base64url-encoded
  const rawMessage = [
    `From: Allbuild <${env.calendarId}>`,
    `To: ${booking.firstName} ${booking.lastName} <${booking.email}>`,
    `Subject: ${subject}`,
    `MIME-Version: 1.0`,
    `Content-Type: text/html; charset=utf-8`,
    ``,
    html,
  ].join('\r\n')

  const encoded = Buffer.from(rawMessage)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')

  await gmail.users.messages.send({
    userId: 'me',  // 'me' = the authenticated user (sales@massapro.com)
    requestBody: { raw: encoded },
  })
}
