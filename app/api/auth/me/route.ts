/**
 * GET /api/auth/me
 *
 * Get currently authenticated user's information
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Get access token from cookie
    const accessToken = request.cookies.get("access_token")?.value;

    if (!accessToken) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Not authenticated",
          },
        },
        { status: 401 }
      );
    }

    // Verify token
    const payload = verifyAccessToken(accessToken);

    if (!payload) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_TOKEN",
            message: "Invalid or expired token",
          },
        },
        { status: 401 }
      );
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "USER_NOT_FOUND",
            message: "User not found",
          },
        },
        { status: 404 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "USER_INACTIVE",
            message: "Your account has been deactivated",
          },
        },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          user,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get current user error:", error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "SERVER_ERROR",
          message: "An error occurred while fetching user information",
        },
      },
      { status: 500 }
    );
  }
}
