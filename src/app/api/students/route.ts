import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db, schema, eq, and, asc, isNull } from "@/lib/db";

// GET /api/students - Get students (with optional filters)
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only manager and CEO can view all students
    if (!["manager", "ceo"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const gradeId = searchParams.get("gradeId");
    const unassigned = searchParams.get("unassigned") === "true";

    // Build query
    let query = db
      .select({
        id: schema.users.id,
        name: schema.users.name,
        email: schema.users.email,
        age: schema.users.age,
        parentEmail: schema.users.parentEmail,
        parentPhone: schema.users.parentPhone,
        parentName: schema.users.parentName,
        priorExperience: schema.users.priorExperience,
        gradeLevel: schema.users.gradeLevel,
        gradeId: schema.users.gradeId,
        createdAt: schema.users.createdAt,
        assignedGrade: schema.grades,
      })
      .from(schema.users)
      .leftJoin(schema.grades, eq(schema.users.gradeId, schema.grades.id))
      .where(eq(schema.users.role, "student"));

    if (unassigned) {
      query = db
        .select({
          id: schema.users.id,
          name: schema.users.name,
          email: schema.users.email,
          age: schema.users.age,
          parentEmail: schema.users.parentEmail,
          parentPhone: schema.users.parentPhone,
          parentName: schema.users.parentName,
          priorExperience: schema.users.priorExperience,
          gradeLevel: schema.users.gradeLevel,
          gradeId: schema.users.gradeId,
          createdAt: schema.users.createdAt,
          assignedGrade: schema.grades,
        })
        .from(schema.users)
        .leftJoin(schema.grades, eq(schema.users.gradeId, schema.grades.id))
        .where(and(eq(schema.users.role, "student"), isNull(schema.users.gradeId)));
    } else if (gradeId) {
      query = db
        .select({
          id: schema.users.id,
          name: schema.users.name,
          email: schema.users.email,
          age: schema.users.age,
          parentEmail: schema.users.parentEmail,
          parentPhone: schema.users.parentPhone,
          parentName: schema.users.parentName,
          priorExperience: schema.users.priorExperience,
          gradeLevel: schema.users.gradeLevel,
          gradeId: schema.users.gradeId,
          createdAt: schema.users.createdAt,
          assignedGrade: schema.grades,
        })
        .from(schema.users)
        .leftJoin(schema.grades, eq(schema.users.gradeId, schema.grades.id))
        .where(and(eq(schema.users.role, "student"), eq(schema.users.gradeId, gradeId)));
    }

    const students = await query.orderBy(asc(schema.users.name));

    return NextResponse.json({ students });
  } catch (error) {
    console.error("Error fetching students:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
