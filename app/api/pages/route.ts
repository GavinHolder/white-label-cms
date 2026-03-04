/**
 * GET /api/pages - List all pages
 * POST /api/pages - Create new page
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
import { PageType, PageStatus } from "@prisma/client";

// ============================================
// GET /api/pages - List all pages
// ============================================

export async function GET(request: NextRequest) {
  try {
    // Require authentication
    const user = requireRole(request, "VIEWER");
    if (user instanceof Response) return user;

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") as PageStatus | null;
    const type = searchParams.get("type") as PageType | null;

    // Build filter
    const where: any = {};
    if (status) where.status = status;
    if (type) where.type = type;

    // Fetch pages
    const pages = await prisma.page.findMany({
      where,
      include: {
        createdByUser: {
          select: {
            username: true,
            firstName: true,
            lastName: true,
          },
        },
        sections: {
          select: {
            id: true,
            type: true,
            enabled: true,
            order: true,
          },
          orderBy: {
            order: "asc",
          },
        },
      },
      orderBy: [
        { status: "asc" }, // Published first
        { updatedAt: "desc" },
      ],
    });

    // Format response
    const formattedPages = pages.map((page) => ({
      id: page.id,
      slug: page.slug,
      title: page.title,
      type: page.type,
      status: page.status,
      metaDescription: page.metaDescription,
      ogImage: page.ogImage,
      publishedAt: page.publishedAt,
      createdBy: page.createdByUser.username,
      createdAt: page.createdAt,
      updatedAt: page.updatedAt,
      sectionCount: page.sections.length,
      enabledSectionCount: page.sections.filter((s) => s.enabled).length,
    }));

    return successResponse(
      { pages: formattedPages },
      200,
      { total: formattedPages.length }
    );
  } catch (error) {
    return handleApiError(error);
  }
}

// ============================================
// POST /api/pages - Create new page
// ============================================

const createPageSchema = z.object({
  slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-\/]+$/, "Slug must contain only lowercase letters, numbers, hyphens, and slashes"),
  title: z.string().min(1, "Title is required"),
  type: z.nativeEnum(PageType).optional().default(PageType.LANDING),
  metaDescription: z.string().optional(),
  ogImage: z.string().optional(),
  status: z.nativeEnum(PageStatus).optional().default(PageStatus.DRAFT),
});

export async function POST(request: NextRequest) {
  try {
    // Require EDITOR role to create pages
    const user = requireRole(request, "EDITOR");
    if (user instanceof Response) return user;

    // Parse and validate request body
    const body = await request.json();
    const validation = createPageSchema.safeParse(body);

    if (!validation.success) {
      return errorResponse(
        "VALIDATION_ERROR",
        validation.error.issues[0].message,
        400,
        validation.error.issues[0].path[0] as string
      );
    }

    const data = validation.data;

    // Check if slug already exists
    const existingPage = await prisma.page.findUnique({
      where: { slug: data.slug },
    });

    if (existingPage) {
      return errorResponse(
        "DUPLICATE_SLUG",
        "A page with this slug already exists",
        409,
        "slug"
      );
    }

    // Create page
    const page = await prisma.page.create({
      data: {
        ...data,
        createdBy: user.userId,
        publishedAt: data.status === PageStatus.PUBLISHED ? new Date() : null,
        publishedBy: data.status === PageStatus.PUBLISHED ? user.userId : null,
      },
      include: {
        createdByUser: {
          select: {
            username: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return successResponse(
      {
        page: {
          id: page.id,
          slug: page.slug,
          title: page.title,
          type: page.type,
          status: page.status,
          metaDescription: page.metaDescription,
          ogImage: page.ogImage,
          publishedAt: page.publishedAt,
          createdBy: page.createdByUser.username,
          createdAt: page.createdAt,
          updatedAt: page.updatedAt,
        },
      },
      201
    );
  } catch (error) {
    return handleApiError(error);
  }
}
