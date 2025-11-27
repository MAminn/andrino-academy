import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
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
  "image/jpeg",
  "image/png",
];

const MAX_FILE_SIZE = 5 * 1024 * 1024 * 1024; // 5GB

// GET /api/assignments/[id]/submissions - Get all submissions for an assignment
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: assignmentId } = await params;

    // Verify assignment exists
    const assignment = await prisma.assignmentNew.findUnique({
      where: { id: assignmentId },
      include: {
        module: {
          include: {
            track: {
              include: {
                instructor: true,
              },
            },
          },
        },
      },
    });

    if (!assignment) {
      return NextResponse.json(
        { error: "Assignment not found" },
        { status: 404 }
      );
    }

    // Students can only see their own submissions
    // Instructors/Managers/CEO can see all submissions
    const where: any = { assignmentId };

    if (session.user.role === "student") {
      where.studentId = session.user.id;
    } else if (session.user.role === "instructor") {
      // Verify instructor is assigned to the track
      if (assignment.module.track.instructorId !== session.user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    } else if (!["manager", "ceo", "coordinator"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const submissions = await prisma.assignmentSubmissionNew.findMany({
      where,
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        grader: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ submissions });
  } catch (error) {
    console.error("Error fetching submissions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/assignments/[id]/submissions - Submit an assignment (student)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only students can submit assignments
    if (session.user.role !== "student") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id: assignmentId } = await params;

    // Verify assignment exists
    const assignment = await prisma.assignmentNew.findUnique({
      where: { id: assignmentId },
    });

    if (!assignment) {
      return NextResponse.json(
        { error: "Assignment not found" },
        { status: 404 }
      );
    }

    // Check if student already submitted
    const existingSubmission = await prisma.assignmentSubmissionNew.findFirst({
      where: {
        assignmentId,
        studentId: session.user.id,
      },
    });

    if (existingSubmission) {
      return NextResponse.json(
        { error: "You have already submitted this assignment. Contact instructor to resubmit." },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    // Validation
    if (!file) {
      return NextResponse.json(
        { error: "file is required" },
        { status: 400 }
      );
    }

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
    const uploadDir = path.join(process.cwd(), "public", "uploads", "submissions");
    const filePath = path.join(uploadDir, filename);

    // Ensure upload directory exists
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Write file to disk
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Create submission
    const submission = await prisma.assignmentSubmissionNew.create({
      data: {
        assignmentId,
        studentId: session.user.id,
        fileUrl: `/uploads/submissions/${filename}`,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
      },
      include: {
        assignment: {
          select: {
            id: true,
            title: true,
            dueDate: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        message: "Assignment submitted successfully",
        submission,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error submitting assignment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
