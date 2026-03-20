/**
 * GET  /api/admin/maintenance  — return current maintenance mode status
 * PUT  /api/admin/maintenance  — enable/disable maintenance mode (SUPER_ADMIN only)
 */

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireRole } from "@/lib/api-middleware";
import { UserRole } from "@prisma/client";

const KEY = "maintenance_mode";

export async function GET(req: NextRequest) {
  const auth = requireRole(req, UserRole.SUPER_ADMIN);
  if (auth instanceof NextResponse) return auth;

  const row = await prisma.systemSettings.findUnique({ where: { key: KEY } });
  return NextResponse.json({ enabled: row?.value === "true" });
}

export async function PUT(req: NextRequest) {
  const auth = requireRole(req, UserRole.SUPER_ADMIN);
  if (auth instanceof NextResponse) return auth;

  const { enabled } = await req.json();
  await prisma.systemSettings.upsert({
    where: { key: KEY },
    update: { value: String(Boolean(enabled)) },
    create: { key: KEY, value: String(Boolean(enabled)) },
  });
  return NextResponse.json({ enabled: Boolean(enabled) });
}
