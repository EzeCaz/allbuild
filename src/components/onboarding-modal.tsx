'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Calendar, Clock, Globe, ArrowRight, CheckCircle2, Loader2, AlertCircle } from 'lucide-react'

// ====================================================================
//  TYPES
// ====================================================================

type Status = 'idle' | 'submitting' | 'success' | 'error'

// ====================================================================
//  UK SLOT DEFINITIONS
//  Two 2-hour slots within UK working hours: 9-12 and 14-17
// ====================================================================

const UK_SLOTS = [
  { id: 'morning', ukStart: 9, ukEnd: 11, ukLabel: '09:00–11:00 UK' },
  { id: 'midday', ukStart: 11, ukEnd: 13, ukLabel: '11:00–13:00 UK' },
  { id: 'afternoon1', ukStart: 14, ukEnd: 16, ukLabel: '14:00–16:00 UK' },
  { id: 'afternoon2', ukStart: 15, ukEnd: 17, ukLabel: '15:00–17:00 UK' },
] as const

// ====================================================================
//  TIMEZONE HELPERS
// ====================================================================

/**
 * Returns the user's IANA timezone (e.g. "Europe/Berlin", "America/New_York").
 * Falls back to "Europe/London" if detection fails.
 */
function getUserTimezone(): string {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
    return tz || 'Europe/London'
  } catch {
    return 'Europe/London'
  }
}

/**
 * Returns a short label for a timezone, e.g. "Berlin (CEST)" or "New York (EDT)".
 */
function tzShortLabel(tz: string): string {
  try {
    const now = new Date()
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: tz,
      timeZoneName: 'short',
    }).formatToParts(now)
    const tzName = parts.find((p) => p.type === 'timeZoneName')?.value || tz
    const city = tz.split('/').pop()?.replace(/_/g, ' ') || tz
    return `${city} (${tzName})`
  } catch {
    return tz
  }
}

/**
 * Converts a UK hour (0-23, interpreted as Europe/London time) on a given date
 * into the equivalent local time label for the user's timezone.
 * Returns a string like "10:00–12:00" in 24h format.
 */
function ukSlotToLocalLabel(dateStr: string, ukStart: number, ukEnd: number, userTz: string): string {
  try {
    // Build a UTC date at the UK start hour. We'll use Intl to figure out the
    // actual offset between London and the user's timezone on that date.
    // The trick: format the same UTC instant in both London and user tz.
    const baseDate = new Date(dateStr + 'T00:00:00Z')
    // Find the London offset (in minutes) for this date
    const londonParts = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Europe/London',
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', hour12: false,
    }).formatToParts(new Date(baseDate.getTime() + ukStart * 3600 * 1000))
    // We don't actually need to parse this — we just need to format the
    // UTC instant in the user's tz. The instant is: date @ ukStart:00 London time.
    // London offset varies (GMT/BST), so compute it:
    const londonDate = new Date(baseDate.getTime() + ukStart * 3600 * 1000)
    // Compute London offset by formatting London time vs UTC
    const londonFormatted = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Europe/London',
      hour: '2-digit', minute: '2-digit', hour12: false,
    }).format(londonDate)
    const utcHour = londonDate.getUTCHours()
    const londonHourParsed = parseInt(londonFormatted.split(':')[0], 10)
    let londonOffsetHours = londonHourParsed - utcHour
    // Adjust for wrap-around midnight
    if (londonOffsetHours > 12) londonOffsetHours -= 24
    if (londonOffsetHours < -12) londonOffsetHours += 24

    // Now compute user offset relative to London on the same instant
    // Build the actual UTC instant for "ukStart:00 London"
    const ukStartUtc = new Date(baseDate.getTime() + (ukStart - londonOffsetHours) * 3600 * 1000)
    const ukEndUtc = new Date(baseDate.getTime() + (ukEnd - londonOffsetHours) * 3600 * 1000)

    const fmt = new Intl.DateTimeFormat('en-GB', {
      timeZone: userTz,
      hour: '2-digit', minute: '2-digit', hour12: false,
    })
    const startStr = fmt.format(ukStartUtc)
    const endStr = fmt.format(ukEndUtc)
    return `${startStr}–${endStr}`
  } catch {
    return `${String(ukStart).padStart(2, '0')}:00–${String(ukEnd).padStart(2, '0')}:00`
  }
}

