import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir, unlink } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { ModuleType } from "@prisma/client";

// Content type validation
const ALLOWED_MIME_TYPES: Record<string, string[]> = {
  VIDEO: ["video/mp4", "video/webm", "video/ogg"],
  PDF: ["application/pdf"],
  DOCUMENT: [
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "application/msword",
    "application/vnd.ms-powerpoint",
  ],
  IMAGE: ["image/jpeg", "image/png", "image/gif", "image/webp"],
};

const FILE_SIZE_LIMITS: Record<string, number> = {
  VIDEO: 500 * 1024 * 1024, // 500MB
  PDF: 50 * 1024 * 1024, // 50MB
  DOCUMENT: 50 * 1024 * 1024, // 50MB
  IMAGE: 10 * 1024 * 1024, // 10MB
};

// GET /api/modules/[id]/content - List all content items for a module
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

    const contentItems = await prisma.contentItem.findMany({
      where: { moduleId: id },
      orderBy: { order: "asc" },
    });

    return NextResponse.json({ contentItems });
  } catch (error) {
    console.error("Error fetching content items:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/modules/[id]/content - Upload a content item (file)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only manager and CEO can upload content
    if (!["manager", "ceo"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id: moduleId } = await params;

    // Verify module exists
    const module = await prisma.module.findUnique({
      where: { id: moduleId },
      include: {
        contentItems: {
          orderBy: { order: "desc" },
          take: 1,
        },
      },
    });

    if (!module) {
      return NextResponse.json(
        { error: "Module not found" },
        { status: 404 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const type = formData.get("type") as string;
    const order = formData.get("order") as string | null;
    const targetAudience = formData.get("targetAudience") as string | null;

    // Validation
    if (!file || !type) {
      return NextResponse.json(
        { error: "file and type are required" },
        { status: 400 }
      );
    }

    // Validate type
    if (!["VIDEO", "PDF", "DOCUMENT", "IMAGE"].includes(type)) {
      return NextResponse.json(
        { error: "type must be VIDEO, PDF, DOCUMENT, or IMAGE" },
        { status: 400 }
      );
    }

    // Validate file size
    const maxSize = FILE_SIZE_LIMITS[type];
    if (file.size > maxSize) {
      return NextResponse.json(
        {
          error: `File size exceeds limit for ${type} (${maxSize / (1024 * 1024)}MB)`,
        },
        { status: 400 }
      );
    }

    // Validate MIME type
    const allowedTypes = ALLOWED_MIME_TYPES[type];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error: `Invalid file type for ${type}. Allowed types: ${allowedTypes.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const filename = `${timestamp}-${sanitizedFilename}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads", "modules");
    const filePath = path.join(uploadDir, filename);

    // Ensure upload directory exists
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Write file to disk
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Extract video duration if it's a video (placeholder)
    let duration: number | null = null;
    if (type === "VIDEO") {
      // TODO: Implement video duration extraction with ffmpeg
      duration = null;
    }

    // Determine order (auto-increment if not provided)
    const contentOrder = order
      ? parseInt(order)
      : (module.contentItems[0]?.order ?? -1) + 1;

    // Create content item in database
    const contentItem = await prisma.contentItem.create({
      data: {
        moduleId,
        type: type as ModuleType,
        fileUrl: `/uploads/modules/${filename}`,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        duration,
        order: contentOrder,
        targetAudience: targetAudience || null,
      },
    });

    return NextResponse.json(
      {
        message: "Content item uploaded successfully",
        contentItem,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error uploading content item:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/modules/[id]/content - Delete a content item
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only manager and CEO can delete content
    if (!["manager", "ceo"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const contentItemId = searchParams.get("contentItemId");

    if (!contentItemId) {
      return NextResponse.json(
        { error: "contentItemId is required" },
        { status: 400 }
      );
    }

    // Fetch content item
    const contentItem = await prisma.contentItem.findUnique({
      where: { id: contentItemId },
    });

    if (!contentItem) {
      return NextResponse.json(
        { error: "Content item not found" },
        { status: 404 }
      );
    }

    // Delete file from filesystem
    try {
      const filePath = path.join(process.cwd(), "public", contentItem.fileUrl);
      await unlink(filePath);
    } catch (fileError) {
      console.error("Error deleting file:", fileError);
      // Continue with database deletion even if file deletion fails
    }

    // Delete content item from database
    await prisma.contentItem.delete({
      where: { id: contentItemId },
    });

    return NextResponse.json({
      message: "Content item deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting content item:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
