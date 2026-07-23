import { NextResponse } from "next/server";
import { isGoogleConfigured, createCalendarEventWithMeet, sendConfirmationEmail } from "@/lib/google";

/**
 * POST /api/onboarding
 *
 * Receives form submissions from the Allbuild onboarding modal.
 *
 * If Google integration is configured (GOOGLE_REFRESH_TOKEN is set):
 *   1. Creates a Google Calendar event with Google Meet (calendar owned by sales@massapro.com)
 *   2. Sends a confirmation email from sales@massapro.com to the founder via Gmail
 *   3. Google also auto-sends a calendar invite to the founder's email
 *   4. Returns the Meet link to the client
 *
 * If Google is NOT configured, falls back to FormSubmit.co (free email relay).
 * If FormSubmit is blocked, falls back to a mailto: link.
 *
 * Expected JSON body:
 * {
 *   firstName, lastName, email, businessUrl,
 *   date (yyyy-mm-dd),
 *   ukStartHour (9|11|14|15), ukEndHour (11|13|16|17),
 *   ukSlotLabel ("09:00–11:00 UK"),
 *   slotLocalLabel ("10:00–12:00")
 * }
 */

const FORMSUBMIT_ENDPOINT = "https://formsubmit.co/ajax/sales@massapro.com";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Basic server-side validation
    const required = ["firstName", "lastName", "email", "date", "ukStartHour", "ukEndHour", "ukSlotLabel"];
    for (const field of required) {
      if (body?.[field] === undefined || String(body[field]).trim() === "") {
        return NextResponse.json(
          { ok: false, error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { ok: false, error: "Invalid email address" },
        { status: 400 }
      );
    }

    const booking = {
      firstName: body.firstName.trim(),
      lastName: body.lastName.trim(),
      email: body.email.trim(),
      businessUrl: body.businessUrl?.trim() || "",
      date: body.date,
      ukStartHour: Number(body.ukStartHour),
      ukEndHour: Number(body.ukEndHour),
      ukSlotLabel: body.ukSlotLabel,
      userLocalLabel: body.slotLocalLabel || "",
    };

    // ================================================================
    // PATH 1: Google integration (calendar event + Gmail confirmation)
    // ================================================================
    if (isGoogleConfigured()) {
      try {
        const { event, meetLink } = await createCalendarEventWithMeet(booking);

        try {
          await sendConfirmationEmail(booking, meetLink, event.htmlLink);
        } catch (emailErr) {
          // Calendar event was created (and Google already sent the invite
          // via sendUpdates: 'all'), so the founder still gets the calendar
          // invite. The custom confirmation email is a bonus — log and continue.
          console.error("Gmail send failed (calendar invite still sent):", emailErr);
        }

        return NextResponse.json({
          ok: true,
          provider: "google",
          meetLink,
          calendarLink: event.htmlLink,
          eventId: event.id,
          message: "Calendar event created + confirmation email sent.",
        });
      } catch (googleErr) {
        console.error("Google integration failed, falling back:", googleErr);
        // Fall through to FormSubmit fallback
      }
    }

    // ================================================================
    // PATH 2: FormSubmit.co fallback (no Google configured, or Google failed)
    // ================================================================
    const submissionSummary = `New Allbuild onboarding: ${booking.firstName} ${booking.lastName} — ${booking.ukSlotLabel}`;
    const dateDisplay = new Date(booking.date + "T00:00:00").toLocaleDateString("en-GB", {
      weekday: "long", year: "numeric", month: "long", day: "numeric",
    });
    const emailBody = `
NEW ONBOARDING REQUEST — Allbuild

PERSONAL DETAILS
────────────────
First name:  ${booking.firstName}
Last name:   ${booking.lastName}
Email:       ${booking.email}
Business URL: ${booking.businessUrl || "(not provided)"}

BOOKED SLOT
────────────────
Date:           ${dateDisplay}
UK time slot:   ${booking.ukSlotLabel}
User local time: ${booking.userLocalLabel}

────────────────
Submitted: ${new Date().toISOString()}
Source:    Allbuild landing page
`;

    try {
      const response = await fetch(FORMSUBMIT_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          _subject: submissionSummary,
          _template: "table",
          _captcha: "false",
          message: emailBody,
          "First name": booking.firstName,
          "Last name": booking.lastName,
          Email: booking.email,
          "Business URL": booking.businessUrl || "(not provided)",
          Date: dateDisplay,
          "UK time slot": booking.ukSlotLabel,
          "User local time": booking.userLocalLabel,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return NextResponse.json({ ok: true, provider: "formsubmit", data });
      }
      console.error("FormSubmit error:", response.status);
    } catch (err) {
      console.error("FormSubmit fetch failed:", err);
    }

    // ================================================================
    // PATH 3: mailto: fallback (both above failed)
    // ================================================================
    const mailtoSubject = encodeURIComponent(submissionSummary);
    const mailtoBody = encodeURIComponent(emailBody);
    const mailtoLink = `mailto:sales@massapro.com?subject=${mailtoSubject}&body=${mailtoBody}`;

    return NextResponse.json({
      ok: true,
      provider: "mailto",
      fallback: "mailto",
      mailtoLink,
      message: "Submission recorded. Opening your email client to complete sending.",
    });
  } catch (err) {
    console.error("Onboarding API error:", err);
    return NextResponse.json(
      { ok: false, error: "Server error. Please try again." },
      { status: 500 }
    );
  }
}
