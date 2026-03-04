/**
 * GET /api/media - List media assets with pagination and filtering
 * POST /api/media/upload - Upload media file (handled by upload route)
 */

import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import {
  requireRole,
  successResponse,
  errorResponse,
  handleApiError,
} from "@/lib/api-middleware";

// ============================================
// GET /api/media - List media assets
// ============================================

export async function GET(request: NextRequest) {
  try {
    // Require authentication
    const user = requireRole(request, "VIEWER");
    if (user instanceof Response) return user;

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const perPage = parseInt(searchParams.get("perPage") || "20");
    const mimeType = searchParams.get("mimeType"); // e.g., "image/jpeg"
    const search = searchParams.get("search"); // Search by filename or alt text
    const tag = searchParams.get("tag"); // Filter by tag

    // Build filter
    const where: any = {};

    if (mimeType) {
      if (mimeType === "image") {
        where.mimeType = { startsWith: "image/" };
      } else if (mimeType === "video") {
        where.mimeType = { startsWith: "video/" };
      } else {
        where.mimeType = mimeType;
      }
    }

    if (search) {
      where.OR = [
        { filename: { contains: search, mode: "insensitive" } },
        { originalName: { contains: search, mode: "insensitive" } },
        { altText: { contains: search, mode: "insensitive" } },
      ];
    }

    if (tag) {
      where.tags = { has: tag };
    }

    // Get total count for pagination
    const total = await prisma.mediaAsset.count({
      where,
    });

    // Fetch media assets
    const media = await prisma.mediaAsset.findMany({
      where,
      include: {
        uploadedByUser: {
          select: {
            username: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip: (page - 1) * perPage,
      take: perPage,
    });

    // Format response
    const formattedMedia = media.map((item) => ({
      id: item.id,
      filename: item.filename,
      originalName: item.originalName,
      mimeType: item.mimeType,
      fileSize: item.fileSize,
      width: item.width,
      height: item.height,
      url: item.url,
      thumbnailUrl: item.thumbnailUrl,
      altText: item.altText,
      caption: item.caption,
      tags: item.tags,
      uploadedBy: item.uploadedByUser.username,
      usageCount: item.usageCount,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }));

    return successResponse(
      { media: formattedMedia },
      200,
      {
        total,
        page,
        perPage,
        totalPages: Math.ceil(total / perPage),
      }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
