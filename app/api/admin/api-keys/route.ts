/**
 * GET  /api/admin/api-keys  — list current user's API keys
 * POST /api/admin/api-keys  — create a new API key
 *
 * Minimum role: EDITOR
 */

import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import {
  requireRole,
  successResponse,
  errorResponse,
  handleApiError,
} from "@/lib/api-middleware"
import { generateApiKey } from "@/lib/api-keys"

// ============================================
// GET /api/admin/api-keys
// ============================================

export async function GET(request: NextRequest) {
  try {
    const user = requireRole(request, "EDITOR")
    if (user instanceof Response) return user

    const keys = await prisma.apiKey.findMany({
      where: { userId: user.userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        keyPrefix: true,
        label: true,
        createdAt: true,
        lastUsedAt: true,
      },
    })

    return successResponse({ keys })
  } catch (error) {
    return handleApiError(error)
  }
}

// ============================================
// POST /api/admin/api-keys
// ============================================

export async function POST(request: NextRequest) {
  try {
    const user = requireRole(request, "EDITOR")
    if (user instanceof Response) return user

    const body = await request.json()
    const { label } = body

    if (!label?.trim()) {
      return errorResponse("VALIDATION_ERROR", "Label is required", 400, "label")
    }

    const { raw, hash, prefix } = generateApiKey()

    await prisma.apiKey.create({
      data: {
        keyHash: hash,
        keyPrefix: prefix,
        label: label.trim(),
        userId: user.userId,
      },
    })

    // Raw key is returned ONCE and never stored — the caller must save it immediately.
    return successResponse(
      {
        rawKey: raw,
        prefix,
        label: label.trim(),
        note: "Save this key now — it will never be shown again.",
      },
      201
    )
  } catch (error) {
    return handleApiError(error)
  }
}
