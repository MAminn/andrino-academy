import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db, schema, eq, and } from "@/lib/db";

// GET /api/attendance/session/[sessionId] - Get attendance for a specific session
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only instructors and coordinators can view attendance
    if (
      !["instructor", "coordinator", "manager", "ceo"].includes(
        session.user.role
      )
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get the session with attendance data
    const [liveSession] = await db
      .select()
      .from(schema.liveSessions)
      .where(eq(schema.liveSessions.id, sessionId))
      .limit(1);

    if (!liveSession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // Fetch track with grade and instructor
    const [track] = await db
      .select()
      .from(schema.tracks)
      .where(eq(schema.tracks.id, liveSession.trackId))
      .limit(1);

    const [grade, instructor] = await Promise.all([
      track!.gradeId ? db.select({ id: schema.grades.id, name: schema.grades.name })
        .from(schema.grades)
        .where(eq(schema.grades.id, track!.gradeId))
        .limit(1)
        .then(r => r[0] || null) : Promise.resolve(null),
      liveSession.instructorId ? db.select({ id: schema.users.id, name: schema.users.name })
        .from(schema.users)
        .where(eq(schema.users.id, liveSession.instructorId))
        .limit(1)
        .then(r => r[0] || null) : Promise.resolve(null)
    ]);

    // Fetch attendances
    const attendances = await db
      .select()
      .from(schema.sessionAttendances)
      .where(eq(schema.sessionAttendances.sessionId, sessionId));

    // Fetch student for each attendance
    const attendancesWithStudents = await Promise.all(
      attendances.map(async (att: any) => {
        const [student] = await db
          .select({ id: schema.users.id, name: schema.users.name, email: schema.users.email, gradeId: schema.users.gradeId })
          .from(schema.users)
          .where(eq(schema.users.id, att.studentId))
          .limit(1);
        return { ...att, student: student || null };
      })
    );

    // Sort by student name
    attendancesWithStudents.sort((a, b) => 
      (a.student?.name || '').localeCompare(b.student?.name || '')
    );

    const liveSessionWithRelations = {
      ...liveSession,
      track: {
        ...track,
        grade
      },
      instructor,
      attendances: attendancesWithStudents
    };

    // If instructor, verify they own this session
    if (
      session.user.role === "instructor" &&
      liveSessionWithRelations.instructorId !== session.user.id
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get all students in the track's grade who should attend this session
    const enrolledStudents = await db
      .select({ id: schema.users.id, name: schema.users.name, email: schema.users.email, gradeId: schema.users.gradeId })
      .from(schema.users)
      .where(
        and(
          eq(schema.users.role, "student"),
          eq(schema.users.gradeId, liveSessionWithRelations.track.gradeId!)
        )
      );

    // Sort by name
    enrolledStudents.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

    // Create attendance records for students who don't have them yet
    const existingAttendances = liveSessionWithRelations.attendances.map((a: any) => a.studentId);
    const missingStudents = enrolledStudents.filter(
      (s: any) => !existingAttendances.includes(s.id)
    );

    if (missingStudents.length > 0) {
      await db
        .insert(schema.sessionAttendances)
        .values(missingStudents.map((student: any) => ({
          sessionId: sessionId,
          studentId: student.id,
          status: "absent",
        })));
    }

    // Fetch updated attendance data
    const updatedAttendances = await db
      .select()
      .from(schema.sessionAttendances)
      .where(eq(schema.sessionAttendances.sessionId, sessionId));

    // Fetch students for updated attendances
    const updatedAttendancesWithStudents = await Promise.all(
      updatedAttendances.map(async (att: any) => {
        const [student] = await db
          .select({ id: schema.users.id, name: schema.users.name, email: schema.users.email, gradeId: schema.users.gradeId })
          .from(schema.users)
          .where(eq(schema.users.id, att.studentId))
          .limit(1);
        return { ...att, student: student || null };
      })
    );

    // Sort by student name
    updatedAttendancesWithStudents.sort((a, b) => 
      (a.student?.name || '').localeCompare(b.student?.name || '')
    );

    const updatedSession = {
      ...liveSessionWithRelations,
      attendances: updatedAttendancesWithStudents
    };

    // Calculate attendance statistics
    const totalStudents = updatedSession.attendances.length;
    const presentCount = updatedSession.attendances.filter(
      (a: any) => a.status === "present"
    ).length;
    const absentCount = updatedSession.attendances.filter(
      (a: any) => a.status === "absent"
    ).length;
    const lateCount = updatedSession.attendances.filter(
      (a: any) => a.status === "late"
    ).length;
    const excusedCount = updatedSession.attendances.filter(
      (a: any) => a.status === "excused"
    ).length;

    const attendanceStats = {
      totalStudents,
      presentCount,
      absentCount,
      lateCount,
      excusedCount,
      attendanceRate:
        totalStudents > 0
          ? Math.round((presentCount / totalStudents) * 100)
          : 0,
    };

    return NextResponse.json({
      session: updatedSession,
      attendanceStats,
    });
  } catch (error) {
    console.error("Error fetching session attendance:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/attendance/session/[sessionId] - Update attendance for a session
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only instructors and coordinators can update attendance
    if (
      !["instructor", "coordinator", "manager", "ceo"].includes(
        session.user.role
      )
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { attendanceUpdates } = body;

    if (!Array.isArray(attendanceUpdates)) {
      return NextResponse.json(
        { error: "Invalid attendance data" },
        { status: 400 }
      );
    }

    // Verify the session exists and instructor has access
    const [liveSession] = await db
      .select({ id: schema.liveSessions.id, instructorId: schema.liveSessions.instructorId })
      .from(schema.liveSessions)
      .where(eq(schema.liveSessions.id, sessionId))
      .limit(1);

    if (!liveSession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // If instructor, verify they own this session
    if (
      session.user.role === "instructor" &&
      liveSession.instructorId !== session.user.id
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Update attendance records - manual upsert
    const updatePromises = attendanceUpdates.map(
      async (update: { studentId: string; status: string; notes?: string }) => {
        const validStatuses = ["present", "absent", "late", "excused"];
        if (!validStatuses.includes(update.status)) {
          throw new Error(`Invalid status: ${update.status}`);
        }

        // Check if record exists
        const existing = await db
          .select()
          .from(schema.sessionAttendances)
          .where(
            and(
              eq(schema.sessionAttendances.sessionId, sessionId),
              eq(schema.sessionAttendances.studentId, update.studentId)
            )
          )
          .limit(1);

        if (existing.length > 0) {
          // Update
          return db
            .update(schema.sessionAttendances)
            .set({
              status: update.status,
              notes: update.notes || null,
              markedBy: session.user.id,
              markedAt: new Date(),
            })
            .where(eq(schema.sessionAttendances.id, existing[0].id));
        } else {
          // Create
          return db
            .insert(schema.sessionAttendances)
            .values({
              sessionId: sessionId,
              studentId: update.studentId,
              status: update.status,
              notes: update.notes || null,
              markedBy: session.user.id,
              markedAt: new Date(),
            });
        }
      }
    );

    await Promise.all(updatePromises);

    // Return updated attendance data
    const updatedAttendances = await db
      .select()
      .from(schema.sessionAttendances)
      .where(eq(schema.sessionAttendances.sessionId, sessionId));

    // Fetch students for each attendance
    const attendancesWithStudents = await Promise.all(
      updatedAttendances.map(async (att: any) => {
        const [student] = await db
          .select({ id: schema.users.id, name: schema.users.name, email: schema.users.email })
          .from(schema.users)
          .where(eq(schema.users.id, att.studentId))
          .limit(1);
        return { ...att, student: student || null };
      })
    );

    // Sort by student name
    attendancesWithStudents.sort((a, b) => 
      (a.student?.name || '').localeCompare(b.student?.name || '')
    );

    const updatedAttendance = {
      id: sessionId,
      attendances: attendancesWithStudents
    };

    return NextResponse.json({
      message: "Attendance updated successfully",
      session: updatedAttendance,
    });
  } catch (error) {
    console.error("Error updating attendance:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
