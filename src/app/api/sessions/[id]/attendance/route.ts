import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db, schema, eq, and } from "@/lib/db";

/**
 * POST /api/sessions/[id]/attendance
 * Update attendance records for a session
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only coordinators, instructors, and higher roles can manage attendance
    const allowedRoles = ["coordinator", "instructor", "manager", "ceo"];
    if (!allowedRoles.includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const sessionId = params.id;
    const body = await request.json();
    const { attendance } = body;

    if (!Array.isArray(attendance)) {
      return NextResponse.json(
        { error: "Invalid attendance data" },
        { status: 400 }
      );
    }

    // Verify session exists
    const [liveSession] = await db
      .select()
      .from(schema.liveSessions)
      .where(eq(schema.liveSessions.id, sessionId))
      .limit(1);

    if (!liveSession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // Fetch track with coordinator and instructor
    const [track] = await db
      .select()
      .from(schema.tracks)
      .where(eq(schema.tracks.id, liveSession.trackId))
      .limit(1);

    const [coordinator, instructor] = await Promise.all([
      track!.coordinatorId ? db.select()
        .from(schema.users)
        .where(eq(schema.users.id, track!.coordinatorId))
        .limit(1)
        .then(r => r[0] || null) : Promise.resolve(null),
      track!.instructorId ? db.select()
        .from(schema.users)
        .where(eq(schema.users.id, track!.instructorId))
        .limit(1)
        .then(r => r[0] || null) : Promise.resolve(null)
    ]);

    const liveSessionWithRelations = {
      ...liveSession,
      track: {
        ...track,
        coordinator,
        instructor
      }
    };

    // Check if user has permission for this specific session
    const userRole = session.user.role;
    const userId = session.user.id;

    if (userRole === "coordinator" || userRole === "instructor") {
      // Coordinator must be assigned to the track, or instructor must be teaching it
      const isCoordinator = liveSessionWithRelations.track.coordinatorId === userId;
      const isInstructor = liveSessionWithRelations.track.instructorId === userId;

      if (!isCoordinator && !isInstructor) {
        return NextResponse.json(
          { error: "You don't have permission to manage this session" },
          { status: 403 }
        );
      }
    }

    // Update attendance records using SessionAttendance model
    const updatePromises = attendance.map(
      async (record: { studentId: string; status: string; notes?: string }) => {
        // Find existing attendance record
        const existingRecord = await db
          .select()
          .from(schema.sessionAttendances)
          .where(
            and(
              eq(schema.sessionAttendances.sessionId, sessionId),
              eq(schema.sessionAttendances.studentId, record.studentId)
            )
          )
          .limit(1);

        if (existingRecord.length > 0) {
          // Update existing record
          return db
            .update(schema.sessionAttendances)
            .set({
              status: record.status,
              notes: record.notes || null,
              markedBy: session.user.id,
              markedAt: new Date(),
            })
            .where(eq(schema.sessionAttendances.id, existingRecord[0].id));
        } else {
          // Create new record
          return db
            .insert(schema.sessionAttendances)
            .values({
              sessionId: sessionId,
              studentId: record.studentId,
              status: record.status,
              notes: record.notes || null,
              markedBy: session.user.id,
              markedAt: new Date(),
            });
        }
      }
    );

    await Promise.all(updatePromises);

    // Fetch updated attendance records
    const updatedAttendance = await db
      .select()
      .from(schema.sessionAttendances)
      .where(eq(schema.sessionAttendances.sessionId, sessionId));

    // Fetch student for each attendance record
    const attendanceWithStudents = await Promise.all(
      updatedAttendance.map(async (att: any) => {
        const [student] = await db
          .select({ id: schema.users.id, name: schema.users.name, email: schema.users.email })
          .from(schema.users)
          .where(eq(schema.users.id, att.studentId))
          .limit(1);
        return { ...att, student: student || null };
      })
    );

    // Sort by student name
    attendanceWithStudents.sort((a, b) => 
      (a.student?.name || '').localeCompare(b.student?.name || '')
    );

    return NextResponse.json({
      success: true,
      message: "Attendance updated successfully",
      attendance: attendanceWithStudents,
    });
  } catch (error) {
    console.error("Error updating attendance:", error);
    return NextResponse.json(
      { error: "Failed to update attendance" },
      { status: 500 }
    );
  }
}
