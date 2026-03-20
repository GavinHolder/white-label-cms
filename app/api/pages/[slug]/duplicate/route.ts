/**
 * POST /api/pages/[slug]/duplicate
 * Duplicate a page (create copy with new slug)
 */

import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireRole, successResponse, errorResponse, handleApiError } from "@/lib/api-middleware";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug: rawSlug } = await params;
    const user = requireRole(request, "EDITOR");
    if (user instanceof Response) return user;

    const slug = decodeURIComponent(rawSlug);

    const source = await prisma.page.findUnique({ where: { slug } });
    if (!source) {
      return errorResponse("PAGE_NOT_FOUND", "Page not found", 404);
    }

    // Generate unique slug for copy
    const baseTitle = `${source.title} (Copy)`;
    const baseSlug = baseTitle.toLowerCase().trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    let newSlug = baseSlug;
    let counter = 1;
    while (await prisma.page.findUnique({ where: { slug: newSlug } })) {
      newSlug = `${baseSlug}-${counter++}`;
    }

    const copy = await prisma.page.create({
      data: {
        slug: newSlug,
        title: baseTitle,
        type: source.type,
        enabled: source.enabled,
        formConfig: source.formConfig ?? undefined,
        metaDescription: source.metaDescription,
        metaTitle: source.metaTitle,
        metaKeywords: source.metaKeywords,
        ogImage: source.ogImage,
        status: "DRAFT",
        createdBy: user.userId,
      },
      include: { createdByUser: { select: { username: true } } },
    });

    return successResponse({ page: { id: copy.id, slug: copy.slug, title: copy.title } }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
