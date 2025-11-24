import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";
import { unlink } from "fs/promises";
import fs from "fs";
import path from "path";
import { ModuleCategory } from "@prisma/client";

// GET /api/modules/[id] - Get a single module by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const module = await prisma.module.findUnique({
      where: { id },
      include: {
        track: {
          select: {
            id: true,
            name: true,
            gradeId: true,
          },
        },
        session: {
          select: {
            id: true,
            title: true,
            date: true,
          },
        },
        contentItems: {
          orderBy: { order: "asc" },
        },
        tasks: {
          orderBy: { order: "asc" },
        },
        assignments: {
          orderBy: { order: "asc" },
        },
      },
    });

    if (!module) {
      return NextResponse.json(
        { error: "Module not found" },
        { status: 404 }
      );
    }

    // Students can only see published modules
    if (session.user.role === "student" && !module.isPublished) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ module });
  } catch (error) {
    console.error("Error fetching module:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/modules/[id] - Update a module (Manager only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only manager and CEO can update modules
    if (!["manager", "ceo"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    // Check if module exists
    const existingModule = await prisma.module.findUnique({
      where: { id },
    });

    if (!existingModule) {
      return NextResponse.json(
        { error: "Module not found" },
        { status: 404 }
      );
    }

    // Handle metadata update (JSON)
    const body = await request.json();

    // Extract updatable fields
    const {
      title,
      description,
      category,
      targetAudience,
      trackId,
      order,
      isPublished,
      sessionId,
    } = body;

    // Build update data
    const updateData: any = {};

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (category !== undefined) updateData.category = category as ModuleCategory;
    if (targetAudience !== undefined) updateData.targetAudience = targetAudience;
    if (trackId !== undefined) updateData.trackId = trackId;
    if (order !== undefined) updateData.order = order;
    if (isPublished !== undefined) updateData.isPublished = isPublished;
    if (sessionId !== undefined) updateData.sessionId = sessionId;

    // Update module
    const module = await prisma.module.update({
      where: { id },
      data: updateData,
      include: {
        track: {
          select: {
            id: true,
            name: true,
          },
        },
        session: {
          select: {
            id: true,
            title: true,
          },
        },
        contentItems: {
          orderBy: { order: "asc" },
        },
        tasks: {
          orderBy: { order: "asc" },
        },
        assignments: {
          orderBy: { order: "asc" },
        },
      },
    });

    return NextResponse.json({ module, message: "Module updated successfully" });
  } catch (error) {
    console.error("Error updating module:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/modules/[id] - Delete a module (Manager only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only manager and CEO can delete modules
    if (!["manager", "ceo"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    // Check if module exists
    const existingModule = await prisma.module.findUnique({
      where: { id },
      include: {
        contentItems: true,
      },
    });

    if (!existingModule) {
      return NextResponse.json(
        { error: "Module not found" },
        { status: 404 }
      );
    }

    // Delete all content item files from filesystem
    for (const contentItem of existingModule.contentItems) {
      try {
        const filePath = path.join(
          process.cwd(),
          "public",
          contentItem.fileUrl
        );
        await unlink(filePath);
      } catch (fileError) {
        console.error("Error deleting file:", fileError);
        // Continue with next file even if one fails
      }
    }

    // Delete module (contentItems, tasks, assignments will cascade delete)
    await prisma.module.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Module deleted successfully" });
  } catch (error) {
    console.error("Error deleting module:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
