/**
 * PUT /api/elements/reorder - Bulk reorder custom elements
 *
 * Updates the order field for multiple elements in a single transaction
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

const reorderElementsSchema = z.object({
  sectionId: z.string().uuid("Invalid section ID"),
  parentId: z.string().uuid("Invalid parent ID").optional(),
  elements: z.array(
    z.object({
      id: z.string().uuid("Invalid element ID"),
      order: z.number().int().min(0),
    })
  ).min(1, "At least one element required"),
});

export async function PUT(request: NextRequest) {
  try {
    // Require EDITOR role
    const user = requireRole(request, "EDITOR");
    if (user instanceof Response) return user;

    // Parse and validate request body
    const body = await request.json();
    const validation = reorderElementsSchema.safeParse(body);

    if (!validation.success) {
      return errorResponse(
        "VALIDATION_ERROR",
        validation.error.issues[0].message,
        400,
        validation.error.issues[0].path[0] as string
      );
    }

    const { sectionId, parentId, elements } = validation.data;

    // Check if section exists
    const section = await prisma.section.findUnique({
      where: { id: sectionId },
    });

    if (!section) {
      return errorResponse("SECTION_NOT_FOUND", "Section not found", 404);
    }

    // Verify all elements belong to this section and parent
    const elementIds = elements.map((e) => e.id);
    const existingElements = await prisma.customElement.findMany({
      where: {
        id: { in: elementIds },
        sectionId,
        parentId: parentId || null,
      },
    });

    if (existingElements.length !== elements.length) {
      return errorResponse(
        "INVALID_ELEMENTS",
        "One or more elements do not belong to this section/parent",
        400
      );
    }

    // Update all elements in a transaction
    await prisma.$transaction(
      elements.map((element) =>
        prisma.customElement.update({
          where: { id: element.id },
          data: { order: element.order },
        })
      )
    );

    // Fetch updated elements
    const updatedElements = await prisma.customElement.findMany({
      where: {
        sectionId,
        parentId: parentId || null,
      },
      orderBy: { order: "asc" },
      select: {
        id: true,
        type: true,
        order: true,
      },
    });

    return successResponse({
      message: "Elements reordered successfully",
      elements: updatedElements,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
