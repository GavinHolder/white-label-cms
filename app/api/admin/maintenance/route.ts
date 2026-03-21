/**
 * GET  /api/admin/maintenance  — return current maintenance settings
 * PUT  /api/admin/maintenance  — update maintenance settings (SUPER_ADMIN only)
 *
 * Settings stored in SystemSettings key-value table:
 *   maintenance_mode        "true" | "false"
 *   maintenance_template    "plain" | "construction" | "custom"
 *   maintenance_custom_img  URL string
 */

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireRole } from "@/lib/api-middleware";
import { UserRole } from "@prisma/client";

const KEY_MODE    = "maintenance_mode";
const KEY_TPL     = "maintenance_template";
const KEY_IMG     = "maintenance_custom_img";

async function upsert(key: string, value: string) {
  await prisma.systemSettings.upsert({
    where:  { key },
    update: { value },
    create: { key, value },
  });
}

export async function GET(req: NextRequest) {
  const auth = requireRole(req, UserRole.SUPER_ADMIN);
  if (auth instanceof NextResponse) return auth;

  const [modeRow, tplRow, imgRow] = await Promise.all([
    prisma.systemSettings.findUnique({ where: { key: KEY_MODE } }),
    prisma.systemSettings.findUnique({ where: { key: KEY_TPL } }),
    prisma.systemSettings.findUnique({ where: { key: KEY_IMG } }),
  ]);

  return NextResponse.json({
    enabled:     modeRow?.value === "true",
    template:    tplRow?.value  ?? "plain",
    customImage: imgRow?.value  ?? "",
  });
}

export async function PUT(req: NextRequest) {
  const auth = requireRole(req, UserRole.SUPER_ADMIN);
  if (auth instanceof NextResponse) return auth;

  const body = await req.json() as {
    enabled?: boolean;
    template?: string;
    customImage?: string;
  };

  await Promise.all([
    body.enabled    !== undefined ? upsert(KEY_MODE, String(Boolean(body.enabled))) : Promise.resolve(),
    body.template   !== undefined ? upsert(KEY_TPL,  body.template)                 : Promise.resolve(),
    body.customImage !== undefined ? upsert(KEY_IMG, body.customImage)               : Promise.resolve(),
  ]);

  const [modeRow, tplRow, imgRow] = await Promise.all([
    prisma.systemSettings.findUnique({ where: { key: KEY_MODE } }),
    prisma.systemSettings.findUnique({ where: { key: KEY_TPL } }),
    prisma.systemSettings.findUnique({ where: { key: KEY_IMG } }),
  ]);

  return NextResponse.json({
    enabled:     modeRow?.value === "true",
    template:    tplRow?.value  ?? "plain",
    customImage: imgRow?.value  ?? "",
  });
}
