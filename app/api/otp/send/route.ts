/**
 * POST /api/otp/send
 * Generate a 6-digit OTP, store it in the database, and send it to the user's email.
 * Rate-limited to 3 requests per email per 10 minutes.
 */

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getEmailConfig, sendOtpEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const { email, purpose } = await req.json();

    if (!email || !purpose) {
      return NextResponse.json({ error: "Missing email or purpose" }, { status: 400 });
    }

    // Clean up expired tokens
    await prisma.otpToken.deleteMany({ where: { expiresAt: { lt: new Date() } } });

    // Rate limit: max 3 OTPs per email+purpose in the last 10 minutes
    const recentCount = await prisma.otpToken.count({
      where: {
        email,
        purpose,
        createdAt: { gt: new Date(Date.now() - 10 * 60 * 1000) },
      },
    });
    if (recentCount >= 3) {
      return NextResponse.json(
        { error: "Too many requests. Try again in 10 minutes." },
        { status: 429 }
      );
    }

    // Generate 6-digit OTP
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.otpToken.create({ data: { email, code, purpose, expiresAt } });

    const cfg = await getEmailConfig();
    await sendOtpEmail(email, code, cfg);

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to send email";
    console.error("[OTP send error]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
