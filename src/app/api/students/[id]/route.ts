import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db, schema, eq, and, asc, desc, count } from "@/lib/db";

// GET /api/students/[id] - Get a specific student
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Students can access their own data, managers and CEO can access any student
    if (session.user.role === "student") {
      // Students can only access their own data
      if (session.user.id !== id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    } else if (
      !["manager", "ceo", "coordinator", "instructor"].includes(
        session.user.role
      )
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Fetch user data
    const [userData] = await db
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
        phone: schema.users.phone,
        address: schema.users.address,
        emergencyContact: schema.users.emergencyContact,
        createdAt: schema.users.createdAt,
        updatedAt: schema.users.updatedAt,
        role: schema.users.role,
      })
      .from(schema.users)
      .where(eq(schema.users.id, id))
      .limit(1);

    if (!userData) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // Check if user is actually a student
    if (userData.role !== "student") {
      return NextResponse.json(
        { error: "User is not a student" },
        { status: 400 }
      );
    }

    // Fetch grade with tracks if assigned
    let assignedGrade: any = null;
    if (userData.gradeId) {
      const [grade] = await db
        .select()
        .from(schema.grades)
        .where(eq(schema.grades.id, userData.gradeId))
        .limit(1);

      if (grade) {
        const tracks = await db
          .select()
          .from(schema.tracks)
          .where(eq(schema.tracks.gradeId, grade.id));

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
              .orderBy(asc(schema.liveSessions.date))
              .limit(5);

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

        assignedGrade = {
          id: grade.id,
          name: grade.name,
          description: grade.description,
          tracks: tracksWithDetails,
        };
      }
    }

    // Fetch attendances
    const attendances = await db
      .select()
      .from(schema.sessionAttendances)
      .where(eq(schema.sessionAttendances.studentId, id))
      .limit(10);

    const sessionAttendances = await Promise.all(
      attendances.map(async (attendance: any) => {
        const [session] = await db
          .select({
            id: schema.liveSessions.id,
            title: schema.liveSessions.title,
            date: schema.liveSessions.date,
            startTime: schema.liveSessions.startTime,
            endTime: schema.liveSessions.endTime,
            trackId: schema.liveSessions.trackId,
          })
          .from(schema.liveSessions)
          .where(eq(schema.liveSessions.id, attendance.sessionId))
          .limit(1);

        const [track] = await db
          .select({ id: schema.tracks.id, name: schema.tracks.name })
          .from(schema.tracks)
          .where(eq(schema.tracks.id, session.trackId))
          .limit(1);

        return {
          ...attendance,
          session: {
            ...session,
            track,
          },
        };
      })
    );

    const student: any = {
      ...userData,
      assignedGrade,
      sessionAttendances,
    };

    delete student.role;

    return NextResponse.json({ student });
  } catch (error) {
    console.error("Error fetching student:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/students/[id] - Update student (mainly for grade assignment)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only manager and CEO can update students
    if (!["manager", "ceo"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { gradeId } = body;

    // Check if student exists
    const [existingStudent] = await db
      .select({
        id: schema.users.id,
        role: schema.users.role,
        gradeId: schema.users.gradeId,
        name: schema.users.name,
        email: schema.users.email,
      })
      .from(schema.users)
      .where(eq(schema.users.id, id))
      .limit(1);

    if (!existingStudent) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    if (existingStudent.role !== "student") {
      return NextResponse.json(
        { error: "User is not a student" },
        { status: 400 }
      );
    }

    // Verify grade exists if provided
    if (gradeId) {
      const [grade] = await db
        .select()
        .from(schema.grades)
        .where(eq(schema.grades.id, gradeId))
        .limit(1);

      if (!grade) {
        return NextResponse.json({ error: "Grade not found" }, { status: 400 });
      }

      if (!grade.isActive) {
        return NextResponse.json(
          { error: "Cannot assign student to inactive grade" },
          { status: 400 }
        );
      }
    }

    // Update student
    const updateData: {
      gradeId?: string | null;
    } = {};

    if (gradeId !== undefined) {
      updateData.gradeId = gradeId;
    }

    await db
      .update(schema.users)
      .set(updateData)
      .where(eq(schema.users.id, id));

    // Fetch updated student
    const [updatedUser] = await db
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
        updatedAt: schema.users.updatedAt,
      })
      .from(schema.users)
      .where(eq(schema.users.id, id))
      .limit(1);

    let assignedGrade: any = null;
    if (updatedUser.gradeId) {
      const [grade] = await db
        .select({
          id: schema.grades.id,
          name: schema.grades.name,
          description: schema.grades.description,
        })
        .from(schema.grades)
        .where(eq(schema.grades.id, updatedUser.gradeId))
        .limit(1);
      assignedGrade = grade;
    }

    const updatedStudent: any = {
      ...updatedUser,
      assignedGrade,
    };

    // Log the grade assignment change
    console.log(
      `Student ${updatedStudent.name} (${updatedStudent.email}) assigned to grade by ${session.user.email}`
    );

    return NextResponse.json({
      student: updatedStudent,
      message: gradeId
        ? `Student assigned to grade successfully`
        : `Student removed from grade successfully`,
    });
  } catch (error) {
    console.error("Error updating student:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
