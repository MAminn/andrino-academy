import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { ModuleType, ModuleCategory } from "@/generated/prisma";

// File size limits (in bytes)
const FILE_SIZE_LIMITS = {
  VIDEO: 2 * 1024 * 1024 * 1024, // 2GB
  PDF: 100 * 1024 * 1024, // 100MB
  DOCUMENT: 50 * 1024 * 1024, // 50MB
  IMAGE: 50 * 1024 * 1024, // 50MB
};

// Allowed MIME types
const ALLOWED_MIME_TYPES = {
  VIDEO: [
    "video/mp4",
    "video/webm",
    "video/ogg",
    "video/quicktime",
    "video/x-msvideo",
    "video/x-matroska",
  ],
  PDF: ["application/pdf"],
  DOCUMENT: [
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "text/plain",
  ],
  IMAGE: ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp", "image/svg+xml"],
};

// GET /api/modules - Get all modules (with filters)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const trackId = searchParams.get("trackId");
    const sessionId = searchParams.get("sessionId");
    const type = searchParams.get("type") as ModuleType | null;
    const category = searchParams.get("category") as ModuleCategory | null;
    const isPublished = searchParams.get("isPublished");

    // Build filter
    const where: any = {};

    if (trackId) {
      where.trackId = trackId;
    }

    if (sessionId) {
      where.sessionId = sessionId;
    }

    if (type) {
      where.type = type;
    }

    if (category) {
      where.category = category;
    }

    // Students can only see published modules
    if (session.user.role === "student") {
      where.isPublished = true;
    } else if (isPublished !== null && isPublished !== undefined) {
      where.isPublished = isPublished === "true";
    }

    const modules = await prisma.module.findMany({
      where,
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
        attachedTo: {
          include: {
            parentModule: {
              select: {
                id: true,
                title: true,
                type: true,
              },
            },
          },
        },
        attachments: {
          include: {
            attachedModule: {
              select: {
                id: true,
                title: true,
                type: true,
                fileUrl: true,
                fileName: true,
                fileSize: true,
                mimeType: true,
                category: true,
              },
            },
          },
          orderBy: { order: "asc" },
        },
      },
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    });

    return NextResponse.json({ modules });
  } catch (error) {
    console.error("Error fetching modules:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/modules - Create a new module with file upload (Manager only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only manager and CEO can create modules
    if (!["manager", "ceo"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const formData = await request.formData();

    // Extract form fields
    const title = formData.get("title") as string;
    const description = formData.get("description") as string | null;
    const type = formData.get("type") as ModuleType;
    const category = formData.get("category") as ModuleCategory;
    const trackId = formData.get("trackId") as string;
    const sessionId = formData.get("sessionId") as string | null;
    const order = formData.get("order") as string | null;
    const isPublished = formData.get("isPublished") === "true";
    const file = formData.get("file") as File;

    // Validation
    if (!title || !type || !trackId || !file) {
      return NextResponse.json(
        { error: "Title, type, trackId, and file are required" },
        { status: 400 }
      );
    }

    // Verify track exists
    const track = await prisma.track.findUnique({
      where: { id: trackId },
    });

    if (!track) {
      return NextResponse.json(
        { error: "Track not found" },
        { status: 404 }
      );
    }

    // Verify session if provided
    if (sessionId) {
      const session = await prisma.liveSession.findUnique({
        where: { id: sessionId },
      });

      if (!session) {
        return NextResponse.json(
          { error: "Session not found" },
          { status: 404 }
        );
      }
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

    // Extract video duration if it's a video (placeholder - requires ffmpeg in production)
    let duration: number | null = null;
    if (type === "VIDEO") {
      // TODO: Implement video duration extraction with ffmpeg
      // For now, set to null and can be updated later
      duration = null;
    }

    // Create module in database
    const module = await prisma.module.create({
      data: {
        title,
        description: description || null,
        type,
        category: category || "UNCATEGORIZED",
        fileUrl: `/uploads/modules/${filename}`,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        duration,
        order: order ? parseInt(order) : 0,
        isPublished,
        trackId,
        sessionId: sessionId || null,
        uploadedBy: session.user.email || "",
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

    return NextResponse.json(
      { module, message: "Module created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating module:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/modules - Delete multiple modules (Manager only)
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only manager and CEO can delete modules
    if (!["manager", "ceo"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const ids = searchParams.get("ids")?.split(",");

    if (!ids || ids.length === 0) {
      return NextResponse.json(
        { error: "Module IDs are required" },
        { status: 400 }
      );
    }

    // Delete modules
    await prisma.module.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    });

    return NextResponse.json({
      message: `${ids.length} module(s) deleted successfully`,
    });
  } catch (error) {
    console.error("Error deleting modules:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
