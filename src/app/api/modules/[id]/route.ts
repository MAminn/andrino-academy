import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";
import { unlink } from "fs/promises";
import fs from "fs";
import path from "path";
import { ModuleCategory } from "@/generated/prisma";

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
        attachments: {
          include: {
            attachedModule: true,
          },
          orderBy: { order: "asc" },
        },
        attachedTo: {
          include: {
            parentModule: true,
          },
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

    // Check content type to determine if it's FormData (file upload) or JSON (metadata only)
    const contentType = request.headers.get("content-type") || "";
    const isFormData = contentType.includes("multipart/form-data");

    if (isFormData) {
      // Handle file replacement
      const formData = await request.formData();
      const file = formData.get("file") as File | null;
      const title = formData.get("title") as string;
      const description = formData.get("description") as string;
      const category = formData.get("category") as ModuleCategory;
      const trackId = formData.get("trackId") as string;
      const isPublished = formData.get("isPublished") === "true";

      if (!file) {
        return NextResponse.json(
          { error: "File is required for file replacement" },
          { status: 400 }
        );
      }

      // Delete old file
      const oldFilePath = path.join(process.cwd(), "public", existingModule.fileUrl);
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }

      // Save new file
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const uploadDir = path.join(process.cwd(), "public", "uploads", "modules");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const filename = `${uniqueSuffix}-${file.name}`;
      const filepath = path.join(uploadDir, filename);

      fs.writeFileSync(filepath, buffer);

      const fileUrl = `/uploads/modules/${filename}`;

      // Update module with new file
      const module = await prisma.module.update({
        where: { id },
        data: {
          title,
          description,
          category,
          trackId,
          isPublished,
          fileUrl,
          fileSize: file.size,
          mimeType: file.type,
        },
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
        },
      });

      return NextResponse.json({ module, message: "Module and file updated successfully" });
    } else {
      // Handle metadata-only update (JSON)
      const body = await request.json();

      // Extract updatable fields
      const {
        title,
        description,
        category,
        trackId,
        order,
        isPublished,
        sessionId,
        duration,
      } = body;

      // Build update data
      const updateData: any = {};

      if (title !== undefined) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      if (category !== undefined) updateData.category = category as ModuleCategory;
      if (trackId !== undefined) updateData.trackId = trackId;
      if (order !== undefined) updateData.order = order;
      if (isPublished !== undefined) updateData.isPublished = isPublished;
      if (sessionId !== undefined) updateData.sessionId = sessionId;
      if (duration !== undefined) updateData.duration = duration;

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
        },
      });

      return NextResponse.json({ module, message: "Module updated successfully" });
    }
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
    });

    if (!existingModule) {
      return NextResponse.json(
        { error: "Module not found" },
        { status: 404 }
      );
    }

    // Delete file from filesystem
    try {
      const filePath = path.join(
        process.cwd(),
        "public",
        existingModule.fileUrl
      );
      await unlink(filePath);
    } catch (fileError) {
      console.error("Error deleting file:", fileError);
      // Continue with database deletion even if file deletion fails
    }

    // Delete module (attachments will cascade delete)
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
