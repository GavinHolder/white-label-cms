import { NextRequest, NextResponse } from "next/server";
import { authenticate } from "@/lib/api-middleware";

export async function GET(request: NextRequest) {
  const cookies = request.cookies.getAll();
  const user = authenticate(request);

  return NextResponse.json({
    cookies: cookies.map(c => ({ name: c.name, value: c.value.substring(0, 20) + "..." })),
    authenticated: !!user,
    user: user || null,
  });
}
