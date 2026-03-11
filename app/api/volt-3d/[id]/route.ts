/**
 * GET    /api/volt-3d/[id]  — full asset with all versions
 * DELETE /api/volt-3d/[id]  — delete asset and all its files
 * PATCH  /api/volt-3d/[id]  — update triggerConfig JSON
 *
 * Auth: JWT session cookie OR Bearer vlt_* API key
 */

import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"
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
// GET /api/volt-3d/[id]
// ============================================

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params

    const auth = await resolveUser(request)
    if (!auth) return errorResponse("UNAUTHORIZED", "Authentication required", 401)
    if ("status" in auth && typeof auth.status === "number") return auth

    const { userId } = auth as ResolvedUser

    const asset = await prisma.volt3DAsset.findUnique({
      where: { id },
      include: {
        versions: {
          orderBy: { versionNum: "desc" },
        },
      },
    })

    if (!asset || asset.authorId !== userId) {
      return errorResponse("NOT_FOUND", "Asset not found", 404)
    }

    return successResponse({ asset })
  } catch (error) {
    return handleApiError(error)
  }
}

// ============================================
// DELETE /api/volt-3d/[id]
// ============================================

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params

    const auth = await resolveUser(request)
    if (!auth) return errorResponse("UNAUTHORIZED", "Authentication required", 401)
    if ("status" in auth && typeof auth.status === "number") return auth

    const { userId } = auth as ResolvedUser

    const asset = await prisma.volt3DAsset.findUnique({
      where: { id },
      include: { versions: true },
    })

    if (!asset || asset.authorId !== userId) {
      return errorResponse("NOT_FOUND", "Asset not found", 404)
    }

    // Delete all version files from disk
    for (const version of asset.versions) {
      await deleteUploadedFile(version.glbPath)
      if (version.blendPath) await deleteUploadedFile(version.blendPath)
    }

    // Delete DB record (cascade deletes versions)
    await prisma.volt3DAsset.delete({ where: { id } })

    return successResponse({ deleted: true })
  } catch (error) {
    return handleApiError(error)
  }
}

// ============================================
// PATCH /api/volt-3d/[id]
// ============================================

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params

    const auth = await resolveUser(request)
    if (!auth) return errorResponse("UNAUTHORIZED", "Authentication required", 401)
    if ("status" in auth && typeof auth.status === "number") return auth

    const { userId } = auth as ResolvedUser

    const asset = await prisma.volt3DAsset.findUnique({ where: { id } })
    if (!asset || asset.authorId !== userId) {
      return errorResponse("NOT_FOUND", "Asset not found", 404)
    }

    const body = await request.json()
    const { triggerConfig } = body as { triggerConfig: unknown }

    const updated = await prisma.volt3DAsset.update({
      where: { id },
      data: {
        triggerConfig:
          triggerConfig === undefined || triggerConfig === null
            ? Prisma.JsonNull
            : (triggerConfig as Prisma.InputJsonValue),
      },
    })

    return successResponse({ asset: updated })
  } catch (error) {
    return handleApiError(error)
  }
}
