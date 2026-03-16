/**
 * POST /api/forms/submit
 * Forward verified form submission data to the admin notification email
 * or to a configured webhook URL.
 * Should only be called after OTP verification has succeeded on the client.
 */

import { NextResponse } from "next/server";
import { getEmailConfig, sendSubmissionEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const { fields, userEmail, source, emailTo, submitAction, webhookUrl } = await req.json();

    if (!fields || !userEmail) {
      return NextResponse.json({ error: "Missing fields or userEmail" }, { status: 400 });
    }

    if (submitAction === "webhook") {
      if (!webhookUrl) {
        return NextResponse.json({ error: "No webhook URL configured" }, { status: 400 });
      }
      const webhookRes = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fields, userEmail, source }),
      });
      if (!webhookRes.ok) {
        throw new Error(`Webhook responded with ${webhookRes.status}`);
      }
      return NextResponse.json({ ok: true });
    }

    // Default: email action
    const cfg = await getEmailConfig();
    await sendSubmissionEmail(fields, userEmail, cfg, source || "Website", emailTo);

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to send submission";
    console.error("[Form submit error]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
