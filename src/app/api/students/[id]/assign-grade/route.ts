import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db, schema, eq, and } from "@/lib/db";

// POST /api/students/[id]/assign-grade - Assign student to grade
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only managers and CEOs can assign students to grades
    if (!["manager", "ceo"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { gradeId } = await request.json();
    // Await params in Next.js 15
    const { id: studentId } = await params;

    if (!gradeId) {
      return NextResponse.json(
        { error: "Grade ID is required" },
        { status: 400 }
      );
    }

    // Check if student exists
    const studentData = await db
      .select({ id: schema.users.id })
      .from(schema.users)
      .where(
        and(eq(schema.users.id, studentId), eq(schema.users.role, "student"))
      )
      .limit(1);

    if (studentData.length === 0) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // Check if grade exists
    const gradeData = await db
      .select({ id: schema.grades.id })
      .from(schema.grades)
      .where(eq(schema.grades.id, gradeId))
      .limit(1);

    if (gradeData.length === 0) {
      return NextResponse.json({ error: "Grade not found" }, { status: 404 });
    }

    // Assign student to grade
    await db
      .update(schema.users)
      .set({ gradeId: gradeId })
      .where(eq(schema.users.id, studentId));

    const updatedStudent = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, studentId))
      .limit(1);

    return NextResponse.json({
      message: "Student assigned to grade successfully",
      student: updatedStudent[0],
    });
  } catch (error) {
    console.error("Error assigning student to grade:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
