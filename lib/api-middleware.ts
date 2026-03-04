/**
 * API Middleware Utilities
 *
 * Helper functions for authentication, authorization, and error handling in API routes
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken, hasRole, type JWTPayload } from "./auth";
import { UserRole } from "@prisma/client";

export interface AuthenticatedRequest extends NextRequest {
  user?: JWTPayload;
}

/**
 * Verify authentication and attach user to request
 * @param request Next.js request object
 * @returns User payload if authenticated, null otherwise
 */
export function authenticate(request: NextRequest): JWTPayload | null {
  const accessToken = request.cookies.get("access_token")?.value;

  if (!accessToken) {
    return null;
  }

  return verifyAccessToken(accessToken);
}

/**
 * Require authentication for a route
 * Returns 401 response if not authenticated
 */
export function requireAuth(request: NextRequest): JWTPayload | NextResponse {
  const user = authenticate(request);

  if (!user) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "Authentication required",
        },
      },
      { status: 401 }
    );
  }

  return user;
}

/**
 * Require specific role for a route
 * Returns 403 response if user doesn't have required role
 */
export function requireRole(
  request: NextRequest,
  requiredRole: UserRole
): JWTPayload | NextResponse {
  const user = requireAuth(request);

  if (user instanceof NextResponse) {
    return user; // Already an error response
  }

  if (!hasRole(user.role, requiredRole)) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "Insufficient permissions",
        },
      },
      { status: 403 }
    );
  }

  return user;
}

/**
 * Standard error response format
 */
export function errorResponse(
  code: string,
  message: string,
  status: number = 500,
  field?: string
) {
  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message,
        ...(field && { field }),
      },
    },
    { status }
  );
}

/**
 * Standard success response format
 */
export function successResponse(data: any, status: number = 200, meta?: any) {
  return NextResponse.json(
    {
      success: true,
      data,
      ...(meta && { meta }),
    },
    { status }
  );
}

/**
 * Handle API errors consistently
 */
export function handleApiError(error: any): NextResponse {
  console.error("API Error:", error);

  // Prisma errors
  if (error.code === "P2002") {
    return errorResponse("DUPLICATE_ENTRY", "A record with this value already exists", 409);
  }

  if (error.code === "P2025") {
    return errorResponse("NOT_FOUND", "Record not found", 404);
  }

  // Validation errors (Zod)
  if (error.name === "ZodError") {
    return errorResponse(
      "VALIDATION_ERROR",
      error.errors[0].message,
      400,
      error.errors[0].path[0]
    );
  }

  // Default server error
  return errorResponse(
    "SERVER_ERROR",
    "An unexpected error occurred. Please try again.",
    500
  );
}
