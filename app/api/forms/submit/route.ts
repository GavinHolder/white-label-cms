/**
 * POST /api/forms/submit
 * Forward verified form submission data to the admin notification email.
 * Should only be called after OTP verification has succeeded on the client.
 */

import { NextResponse } from "next/server";
import { getEmailConfig, sendSubmissionEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const { fields, userEmail, source } = await req.json();

    if (!fields || !userEmail) {
      return NextResponse.json({ error: "Missing fields or userEmail" }, { status: 400 });
    }

    const cfg = await getEmailConfig();
    await sendSubmissionEmail(fields, userEmail, cfg, source || "Website");

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to send submission";
    console.error("[Form submit error]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
