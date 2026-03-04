/**
 * POST /api/otp/verify
 * Verify a 6-digit OTP code for a given email and purpose.
 * Marks the token as used on success so it cannot be reused.
 */

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { email, code, purpose } = await req.json();

    if (!email || !code || !purpose) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const token = await prisma.otpToken.findFirst({
      where: {
        email,
        code,
        purpose,
        used: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!token) {
      return NextResponse.json(
        { error: "Invalid or expired code. Please request a new one." },
        { status: 400 }
      );
    }

    // Mark as used — prevents replay attacks
    await prisma.otpToken.update({ where: { id: token.id }, data: { used: true } });

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Verification failed";
    console.error("[OTP verify error]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
