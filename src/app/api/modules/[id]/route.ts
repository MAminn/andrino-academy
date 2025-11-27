import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";
import { unlink } from "fs/promises";
import fs from "fs";
import path from "path";
import { ModuleCategory } from "@prisma/client";

// Route segment config for large file uploads
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes

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

    // Check content type to handle both JSON and FormData
    const contentType = request.headers.get("content-type") || "";
    let title, description, category, targetAudience, trackId, order, isPublished, sessionId, weekNumber, startDate;

    if (contentType.includes("multipart/form-data")) {
      // Handle FormData (from multi-week upload)
      const formData = await request.formData();
      title = formData.get("title") as string | null;
      description = formData.get("description") as string | null;
      category = formData.get("category") as string | null;
      targetAudience = formData.get("targetAudience") as string | null;
      trackId = formData.get("trackId") as string | null;
      order = formData.get("order") as string | null;
      isPublished = formData.get("isPublished") as string | null;
      sessionId = formData.get("sessionId") as string | null;
      weekNumber = formData.get("weekNumber") as string | null;
      startDate = formData.get("startDate") as string | null;
    } else {
      // Handle JSON (from simple update)
      const body = await request.json();
      title = body.title;
      description = body.description;
      category = body.category;
      targetAudience = body.targetAudience;
      trackId = body.trackId;
      order = body.order;
      isPublished = body.isPublished;
      sessionId = body.sessionId;
      weekNumber = body.weekNumber;
      startDate = body.startDate;
    }

    // Build update data
    const updateData: any = {};

    if (title !== undefined && title !== null) updateData.title = title;
    if (description !== undefined && description !== null) updateData.description = description;
    if (category !== undefined && category !== null) updateData.category = category as ModuleCategory;
    if (targetAudience !== undefined && targetAudience !== null) updateData.targetAudience = targetAudience;
    if (trackId !== undefined && trackId !== null) updateData.trackId = trackId;
    if (order !== undefined && order !== null) updateData.order = parseInt(order as string);
    if (isPublished !== undefined && isPublished !== null) updateData.isPublished = isPublished === "true" || isPublished === true;
    if (sessionId !== undefined && sessionId !== null) updateData.sessionId = sessionId;
    if (weekNumber !== undefined && weekNumber !== null) updateData.weekNumber = parseInt(weekNumber as string);
    if (startDate !== undefined && startDate !== null) updateData.startDate = new Date(startDate as string);

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
