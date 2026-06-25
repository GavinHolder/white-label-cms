import { NextRequest, NextResponse } from "next/server";
import { executeSeoEngineRun } from "@/lib/seo-run";
import { requireRole } from "@/lib/api-middleware";
import { UserRole } from "@prisma/client";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function POST(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  const isCron = cronSecret && req.headers.get("authorization") === `Bearer ${cronSecret}`;
  if (!isCron) {
    const auth = requireRole(req, UserRole.EDITOR);
    if (auth instanceof NextResponse) return auth;
  }

  const outcome = await executeSeoEngineRun();
  if (!outcome.success) {
    return NextResponse.json({ success: false, error: outcome.error }, { status: 500 });
  }
  return NextResponse.json({
    success: true,
    ...outcome.result,
    durationMs: outcome.durationMs,
    runId: outcome.runId,
    alert: outcome.alert,
  });
}
