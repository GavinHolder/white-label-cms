/**
 * POST /api/pages/[slug]/publish - Publish a draft page
 */

import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import {
  requireRole,
  successResponse,
  errorResponse,
  handleApiError,
} from "@/lib/api-middleware";
import { PageStatus } from "@prisma/client";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug: rawSlug } = await params;
    // Require PUBLISHER role to publish pages
    const user = requireRole(request, "PUBLISHER");
    if (user instanceof Response) return user;

    const slug = decodeURIComponent(rawSlug);

    // Check if page exists
    const page = await prisma.page.findUnique({
      where: { slug },
    });

    if (!page) {
      return errorResponse("PAGE_NOT_FOUND", "Page not found", 404);
    }

    // Check if already published
    if (page.status === PageStatus.PUBLISHED) {
      return errorResponse(
        "ALREADY_PUBLISHED",
        "Page is already published",
        400
      );
    }

    // Copy draft configs to published configs for all sections
    // Using raw SQL since Prisma doesn't support column-to-column copy in updateMany
    await prisma.$executeRaw`UPDATE "Section" SET "config" = "configDraft" WHERE "pageId" = ${page.id}`;

    // Update page status to PUBLISHED
    const publishedPage = await prisma.page.update({
      where: { slug },
      data: {
        status: PageStatus.PUBLISHED,
        publishedAt: new Date(),
        publishedBy: user.userId,
      },
      include: {
        createdByUser: {
          select: {
            username: true,
          },
        },
        sections: {
          select: {
            id: true,
            type: true,
            enabled: true,
          },
        },
      },
    });

    return successResponse({
      message: "Page published successfully",
      page: {
        id: publishedPage.id,
        slug: publishedPage.slug,
        title: publishedPage.title,
        status: publishedPage.status,
        publishedAt: publishedPage.publishedAt,
        sectionCount: publishedPage.sections.length,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
