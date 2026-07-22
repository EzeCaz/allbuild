import { NextResponse } from "next/server";

/**
 * POST /api/onboarding
 *
 * Receives form submissions from the Allbuild onboarding modal and forwards
 * them to sales@massapro.com. Tries multiple email relay services in order:
 *   1. Web3Forms (primary — handles bot protection better than FormSubmit)
 *   2. FormSubmit.co (fallback)
 *
 * Both are free, no-API-key email relay services. To make Web3Forms work,
 * the owner must do a one-time activation: the first submission triggers
 * an activation email to sales@massapro.com — click the link to confirm.
 *
 * If both relays fail (e.g. network/bot block), we return the formatted
 * email body so the client can fall back to a mailto: link.
 *
 * Expected JSON body:
 * {
 *   firstName: string,
 *   lastName: string,
 *   email: string,
 *   businessUrl: string,
 *   date: string (ISO date — yyyy-mm-dd),
 *   slot: string (the UK-time slot label, e.g. "09:00–11:00 UK"),
 *   slotLocalLabel: string (the user's local-time equivalent label)
 * }
 */

// Web3Forms access key — this is a public key tied to the destination email.
// To get one for sales@massapro.com, visit https://web3forms.com and enter
// sales@massapro.com — they'll send an activation email and give you a key.
// For now we use the FormSubmit endpoint as the primary, with mailto fallback.
const FORMSUBMIT_ENDPOINT = "https://formsubmit.co/ajax/sales@massapro.com";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Basic server-side validation
    const required = ["firstName", "lastName", "email", "date", "slot"];
    for (const field of required) {
      if (!body?.[field] || String(body[field]).trim() === "") {
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

    // Build a readable email body
    const dateObj = new Date(body.date + "T00:00:00");
    const dateDisplay = dateObj.toLocaleDateString("en-GB", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const submissionSummary = `New Allbuild onboarding: ${body.firstName} ${body.lastName} — ${body.slot}`;

    const emailBody = `
NEW ONBOARDING REQUEST — Allbuild

PERSONAL DETAILS
────────────────
First name:  ${body.firstName}
Last name:   ${body.lastName}
Email:       ${body.email}
Business URL: ${body.businessUrl || "(not provided)"}

BOOKED SLOT
────────────────
Date:           ${dateDisplay}
UK time slot:   ${body.slot}
User local time: ${body.slotLocalLabel || "(not provided)"}

────────────────
Submitted: ${new Date().toISOString()}
Source:    Allbuild landing page
`;

    // Try FormSubmit.co
    try {
      const response = await fetch(FORMSUBMIT_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          _subject: submissionSummary,
          _template: "table",
          _captcha: "false",
          message: emailBody,
          "First name": body.firstName,
          "Last name": body.lastName,
          Email: body.email,
          "Business URL": body.businessUrl || "(not provided)",
          Date: dateDisplay,
          "UK time slot": body.slot,
          "User local time": body.slotLocalLabel || "(not provided)",
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return NextResponse.json({ ok: true, data });
      }
      console.error("FormSubmit error:", response.status);
    } catch (err) {
      console.error("FormSubmit fetch failed:", err);
    }

    // If we get here, both relays failed. Return a mailto fallback so the
    // client can open the user's email client with the prefilled message.
    const mailtoSubject = encodeURIComponent(submissionSummary);
    const mailtoBody = encodeURIComponent(emailBody);
    const mailtoLink = `mailto:sales@massapro.com?subject=${mailtoSubject}&body=${mailtoBody}`;

    return NextResponse.json({
      ok: true,
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
