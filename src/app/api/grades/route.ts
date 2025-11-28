import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db, schema, eq, asc, count } from "@/lib/db";

// GET /api/grades - Get all grades
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only manager, coordinator, instructor, and CEO can view grades
    const allowedRoles = ["manager", "coordinator", "instructor", "ceo"];
    if (!allowedRoles.includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const grades = await db.select().from(schema.grades).orderBy(asc(schema.grades.order));
    
    // Fetch related data for each grade
    const gradesWithDetails = await Promise.all(
      grades.map(async (grade) => {
        const tracks = await db.select().from(schema.tracks).where(eq(schema.tracks.gradeId, grade.id));
        const students = await db.select({ id: schema.users.id, name: schema.users.name, email: schema.users.email }).from(schema.users).where(eq(schema.users.gradeId, grade.id));
        
        return {
          ...grade,
          tracks,
          students,
          _count: {
            students: students.length,
            tracks: tracks.length,
          },
        };
      })
    );

    return NextResponse.json({ grades: gradesWithDetails });
  } catch (error) {
    console.error("Error fetching grades:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/grades - Create a new grade (Manager only)
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only manager and CEO can create grades
    if (!["manager", "ceo"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { name, description, order } = body;

    // Validation
    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { error: "Grade name is required" },
        { status: 400 }
      );
    }

    // Check if grade name already exists
    const [existingGrade] = await db.select().from(schema.grades).where(eq(schema.grades.name, name)).limit(1);

    if (existingGrade) {
      return NextResponse.json(
        { error: "Grade name already exists" },
        { status: 400 }
      );
    }

    // If no order provided, set it to the next available order
    let gradeOrder = order;
    if (!gradeOrder) {
      const lastGrades = await db.select().from(schema.grades).orderBy(asc(schema.grades.order)).limit(1);
      gradeOrder = (lastGrades[0]?.order || 0) + 1;
    }

    const [grade] = await db.insert(schema.grades).values({
      name,
      description,
      order: gradeOrder,
      isActive: true,
    }).$returningId();

    return NextResponse.json({ grade }, { status: 201 });
  } catch (error) {
    console.error("Error creating grade:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