// ====================================================================
//  MODAL COMPONENT
// ====================================================================

export function OnboardingModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [businessUrl, setBusinessUrl] = useState('')
  const [date, setDate] = useState('')
  const [slotId, setSlotId] = useState<string>('')
  const [status, setStatus] = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [userTz] = useState(getUserTimezone)
  const [meetLink, setMeetLink] = useState<string | null>(null)

  // Lock body scroll when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  // Close on Escape key
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      const t = setTimeout(() => {
        setStatus('idle')
        setErrorMsg('')
        setMeetLink(null)
      }, 300)
      return () => clearTimeout(t)
    }
  }, [open])

  const selectedSlot = useMemo(() => UK_SLOTS.find((s) => s.id === slotId), [slotId])

  const slotLocalLabel = useMemo(() => {
    if (!date || !selectedSlot) return ''
    return ukSlotToLocalLabel(date, selectedSlot.ukStart, selectedSlot.ukEnd, userTz)
  }, [date, selectedSlot, userTz])

  // Min date = tomorrow (don't allow same-day bookings)
  const minDate = useMemo(() => {
    const d = new Date()
    d.setDate(d.getDate() + 1)
    return d.toISOString().split('T')[0]
  }, [])

  // Max date = 60 days from now
  const maxDate = useMemo(() => {
    const d = new Date()
    d.setDate(d.getDate() + 60)
    return d.toISOString().split('T')[0]
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (status === 'submitting') return

    setStatus('submitting')
    setErrorMsg('')

    // Normalize business URL: auto-prepend https:// if the user typed a bare
    // domain like "massapro.com" or "www.massapro.com". Empty stays empty.
    let normalizedUrl = businessUrl.trim()
    if (normalizedUrl && !/^https?:\/\//i.test(normalizedUrl)) {
      normalizedUrl = `https://${normalizedUrl}`
    }

    try {
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          businessUrl: normalizedUrl,
          date,
          ukStartHour: selectedSlot?.ukStart,
          ukEndHour: selectedSlot?.ukEnd,
          ukSlotLabel: selectedSlot?.ukLabel || '',
          slotLocalLabel,
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'Submission failed')
      }
      // If the API returned a mailto fallback (email relay blocked), open
      // the user's email client with the prefilled message.
      if (data.fallback === 'mailto' && data.mailtoLink) {
        window.location.href = data.mailtoLink
      }
      // Capture Meet link if Google integration created one
      if (data.meetLink) {
        setMeetLink(data.meetLink)
      }
      setStatus('success')
    } catch (err) {
      setStatus('error')
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-plum/40 backdrop-blur-sm"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-labelledby="onboarding-title"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-white z-10 px-7 pt-7 pb-4 border-b border-blush-line flex items-start justify-between">
              <div>
                <h2 id="onboarding-title" className="font-display text-2xl font-medium text-plum leading-tight">
                  {status === 'success' ? 'You are booked in.' : "Let's get you set up."}
                </h2>
                <p className="text-xs text-muted-plum mt-1">
                  {status === 'success'
                    ? 'Check your inbox for a confirmation.'
                    : 'A 30-minute call with our team. No pitch — just a look at what your crew could do for you.'}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 -mr-1.5 text-muted-plum hover:text-plum hover:bg-blush/50 rounded-full transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="px-7 py-6">
              {status === 'success' ? (
                <SuccessState
                  firstName={firstName}
                  date={date}
                  slotLabel={selectedSlot?.ukLabel || ''}
                  slotLocalLabel={slotLocalLabel}
                  userTz={userTz}
                  meetLink={meetLink}
                  onClose={onClose}
                />
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Name row */}
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="First name" required>
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                        placeholder="Laia"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-blush-line bg-blush/30 text-plum placeholder:text-muted-plum/50 focus:outline-none focus:border-purple-1 focus:ring-2 focus:ring-purple-1/20 transition-all text-sm"
                      />
                    </Field>
                    <Field label="Last name" required>
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                        placeholder="Puig"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-blush-line bg-blush/30 text-plum placeholder:text-muted-plum/50 focus:outline-none focus:border-purple-1 focus:ring-2 focus:ring-purple-1/20 transition-all text-sm"
                      />
                    </Field>
                  </div>

                  {/* Email */}
                  <Field label="Email" required>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="laia@florsdebarcelona.com"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-blush-line bg-blush/30 text-plum placeholder:text-muted-plum/50 focus:outline-none focus:border-purple-1 focus:ring-2 focus:ring-purple-1/20 transition-all text-sm"
                    />
                  </Field>

                  {/* Business URL */}
                  <Field label="Business URL" optional>
                    <input
                      type="text"
                      value={businessUrl}
                      onChange={(e) => setBusinessUrl(e.target.value)}
                      placeholder="massapro.com"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-blush-line bg-blush/30 text-plum placeholder:text-muted-plum/50 focus:outline-none focus:border-purple-1 focus:ring-2 focus:ring-purple-1/20 transition-all text-sm"
                    />
                  </Field>

                  {/* Date */}
                  <Field label="Date" required>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-plum pointer-events-none" />
                      <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        required
                        min={minDate}
                        max={maxDate}
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-blush-line bg-blush/30 text-plum focus:outline-none focus:border-purple-1 focus:ring-2 focus:ring-purple-1/20 transition-all text-sm"
                      />
                    </div>
                  </Field>

                  {/* Slot picker — only shown after date is selected */}
                  {date && (
                    <Field label="Slot (UK time)" required>
                      <div className="grid grid-cols-2 gap-2">
                        {UK_SLOTS.map((slot) => {
                          const isActive = slot.id === slotId
                          const localLabel = ukSlotToLocalLabel(date, slot.ukStart, slot.ukEnd, userTz)
                          return (
                            <button
                              key={slot.id}
                              type="button"
                              onClick={() => setSlotId(slot.id)}
                              className={`relative text-left px-3.5 py-3 rounded-xl border transition-all ${
                                isActive
                                  ? 'border-purple-1 bg-purple-1/5 ring-2 ring-purple-1/20'
                                  : 'border-blush-line bg-blush/20 hover:border-purple-1/50 hover:bg-blush/40'
                              }`}
                            >
                              <div className="flex items-center gap-1.5 text-xs font-bold text-plum tracking-wide">
                                <Clock className="w-3 h-3" />
                                {slot.ukLabel}
                              </div>
                              <div className="text-[11px] text-muted-plum mt-1 flex items-center gap-1">
                                <Globe className="w-2.5 h-2.5" />
                                {localLabel} your time
                              </div>
                              {isActive && (
                                <CheckCircle2 className="absolute top-2 right-2 w-4 h-4 text-purple-1" />
                              )}
                            </button>
                          )
                        })}
                      </div>
                      <p className="text-[11px] text-muted-plum mt-2 flex items-center gap-1">
                        <Globe className="w-2.5 h-2.5" />
                        Showing times in your timezone: <span className="font-semibold text-plum">{tzShortLabel(userTz)}</span>
                      </p>
                    </Field>
                  )}

                  {/* Error message */}
                  {status === 'error' && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-start gap-2 p-3 rounded-xl bg-peach-1/10 border border-peach-1/30 text-sm text-peach-1"
                    >
                      <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>{errorMsg}</span>
                    </motion.div>
                  )}

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={status === 'submitting' || !date || !slotId}
                    className="w-full inline-flex items-center justify-center px-6 py-3.5 rounded-full font-semibold text-white transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
                    style={{ backgroundColor: '#F33167' }}
                  >
                    {status === 'submitting' ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Sending your request...
                      </>
                    ) : (
                      <>
                        Book my call
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </button>

                  <p className="text-[11px] text-muted-plum text-center">
                    By submitting, you agree to receive a confirmation email from <span className="font-semibold">sales@massapro.com</span>. No spam, ever.
                  </p>
                </form>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ====================================================================
//  FIELD WRAPPER
// ====================================================================

function Field({ label, required, optional, children }: { label: string; required?: boolean; optional?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-plum mb-1.5">
        {label}
        {required && <span className="text-peach-1 ml-0.5">*</span>}
        {optional && <span className="text-muted-plum font-normal ml-1">(optional)</span>}
      </label>
      {children}
    </div>
  )
}

// ====================================================================
//  SUCCESS STATE
// ====================================================================

function SuccessState({
  firstName,
  date,
  slotLabel,
  slotLocalLabel,
  userTz,
  meetLink,
  onClose,
}: {
  firstName: string
  date: string
  slotLabel: string
  slotLocalLabel: string
  userTz: string
  meetLink: string | null
  onClose: () => void
}) {
  const dateDisplay = useMemo(() => {
    try {
      return new Date(date + 'T00:00:00').toLocaleDateString('en-GB', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      })
    } catch {
      return date
    }
  }, [date])

  return (
    <div className="text-center py-4">
      <motion.div
        initial={{ scale: 0, rotate: -30 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className="w-16 h-16 rounded-full bg-purple-1 mx-auto flex items-center justify-center mb-4"
      >
        <CheckCircle2 className="w-9 h-9 text-white" />
      </motion.div>
      <p className="font-display text-xl text-plum mb-1">
        Thanks, {firstName}.
      </p>
      <p className="text-sm text-muted-plum mb-6">
        {meetLink ? (
          <>Your call is booked. A calendar invite + confirmation email from <span className="font-semibold">sales@massapro.com</span> is on its way to your inbox.</>
        ) : (
          <>Your request is on its way to our team. If your email client opened, just hit send — that delivers it to <span className="font-semibold">sales@massapro.com</span>. We'll email you a calendar invite within 24 hours.</>
        )}
      </p>

      {/* Google Meet link — shown when Google integration created the event */}
      {meetLink && (
        <motion.a
          href={meetLink}
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="block w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full font-semibold text-white transition-all hover:-translate-y-0.5 hover:shadow-lg mb-4"
          style={{ backgroundColor: '#F33167' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 7H17V5C17 3.9 16.1 3 15 3H9C7.9 3 7 3.9 7 5V7H3C1.9 7 1 7.9 1 9V19C1 20.1 1.9 21 3 21H21C22.1 21 23 20.1 23 19V9C23 7.9 22.1 7 21 7ZM9 5H15V7H9V5ZM15 17H9V11H15V17ZM17 17V11H21V17H17ZM3 11H7V17H3V11Z" fill="currentColor"/>
          </svg>
          Join with Google Meet
        </motion.a>
      )}

      <div className="bg-blush/40 rounded-2xl p-4 text-left mb-6">
        <div className="text-[10px] font-bold uppercase tracking-wider text-muted-plum mb-2">Your booking</div>
        <div className="space-y-1.5 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-plum">Date</span>
            <span className="font-semibold text-plum">{dateDisplay}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-plum">UK time</span>
            <span className="font-semibold text-plum">{slotLabel}</span>
          </div>
          {slotLocalLabel && (
            <div className="flex justify-between">
              <span className="text-muted-plum">Your time</span>
              <span className="font-semibold text-plum">{slotLocalLabel}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-plum">Timezone</span>
            <span className="font-semibold text-plum text-xs">{userTz}</span>
          </div>
          {meetLink && (
            <div className="pt-2 mt-2 border-t border-blush-line">
              <div className="text-[10px] text-muted-plum mb-1">Meet link (save it!)</div>
              <div className="text-xs font-mono text-purple-1 break-all">{meetLink}</div>
            </div>
          )}
        </div>
      </div>

      <button
        onClick={onClose}
        className="w-full inline-flex items-center justify-center px-6 py-3 rounded-full font-semibold bg-blush text-plum hover:bg-blush-sat transition-all"
      >
        Back to the page
      </button>
    </div>
  )
}
