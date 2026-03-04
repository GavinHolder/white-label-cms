/**
 * POST /api/auth/refresh - Refresh access token
 *
 * Uses the refresh token to generate a new access token
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyRefreshToken, generateAccessToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    // Get refresh token from cookie
    const refreshToken = request.cookies.get("refresh_token")?.value;

    if (!refreshToken) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "NO_REFRESH_TOKEN",
            message: "Refresh token not found",
          },
        },
        { status: 401 }
      );
    }

    // Verify refresh token
    const payload = verifyRefreshToken(refreshToken);

    if (!payload) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_REFRESH_TOKEN",
            message: "Refresh token is invalid or expired",
          },
        },
        { status: 401 }
      );
    }

    // Generate new access token
    const newAccessToken = generateAccessToken({
      userId: payload.userId,
      email: payload.email,
      username: payload.username,
      role: payload.role,
    });

    // Create response with new access token cookie
    const response = NextResponse.json(
      {
        success: true,
        message: "Token refreshed successfully",
      },
      { status: 200 }
    );

    // Set new access token cookie (httpOnly, secure in production)
    response.cookies.set("access_token", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 8 * 60 * 60, // 8 hours in seconds
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Token refresh error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "REFRESH_FAILED",
          message: "Failed to refresh token",
        },
      },
      { status: 500 }
    );
  }
}
