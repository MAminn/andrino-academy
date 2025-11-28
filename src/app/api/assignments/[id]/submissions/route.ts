import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db, schema, eq, and, desc } from "@/lib/db";
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
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: assignmentId } = await params;

    // Verify assignment exists
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

    // Fetch nested relations
    const [module] = await db
      .select()
      .from(schema.modules)
      .where(eq(schema.modules.id, assignment.moduleId!))
      .limit(1);

    const [track] = await db
      .select()
      .from(schema.tracks)
      .where(eq(schema.tracks.id, module!.trackId!))
      .limit(1);

    const [instructor] = track!.instructorId ? await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, track!.instructorId))
      .limit(1) : [null];

    const assignmentWithRelations = {
      ...assignment,
      module: {
        ...module,
        track: {
          ...track,
          instructor
        }
      }
    };

    // Students can only see their own submissions
    // Instructors/Managers/CEO can see all submissions
    const whereConditions: any[] = [eq(schema.assignmentSubmissions.assignmentId, assignmentId)];

    if (session.user.role === "student") {
      whereConditions.push(eq(schema.assignmentSubmissions.studentId, session.user.id));
    } else if (session.user.role === "instructor") {
      // Verify instructor is assigned to the track
      if (assignmentWithRelations.module.track.instructorId !== session.user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    } else if (!["manager", "ceo", "coordinator"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const submissions = await db
      .select()
      .from(schema.assignmentSubmissions)
      .where(and(...whereConditions))
      .orderBy(desc(schema.assignmentSubmissions.submittedAt));

    // Fetch student and grader for each submission
    const submissionsWithRelations = await Promise.all(
      submissions.map(async (sub: any) => {
        const [student, grader] = await Promise.all([
          db.select({ id: schema.users.id, name: schema.users.name, email: schema.users.email })
            .from(schema.users)
            .where(eq(schema.users.id, sub.studentId))
            .limit(1)
            .then(r => r[0] || null),
          sub.gradedBy ? db.select({ id: schema.users.id, name: schema.users.name })
            .from(schema.users)
            .where(eq(schema.users.id, sub.gradedBy))
            .limit(1)
            .then(r => r[0] || null) : Promise.resolve(null)
        ]);
        return { ...sub, student, grader };
      })
    );

    return NextResponse.json({ submissions: submissionsWithRelations });
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
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only students can submit assignments
    if (session.user.role !== "student") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id: assignmentId } = await params;

    // Verify assignment exists
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

    // Check if student already submitted
    const existingSubmission = await db
      .select()
      .from(schema.assignmentSubmissions)
      .where(
        and(
          eq(schema.assignmentSubmissions.assignmentId, assignmentId),
          eq(schema.assignmentSubmissions.studentId, session.user.id)
        )
      )
      .limit(1);

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
    const result = await db
      .insert(schema.assignmentSubmissions)
      .values({
        assignmentId,
        studentId: session.user.id,
        fileUrl: `/uploads/submissions/${filename}`,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
      });

    const [submission] = await db
      .select()
      .from(schema.assignmentSubmissions)
      .where(eq(schema.assignmentSubmissions.id, String(result[0].insertId)))
      .limit(1);

    const [assignmentData] = await db
      .select({ id: schema.assignments.id, title: schema.assignments.title, dueDate: schema.assignments.dueDate })
      .from(schema.assignments)
      .where(eq(schema.assignments.id, assignmentId))
      .limit(1);

    const submissionWithRelations = {
      ...submission,
      assignment: assignmentData
    };

    return NextResponse.json(
      {
        message: "Assignment submitted successfully",
        submission: submissionWithRelations,
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
