import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db, schema, eq, and, asc, count } from "@/lib/db";

// GET /api/grades/[id] - Get a specific grade
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only manager, coordinator, instructor, and CEO can view grades
    const allowedRoles = ["manager", "coordinator", "instructor", "ceo"];
    if (!allowedRoles.includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Await params in Next.js 15
    const { id } = await params;

    const [gradeData] = await db
      .select()
      .from(schema.grades)
      .where(eq(schema.grades.id, id))
      .limit(1);

    if (!gradeData) {
      return NextResponse.json({ error: "Grade not found" }, { status: 404 });
    }

    // Fetch tracks with nested relations
    const tracks = await db
      .select()
      .from(schema.tracks)
      .where(eq(schema.tracks.gradeId, id));

    const tracksWithDetails = await Promise.all(
      tracks.map(async (track: any) => {
        const [instructor] = await db
          .select({ id: schema.users.id, name: schema.users.name, email: schema.users.email })
          .from(schema.users)
          .where(eq(schema.users.id, track.instructorId))
          .limit(1);

        const [coordinator] = await db
          .select({ id: schema.users.id, name: schema.users.name, email: schema.users.email })
          .from(schema.users)
          .where(eq(schema.users.id, track.coordinatorId))
          .limit(1);

        const liveSessions = await db
          .select({
            id: schema.liveSessions.id,
            title: schema.liveSessions.title,
            date: schema.liveSessions.date,
            startTime: schema.liveSessions.startTime,
            endTime: schema.liveSessions.endTime,
            status: schema.liveSessions.status,
          })
          .from(schema.liveSessions)
          .where(eq(schema.liveSessions.trackId, track.id))
          .orderBy(asc(schema.liveSessions.date));

        const [sessionCount] = await db
          .select({ count: count() })
          .from(schema.liveSessions)
          .where(eq(schema.liveSessions.trackId, track.id));

        return {
          ...track,
          instructor,
          coordinator,
          liveSessions,
          _count: { liveSessions: sessionCount.count },
        };
      })
    );

    // Fetch students
    const students = await db
      .select({
        id: schema.users.id,
        name: schema.users.name,
        email: schema.users.email,
        age: schema.users.age,
        priorExperience: schema.users.priorExperience,
      })
      .from(schema.users)
      .where(eq(schema.users.gradeId, id));

    // Count students and tracks
    const [studentCount] = await db
      .select({ count: count() })
      .from(schema.users)
      .where(eq(schema.users.gradeId, id));

    const [trackCount] = await db
      .select({ count: count() })
      .from(schema.tracks)
      .where(eq(schema.tracks.gradeId, id));

    const grade: any = {
      ...gradeData,
      tracks: tracksWithDetails,
      students,
      _count: {
        students: studentCount.count,
        tracks: trackCount.count,
      },
    };

    return NextResponse.json({ grade });
  } catch (error) {
    console.error("Error fetching grade:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/grades/[id] - Update a specific grade (Manager only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only manager and CEO can update grades
    if (!["manager", "ceo"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { name, description, order, isActive } = body;

    // Await params in Next.js 15
    const { id } = await params;

    // Check if grade exists
    const [existingGrade] = await db
      .select()
      .from(schema.grades)
      .where(eq(schema.grades.id, id))
      .limit(1);

    if (!existingGrade) {
      return NextResponse.json({ error: "Grade not found" }, { status: 404 });
    }

    // Validation
    if (name && typeof name !== "string") {
      return NextResponse.json(
        { error: "Invalid grade name" },
        { status: 400 }
      );
    }

    // Check if new name already exists (if changing name)
    if (name && name !== existingGrade.name) {
      const [nameExists] = await db
        .select()
        .from(schema.grades)
        .where(eq(schema.grades.name, name))
        .limit(1);

      if (nameExists) {
        return NextResponse.json(
          { error: "Grade name already exists" },
          { status: 400 }
        );
      }
    }

    // Update data object
    const updateData: {
      name?: string;
      description?: string | null;
      order?: number | null;
      isActive?: boolean;
    } = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (order !== undefined) updateData.order = order;
    if (isActive !== undefined) updateData.isActive = isActive;

    await db
      .update(schema.grades)
      .set(updateData)
      .where(eq(schema.grades.id, id));

    // Fetch updated grade with counts
    const [updatedGrade] = await db
      .select()
      .from(schema.grades)
      .where(eq(schema.grades.id, id))
      .limit(1);

    const [studentCount] = await db
      .select({ count: count() })
      .from(schema.users)
      .where(eq(schema.users.gradeId, id));

    const [trackCount] = await db
      .select({ count: count() })
      .from(schema.tracks)
      .where(eq(schema.tracks.gradeId, id));

    const grade: any = {
      ...updatedGrade,
      _count: {
        students: studentCount.count,
        tracks: trackCount.count,
      },
    };

    return NextResponse.json({ grade });
  } catch (error) {
    console.error("Error updating grade:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/grades/[id] - Delete a specific grade (Manager only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only manager and CEO can delete grades
    if (!["manager", "ceo"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Await params in Next.js 15
    const { id } = await params;

    // Check if grade exists
    const [existingGrade] = await db
      .select()
      .from(schema.grades)
      .where(eq(schema.grades.id, id))
      .limit(1);

    if (!existingGrade) {
      return NextResponse.json({ error: "Grade not found" }, { status: 404 });
    }

    // Check if grade has students or tracks assigned
    const [studentCount] = await db
      .select({ count: count() })
      .from(schema.users)
      .where(eq(schema.users.gradeId, id));

    const [trackCount] = await db
      .select({ count: count() })
      .from(schema.tracks)
      .where(eq(schema.tracks.gradeId, id));

    if (studentCount.count > 0) {
      return NextResponse.json(
        { error: "Cannot delete grade with assigned students" },
        { status: 400 }
      );
    }

    if (trackCount.count > 0) {
      return NextResponse.json(
        { error: "Cannot delete grade with existing tracks" },
        { status: 400 }
      );
    }

    await db
      .delete(schema.grades)
      .where(eq(schema.grades.id, id));

    return NextResponse.json({ message: "Grade deleted successfully" });
  } catch (error) {
    console.error("Error deleting grade:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
