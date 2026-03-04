/**
 * PATCH /api/users/[id] - Update user details
 * DELETE /api/users/[id] - Delete a user
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
// PATCH /api/users/[id] - Update user
// ============================================

const updateUserSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username must be at most 50 characters")
    .regex(/^[a-zA-Z0-9_-]+$/, "Username may only contain letters, numbers, hyphens, and underscores")
    .optional(),
  email: z.string().email("Invalid email address").optional(),
  password: z.string().min(8, "Password must be at least 8 characters").optional(),
  firstName: z.string().optional().nullable(),
  lastName: z.string().optional().nullable(),
  role: z.nativeEnum(UserRole).optional(),
  isActive: z.boolean().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const requestingUser = requireRole(request, "SUPER_ADMIN");
    if (requestingUser instanceof Response) return requestingUser;

    const existingUser = await prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      return errorResponse("USER_NOT_FOUND", "User not found", 404);
    }

    const body = await request.json();
    const validation = updateUserSchema.safeParse(body);

    if (!validation.success) {
      return errorResponse(
        "VALIDATION_ERROR",
        validation.error.issues[0].message,
        400,
        validation.error.issues[0].path[0] as string
      );
    }

    const data = validation.data;

    // Validate password strength if provided
    if (data.password) {
      const passwordError = validatePassword(data.password);
      if (passwordError) {
        return errorResponse("VALIDATION_ERROR", passwordError, 400, "password");
      }
    }

    // Validate email if provided
    if (data.email && !validateEmail(data.email)) {
      return errorResponse("VALIDATION_ERROR", "Invalid email address", 400, "email");
    }

    // Check for duplicate username (excluding current user)
    if (data.username && data.username !== existingUser.username) {
      const duplicateUsername = await prisma.user.findUnique({
        where: { username: data.username },
      });
      if (duplicateUsername) {
        return errorResponse("DUPLICATE_USERNAME", "Username is already taken", 409, "username");
      }
    }

    // Check for duplicate email (excluding current user)
    if (data.email && data.email !== existingUser.email) {
      const duplicateEmail = await prisma.user.findUnique({
        where: { email: data.email },
      });
      if (duplicateEmail) {
        return errorResponse("DUPLICATE_EMAIL", "Email is already registered", 409, "email");
      }
    }

    // Prevent deactivating or demoting the last SUPER_ADMIN
    if (
      existingUser.role === UserRole.SUPER_ADMIN &&
      (data.role !== undefined || data.isActive === false)
    ) {
      const superAdminCount = await prisma.user.count({
        where: { role: UserRole.SUPER_ADMIN, isActive: true },
      });
      const isDowngrade = data.role !== undefined && data.role !== UserRole.SUPER_ADMIN;
      const isDeactivation = data.isActive === false;
      if (superAdminCount <= 1 && (isDowngrade || isDeactivation)) {
        return errorResponse(
          "LAST_SUPER_ADMIN",
          "Cannot demote or deactivate the last active super admin",
          400
        );
      }
    }

    const updateData: Record<string, unknown> = {};
    if (data.username !== undefined) updateData.username = data.username;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.firstName !== undefined) updateData.firstName = data.firstName;
    if (data.lastName !== undefined) updateData.lastName = data.lastName;
    if (data.role !== undefined) updateData.role = data.role;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.password) updateData.passwordHash = await hashPassword(data.password);

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
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
    });

    return successResponse({ user: updatedUser });
  } catch (error) {
    return handleApiError(error);
  }
}

// ============================================
// DELETE /api/users/[id] - Delete user
// ============================================

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const requestingUser = requireRole(request, "SUPER_ADMIN");
    if (requestingUser instanceof Response) return requestingUser;

    const existingUser = await prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      return errorResponse("USER_NOT_FOUND", "User not found", 404);
    }

    // Prevent deleting yourself
    if (requestingUser.userId === id) {
      return errorResponse("CANNOT_DELETE_SELF", "You cannot delete your own account", 400);
    }

    // Prevent deleting the last active SUPER_ADMIN
    if (existingUser.role === UserRole.SUPER_ADMIN && existingUser.isActive) {
      const superAdminCount = await prisma.user.count({
        where: { role: UserRole.SUPER_ADMIN, isActive: true },
      });
      if (superAdminCount <= 1) {
        return errorResponse(
          "LAST_SUPER_ADMIN",
          "Cannot delete the last active super admin",
          400
        );
      }
    }

    await prisma.user.delete({ where: { id } });

    return successResponse({ message: "User deleted successfully", deletedUserId: id });
  } catch (error) {
    return handleApiError(error);
  }
}
