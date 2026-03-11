/**
 * POST /api/volt-3d/[id]/confirm
 *
 * Confirm a specific version of a 3D asset:
 * - Marks the version as confirmed (isConfirmed: true)
 * - Sets asset.activeVersionId to that version
 * - Deletes all OTHER unconfirmed versions (files + DB records)
 *
 * Auth: JWT session cookie OR Bearer vlt_* API key
 */

import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import {
  requireRole,
  successResponse,
  errorResponse,
  handleApiError,
} from "@/lib/api-middleware"
import { getApiKeyUser } from "@/lib/api-keys"
import { deleteUploadedFile } from "@/lib/volt-3d-upload"
import type { NextResponse } from "next/server"
import type { JWTPayload } from "@/lib/auth"
import type { User } from "@prisma/client"

// ============================================
// Auth helpers
// ============================================

interface ResolvedUser {
  userId: string
  role: User["role"]
}

async function resolveUser(req: NextRequest): Promise<ResolvedUser | NextResponse | null> {
  const auth = req.headers.get("authorization")

  if (auth?.startsWith("Bearer vlt_")) {
    const user = await getApiKeyUser(auth)
    if (!user) return null
    return { userId: user.id, role: user.role }
  }

  const result = requireRole(req, "EDITOR")
  if (result instanceof Response) return result as NextResponse
  const jwt = result as JWTPayload
  return { userId: jwt.userId, role: jwt.role }
}

type RouteContext = { params: Promise<{ id: string }> }

// ============================================
// POST /api/volt-3d/[id]/confirm
// ============================================

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params

    const auth = await resolveUser(request)
    if (!auth) return errorResponse("UNAUTHORIZED", "Authentication required", 401)
    if ("status" in auth && typeof auth.status === "number") return auth

    const { userId } = auth as ResolvedUser

    // Verify asset ownership
    const asset = await prisma.volt3DAsset.findUnique({
      where: { id },
      include: { versions: true },
    })

    if (!asset || asset.authorId !== userId) {
      return errorResponse("NOT_FOUND", "Asset not found", 404)
    }

    const body = await request.json()
    const { versionId } = body as { versionId: string }

    if (!versionId) {
      return errorResponse("VALIDATION_ERROR", "versionId is required", 400, "versionId")
    }

    // Verify the version belongs to this asset
    const targetVersion = asset.versions.find((v) => v.id === versionId)
    if (!targetVersion) {
      return errorResponse("NOT_FOUND", "Version not found on this asset", 404)
    }

    // Mark version as confirmed and update activeVersionId atomically
    await prisma.$transaction([
      prisma.volt3DVersion.update({
        where: { id: versionId },
        data: { isConfirmed: true },
      }),
      prisma.volt3DAsset.update({
        where: { id },
        data: { activeVersionId: versionId },
      }),
    ])

    // Delete all OTHER unconfirmed versions (files + DB records)
    const staleVersions = asset.versions.filter(
      (v) => v.id !== versionId && !v.isConfirmed
    )

    for (const v of staleVersions) {
      await deleteUploadedFile(v.glbPath)
      if (v.blendPath) await deleteUploadedFile(v.blendPath)
    }

    if (staleVersions.length > 0) {
      await prisma.volt3DVersion.deleteMany({
        where: { id: { in: staleVersions.map((v) => v.id) } },
      })
    }

    return successResponse({
      confirmedVersionId: versionId,
      deletedVersions: staleVersions.length,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
