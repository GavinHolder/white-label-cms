/**
 * GET /api/elements/[id] - Get element by ID
 * PUT /api/elements/[id] - Update element
 * DELETE /api/elements/[id] - Delete element
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
import { ElementType } from "@prisma/client";

// ============================================
// GET /api/elements/[id] - Get element
// ============================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const element = await prisma.customElement.findUnique({
      where: { id },
      include: {
        children: {
          orderBy: {
            order: "asc",
          },
        },
      },
    });

    if (!element) {
      return errorResponse("ELEMENT_NOT_FOUND", "Element not found", 404);
    }

    return successResponse({
      element: {
        id: element.id,
        sectionId: element.sectionId,
        parentId: element.parentId,
        type: element.type,
        order: element.order,
        content: element.content,
        position: element.position,
        spacing: element.spacing,
        styles: element.styles,
        responsiveStyles: element.responsiveStyles,
        children: element.children,
        createdAt: element.createdAt,
        updatedAt: element.updatedAt,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// ============================================
// PUT /api/elements/[id] - Update element
// ============================================

const updateElementSchema = z.object({
  type: z.nativeEnum(ElementType).optional(),
  order: z.number().int().min(0).optional(),
  content: z.any().optional(),
  position: z.any().optional(),
  spacing: z
    .object({
      marginTop: z.number().min(0).optional(),
      marginRight: z.number().min(0).optional(),
      marginBottom: z.number().min(0).optional(),
      marginLeft: z.number().min(0).optional(),
      paddingTop: z.number().min(0).optional(),
      paddingRight: z.number().min(0).optional(),
      paddingBottom: z.number().min(0).optional(),
      paddingLeft: z.number().min(0).optional(),
    })
    .optional(),
  styles: z.any().optional(),
  responsiveStyles: z.any().optional(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Require EDITOR role
    const user = requireRole(request, "EDITOR");
    if (user instanceof Response) return user;

    // Check if element exists
    const existingElement = await prisma.customElement.findUnique({
      where: { id },
    });

    if (!existingElement) {
      return errorResponse("ELEMENT_NOT_FOUND", "Element not found", 404);
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = updateElementSchema.safeParse(body);

    if (!validation.success) {
      return errorResponse(
        "VALIDATION_ERROR",
        validation.error.issues[0].message,
        400,
        validation.error.issues[0].path[0] as string
      );
    }

    const data = validation.data;

    // Update element
    const element = await prisma.customElement.update({
      where: { id },
      data: {
        ...(data.type && { type: data.type }),
        ...(data.order !== undefined && { order: data.order }),
        ...(data.content !== undefined && { content: data.content }),
        ...(data.position !== undefined && { position: data.position }),
        ...(data.spacing && {
          spacing: {
            ...(existingElement.spacing as Record<string, unknown> || {}),
            ...data.spacing,
          },
        }),
        ...(data.styles !== undefined && { styles: data.styles }),
        ...(data.responsiveStyles !== undefined && { responsiveStyles: data.responsiveStyles }),
      },
    });

    return successResponse({
      element: {
        id: element.id,
        sectionId: element.sectionId,
        parentId: element.parentId,
        type: element.type,
        order: element.order,
        content: element.content,
        position: element.position,
        spacing: element.spacing,
        styles: element.styles,
        responsiveStyles: element.responsiveStyles,
        createdAt: element.createdAt,
        updatedAt: element.updatedAt,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// ============================================
// DELETE /api/elements/[id] - Delete element
// ============================================

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Require EDITOR role
    const user = requireRole(request, "EDITOR");
    if (user instanceof Response) return user;

    // Check if element exists
    const element = await prisma.customElement.findUnique({
      where: { id },
      include: {
        children: true,
      },
    });

    if (!element) {
      return errorResponse("ELEMENT_NOT_FOUND", "Element not found", 404);
    }

    // Delete element (children will cascade delete)
    await prisma.customElement.delete({
      where: { id },
    });

    return successResponse({
      message: "Element deleted successfully",
      deletedElement: {
        id: element.id,
        type: element.type,
        childrenDeleted: element.children.length,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
