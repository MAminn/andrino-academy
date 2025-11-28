import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db, schema, eq } from "@/lib/db";

// PUT /api/assignments/submissions/[id]/grade - Grade a submission (instructor/manager/ceo)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: submissionId } = await params;

    // Fetch submission
    const [submissionData] = await db
      .select()
      .from(schema.assignmentSubmissions)
      .where(eq(schema.assignmentSubmissions.id, submissionId))
      .limit(1);

    if (!submissionData) {
      return NextResponse.json(
        { error: "Submission not found" },
        { status: 404 }
      );
    }

    // Fetch assignment with module and track
    const [assignment] = await db
      .select()
      .from(schema.assignments)
      .where(eq(schema.assignments.id, submissionData.assignmentId))
      .limit(1);

    const [module] = await db
      .select()
      .from(schema.modules)
      .where(eq(schema.modules.id, assignment.moduleId))
      .limit(1);

    const [track] = await db
      .select()
      .from(schema.tracks)
      .where(eq(schema.tracks.id, module.trackId))
      .limit(1);

    const [instructor] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, track.instructorId))
      .limit(1);

    const [student] = await db
      .select({ id: schema.users.id, name: schema.users.name, email: schema.users.email })
      .from(schema.users)
      .where(eq(schema.users.id, submissionData.studentId))
      .limit(1);

    const submission: any = {
      ...submissionData,
      assignment: {
        ...assignment,
        module: {
          ...module,
          track: {
            ...track,
            instructor,
          },
        },
      },
      student,
    };

    // Permission check
    const isInstructor = session.user.role === "instructor" &&
      track.instructorId === session.user.id;
    const isAdmin = ["manager", "ceo"].includes(session.user.role);

    if (!isInstructor && !isAdmin) {
      return NextResponse.json(
        { error: "Forbidden. Only the assigned instructor or admin can grade this submission." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { grade, feedback } = body;

    // Validation
    if (grade === undefined || grade === null) {
      return NextResponse.json(
        { error: "grade is required" },
        { status: 400 }
      );
    }

    if (typeof grade !== "number" || grade < 0 || grade > 100) {
      return NextResponse.json(
        { error: "grade must be a number between 0 and 100" },
        { status: 400 }
      );
    }

    // Update submission with grade
    await db
      .update(schema.assignmentSubmissions)
      .set({
        grade,
        feedback: feedback || null,
        gradedAt: new Date(),
        gradedBy: session.user.id,
      })
      .where(eq(schema.assignmentSubmissions.id, submissionId));

    // Fetch updated submission with related data
    const [updatedSubmission] = await db
      .select()
      .from(schema.assignmentSubmissions)
      .where(eq(schema.assignmentSubmissions.id, submissionId))
      .limit(1);

    const [updatedStudent] = await db
      .select({ id: schema.users.id, name: schema.users.name, email: schema.users.email })
      .from(schema.users)
      .where(eq(schema.users.id, updatedSubmission.studentId))
      .limit(1);

    let grader: any = null;
    if (updatedSubmission.gradedBy) {
      const [graderData] = await db
        .select({ id: schema.users.id, name: schema.users.name, email: schema.users.email })
        .from(schema.users)
        .where(eq(schema.users.id, updatedSubmission.gradedBy))
        .limit(1);
      grader = graderData;
    }

    const [assignmentData] = await db
      .select({ id: schema.assignments.id, title: schema.assignments.title, dueDate: schema.assignments.dueDate })
      .from(schema.assignments)
      .where(eq(schema.assignments.id, updatedSubmission.assignmentId))
      .limit(1);

    const gradedSubmission: any = {
      ...updatedSubmission,
      student: updatedStudent,
      grader,
      assignment: assignmentData,
    };

    return NextResponse.json({
      message: "Submission graded successfully",
      submission: gradedSubmission,
    });
  } catch (error) {
    console.error("Error grading submission:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
