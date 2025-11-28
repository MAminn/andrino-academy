import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

import { db, schema, eq, and, or, desc, asc, count, sql, isNull, inArray } from "@/lib/db";

// POST /api/students/assign-grade - Bulk assign students to grade
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only manager and CEO can assign grades
    if (!["manager", "ceo"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    console.log("Received body:", body); // Debug log
    const { studentIds, studentId, gradeId } = body;

    // Support both single and bulk assignment
    let studentIdsArray: string[];
    if (studentIds && Array.isArray(studentIds)) {
      studentIdsArray = studentIds;
    } else if (studentId && typeof studentId === "string") {
      studentIdsArray = [studentId];
    } else {
      return NextResponse.json(
        { error: "Either studentIds array or studentId is required" },
        { status: 400 }
      );
    }

    if (studentIdsArray.length === 0) {
      return NextResponse.json(
        { error: "At least one student ID is required" },
        { status: 400 }
      );
    }

    if (!gradeId) {
      return NextResponse.json(
        { error: "Grade ID is required" },
        { status: 400 }
      );
    }

    // Verify grade exists
    const grade = await db
      .select()
      .from(schema.grades)
      .where(eq(schema.grades.id, gradeId))
      .then((r) => r[0]);

    if (!grade) {
      return NextResponse.json({ error: "Grade not found" }, { status: 400 });
    }

    if (!grade.isActive) {
      return NextResponse.json(
        { error: "Cannot assign students to inactive grade" },
        { status: 400 }
      );
    }

    // Verify all users are students
    const users = await db
      .select({ id: schema.users.id, name: schema.users.name, email: schema.users.email })
      .from(schema.users)
      .where(and(inArray(schema.users.id, studentIdsArray), eq(schema.users.role, "student")));

    if (users.length !== studentIdsArray.length) {
      return NextResponse.json(
        { error: "Some users are not valid students" },
        { status: 400 }
      );
    }

    // Bulk update students
    const updateResult = await db
      .update(schema.users)
      .set({ gradeId: gradeId })
      .where(and(inArray(schema.users.id, studentIdsArray), eq(schema.users.role, "student")));

    // Get updated students with grade relation
    const updatedStudentsBase = await db
      .select({
        id: schema.users.id,
        name: schema.users.name,
        email: schema.users.email,
        age: schema.users.age,
        priorExperience: schema.users.priorExperience,
        gradeId: schema.users.gradeId,
      })
      .from(schema.users)
      .where(inArray(schema.users.id, studentIdsArray));

    // Fetch grade relation for each student
    const updatedStudents = await Promise.all(
      updatedStudentsBase.map(async (student) => {
        const assignedGrade = student.gradeId
          ? await db
              .select({ id: schema.grades.id, name: schema.grades.name, description: schema.grades.description })
              .from(schema.grades)
              .where(eq(schema.grades.id, student.gradeId))
              .then((r) => r[0] || null)
          : null;
        return { ...student, assignedGrade };
      })
    );

    // Log the assignment
    console.log(
      `${updatedStudents.length} students assigned to grade ${grade.name} by ${session.user.email}`
    );

    return NextResponse.json({
      students: updatedStudents,
      assignedCount: updatedStudents.length,
      message: `${updatedStudents.length} students assigned to grade ${grade.name} successfully`,
    });
  } catch (error) {
    console.error("Error assigning students to grade:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

