import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db, schema, eq, and, asc, desc } from "@/lib/db";
import { writeFile, mkdir, unlink } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

// Route segment config for large file uploads
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes

const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
  "application/zip",
  "application/x-zip-compressed",
];

const MAX_FILE_SIZE = 5 * 1024 * 1024 * 1024; // 5GB

// GET /api/modules/[id]/assignments - List all assignments for a module
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const assignments = await db
      .select()
      .from(schema.assignments)
      .where(eq(schema.assignments.moduleId, id))
      .orderBy(asc(schema.assignments.order));

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
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only manager and CEO can create assignments
    if (!["manager", "ceo"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id: moduleId } = await params;

    // Verify module exists
    const [module] = await db
      .select()
      .from(schema.modules)
      .where(eq(schema.modules.id, moduleId))
      .limit(1);

    const lastAssignment = await db
      .select()
      .from(schema.assignments)
      .where(eq(schema.assignments.moduleId, moduleId))
      .orderBy(desc(schema.assignments.order))
      .limit(1);

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

      fileUrl = `/api/uploads/assignments/${filename}`;
      fileName = file.name;
      fileSize = file.size;
      mimeType = file.type;
    }

    // Determine order (auto-increment if not provided)
    const assignmentOrder = order
      ? parseInt(order)
      : (lastAssignment[0]?.order ?? -1) + 1;

    // Create assignment
    const result = await db
      .insert(schema.assignments)
      .values({
        moduleId,
        title,
        description,
        fileUrl,
        fileName,
        fileSize,
        mimeType,
        dueDate: dueDate ? new Date(dueDate) : null,
        order: assignmentOrder,
      });

    const [assignment] = await db
      .select()
      .from(schema.assignments)
      .where(eq(schema.assignments.id, String(result[0].insertId)))
      .limit(1);

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
    const session = await auth.api.getSession({ headers: request.headers });

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
    await db
      .update(schema.assignments)
      .set(updateData)
      .where(eq(schema.assignments.id, assignmentId));

    const [assignment] = await db
      .select()
      .from(schema.assignments)
      .where(eq(schema.assignments.id, assignmentId))
      .limit(1);

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
    const session = await auth.api.getSession({ headers: request.headers });

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
    const [assignment] = await db
      .select()
      .from(schema.assignments)
      .where(eq(schema.assignments.id, assignmentId))
      .limit(1);

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
    await db
      .delete(schema.assignments)
      .where(eq(schema.assignments.id, assignmentId));

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
