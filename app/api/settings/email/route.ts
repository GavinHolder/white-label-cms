/**
 * GET  /api/settings/email — fetch current SMTP/email configuration (password masked)
 * POST /api/settings/email — save SMTP/email configuration (upserts each key)
 */

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/api-middleware";

const ALLOWED_KEYS = [
  "smtp_host",
  "smtp_port",
  "smtp_user",
  "smtp_pass",
  "smtp_from",
  "smtp_secure",
  "admin_email",
];

/** GET — return all email settings; mask the SMTP password */
export async function GET(req: NextRequest) {
  const auth = requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  const rows = await prisma.systemSettings.findMany({
    where: { key: { in: ALLOWED_KEYS } },
  });
  const settings = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  // Never send the real password to the client
  if (settings.smtp_pass) settings.smtp_pass = "••••••••";
  return NextResponse.json({ settings });
}

/** POST — upsert each provided key into system_settings */
export async function POST(req: NextRequest) {
  const auth = requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  const body = await req.json();
  for (const key of ALLOWED_KEYS) {
    const value = body[key];
    if (value === undefined) continue;
    if (value === "••••••••") continue; // Skip masked placeholder — don't overwrite real pass
    await prisma.systemSettings.upsert({
      where: { key },
      update: { value: String(value) },
      create: { key, value: String(value) },
    });
  }
  return NextResponse.json({ ok: true });
}
