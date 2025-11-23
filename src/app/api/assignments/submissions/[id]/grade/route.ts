import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

// PUT /api/assignments/submissions/[id]/grade - Grade a submission (instructor/manager/ceo)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: submissionId } = await params;

    // Fetch submission with assignment and module details
    const submission = await prisma.assignmentSubmissionNew.findUnique({
      where: { id: submissionId },
      include: {
        assignment: {
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
        },
        student: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!submission) {
      return NextResponse.json(
        { error: "Submission not found" },
        { status: 404 }
      );
    }

    // Permission check
    const isInstructor = session.user.role === "instructor" &&
      submission.assignment.module.track.instructorId === session.user.id;
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
    const gradedSubmission = await prisma.assignmentSubmissionNew.update({
      where: { id: submissionId },
      data: {
        grade,
        feedback: feedback || null,
        gradedAt: new Date(),
        gradedBy: session.user.id,
      },
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
        assignment: {
          select: {
            id: true,
            title: true,
            dueDate: true,
          },
        },
      },
    });

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
