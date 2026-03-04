/**
 * GET /api/users - List all admin users
 * POST /api/users - Create a new admin user
 */

import { NextRequest } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import {
  requireRole,
  successResponse,
  errorResponse,
  handleApiError,
} from "@/lib/api-middleware";
import { hashPassword, validatePassword, validateEmail } from "@/lib/auth";
import { UserRole } from "@prisma/client";

// ============================================
// GET /api/users - List all users
// ============================================

export async function GET(request: NextRequest) {
  try {
    const user = requireRole(request, "SUPER_ADMIN");
    if (user instanceof Response) return user;

    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: "asc" },
    });

    return successResponse(
      { users },
      200,
      { total: users.length }
    );
  } catch (error) {
    return handleApiError(error);
  }
}

// ============================================
// POST /api/users - Create a new user
// ============================================

const createUserSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username must be at most 50 characters")
    .regex(/^[a-zA-Z0-9_-]+$/, "Username may only contain letters, numbers, hyphens, and underscores"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  role: z.nativeEnum(UserRole).optional().default(UserRole.EDITOR),
});

export async function POST(request: NextRequest) {
  try {
    const requestingUser = requireRole(request, "SUPER_ADMIN");
    if (requestingUser instanceof Response) return requestingUser;

    const body = await request.json();
    const validation = createUserSchema.safeParse(body);

    if (!validation.success) {
      return errorResponse(
        "VALIDATION_ERROR",
        validation.error.issues[0].message,
        400,
        validation.error.issues[0].path[0] as string
      );
    }

    const data = validation.data;

    // Validate password strength
    const passwordError = validatePassword(data.password);
    if (passwordError) {
      return errorResponse("VALIDATION_ERROR", passwordError, 400, "password");
    }

    // Validate email format (extra check)
    if (!validateEmail(data.email)) {
      return errorResponse("VALIDATION_ERROR", "Invalid email address", 400, "email");
    }

    // Check for duplicate username
    const existingUsername = await prisma.user.findUnique({
      where: { username: data.username },
    });
    if (existingUsername) {
      return errorResponse("DUPLICATE_USERNAME", "Username is already taken", 409, "username");
    }

    // Check for duplicate email
    const existingEmail = await prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existingEmail) {
      return errorResponse("DUPLICATE_EMAIL", "Email is already registered", 409, "email");
    }

    const passwordHash = await hashPassword(data.password);

    const newUser = await prisma.user.create({
      data: {
        username: data.username,
        email: data.email,
        passwordHash,
        firstName: data.firstName ?? null,
        lastName: data.lastName ?? null,
        role: data.role,
        isActive: true,
      },
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return successResponse({ user: newUser }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
