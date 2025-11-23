import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir, unlink } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
  "application/zip",
  "application/x-zip-compressed",
];

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

// GET /api/modules/[id]/assignments - List all assignments for a module
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

    const assignments = await prisma.assignmentNew.findMany({
      where: { moduleId: id },
      orderBy: { order: "asc" },
    });

    return NextResponse.json({ assignments });
  } catch (error) {
    console.error("Error fetching assignments:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/modules/[id]/assignments - Create a new assignment
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only manager and CEO can create assignments
    if (!["manager", "ceo"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id: moduleId } = await params;

    // Verify module exists
    const module = await prisma.module.findUnique({
      where: { id: moduleId },
      include: {
        assignments: {
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
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const dueDate = formData.get("dueDate") as string | null;
    const order = formData.get("order") as string | null;
    const file = formData.get("file") as File | null;

    // Validation
    if (!title || !description) {
      return NextResponse.json(
        { error: "title and description are required" },
        { status: 400 }
      );
    }

    let fileUrl: string | null = null;
    let fileName: string | null = null;
    let fileSize: number | null = null;
    let mimeType: string | null = null;

    // Handle optional file upload
    if (file) {
      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          {
            error: `File size exceeds limit (${MAX_FILE_SIZE / (1024 * 1024)}MB)`,
          },
          { status: 400 }
        );
      }

      // Validate MIME type
      if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        return NextResponse.json(
          {
            error: `Invalid file type. Allowed types: ${ALLOWED_MIME_TYPES.join(", ")}`,
          },
          { status: 400 }
        );
      }

      // Generate unique filename
      const timestamp = Date.now();
      const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
      const filename = `${timestamp}-${sanitizedFilename}`;
      const uploadDir = path.join(process.cwd(), "public", "uploads", "assignments");
      const filePath = path.join(uploadDir, filename);

      // Ensure upload directory exists
      if (!existsSync(uploadDir)) {
        await mkdir(uploadDir, { recursive: true });
      }

      // Write file to disk
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await writeFile(filePath, buffer);

      fileUrl = `/uploads/assignments/${filename}`;
      fileName = file.name;
      fileSize = file.size;
      mimeType = file.type;
    }

    // Determine order (auto-increment if not provided)
    const assignmentOrder = order
      ? parseInt(order)
      : (module.assignments[0]?.order ?? -1) + 1;

    // Create assignment
    const assignment = await prisma.assignmentNew.create({
      data: {
        moduleId,
        title,
        description,
        fileUrl,
        fileName,
        fileSize,
        mimeType,
        dueDate: dueDate ? new Date(dueDate) : null,
        order: assignmentOrder,
      },
    });

    return NextResponse.json(
      {
        message: "Assignment created successfully",
        assignment,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating assignment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/modules/[id]/assignments - Update an assignment
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only manager and CEO can update assignments
    if (!["manager", "ceo"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const assignmentId = searchParams.get("assignmentId");

    if (!assignmentId) {
      return NextResponse.json(
        { error: "assignmentId is required" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { title, description, dueDate, order } = body;

    // Build update data
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;
    if (order !== undefined) updateData.order = order;

    // Update assignment
    const assignment = await prisma.assignmentNew.update({
      where: { id: assignmentId },
      data: updateData,
    });

    return NextResponse.json({
      message: "Assignment updated successfully",
      assignment,
    });
  } catch (error) {
    console.error("Error updating assignment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/modules/[id]/assignments - Delete an assignment
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only manager and CEO can delete assignments
    if (!["manager", "ceo"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const assignmentId = searchParams.get("assignmentId");

    if (!assignmentId) {
      return NextResponse.json(
        { error: "assignmentId is required" },
        { status: 400 }
      );
    }

    // Fetch assignment
    const assignment = await prisma.assignmentNew.findUnique({
      where: { id: assignmentId },
    });

    if (!assignment) {
      return NextResponse.json(
        { error: "Assignment not found" },
        { status: 404 }
      );
    }

    // Delete file from filesystem if it exists
    if (assignment.fileUrl) {
      try {
        const filePath = path.join(process.cwd(), "public", assignment.fileUrl);
        await unlink(filePath);
      } catch (fileError) {
        console.error("Error deleting file:", fileError);
        // Continue with database deletion even if file deletion fails
      }
    }

    // Delete assignment from database (submissions will cascade delete)
    await prisma.assignmentNew.delete({
      where: { id: assignmentId },
    });

    return NextResponse.json({
      message: "Assignment deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting assignment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
