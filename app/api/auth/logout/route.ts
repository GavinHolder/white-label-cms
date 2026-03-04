/**
 * POST /api/auth/logout
 *
 * Clear authentication cookies and log out user
 */

import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Create response
    const response = NextResponse.json(
      {
        success: true,
        data: {
          message: "Successfully logged out",
        },
      },
      { status: 200 }
    );

    // Clear authentication cookies
    response.cookies.delete("access_token");
    response.cookies.delete("refresh_token");

    return response;
  } catch (error) {
    console.error("Logout error:", error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "SERVER_ERROR",
          message: "An error occurred during logout",
        },
      },
      { status: 500 }
    );
  }
}
