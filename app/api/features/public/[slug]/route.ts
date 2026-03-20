/**
 * GET /api/features/public/[slug] — public feature config
 *
 * No authentication required. Returns enabled status + config for a single feature.
 * Used by public-facing pages (e.g. /calculator) that need feature config.
 */

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const feature = await prisma.clientFeature.findUnique({ where: { slug } });

    if (!feature) {
      return NextResponse.json({ success: true, data: { enabled: false, config: {} } });
    }
    return NextResponse.json({ success: true, data: { enabled: feature.enabled, config: feature.config } });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to fetch feature" }, { status: 500 });
  }
}
