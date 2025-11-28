import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db, schema, eq, and } from "@/lib/db";
import {
  validateExternalMeetingLink,
  canStartSession,
} from "@/lib/sessionValidation";

// PUT /api/sessions/control/[sessionId] - Control session status (start/stop/pause)
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

    // Only instructors and coordinators can control sessions
    if (
      !["instructor", "coordinator", "manager", "ceo"].includes(
        session.user.role
      )
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { action, notes } = body; // action: "start", "pause", "resume", "complete", "cancel"

    // Verify the session exists and instructor has access
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

    const liveSessionWithRelations = {
      ...liveSession,
      track: {
        ...track,
        grade
      },
      instructor
    };

    // If instructor, verify they own this session
    if (
      session.user.role === "instructor" &&
      liveSessionWithRelations.instructorId !== session.user.id
    ) {
      return NextResponse.json(
        { error: "You can only control your own sessions" },
        { status: 403 }
      );
    }

    // Validate action based on current status and external link requirements
    const currentStatus = liveSessionWithRelations.status;

    // Check external link requirement for starting sessions
    if (action === "start") {
      if (!canStartSession(liveSessionWithRelations.externalLink)) {
        const validation = validateExternalMeetingLink(
          liveSessionWithRelations.externalLink
        );
        return NextResponse.json(
          {
            error: "Cannot start session without valid external meeting link",
            details: validation.error,
            suggestedAction:
              "Add a valid external meeting link (Zoom, Google Meet, Teams) before starting the session",
          },
          { status: 400 }
        );
      }
    }

    const validTransitions: Record<string, string[]> = {
      DRAFT: ["cancel"],
      SCHEDULED: ["start", "cancel"],
      READY: ["start", "cancel"],
      ACTIVE: ["pause", "complete"],
      PAUSED: ["resume", "complete"],
      COMPLETED: [],
      CANCELLED: [],
      // Legacy status support (for migration period)
      scheduled: ["start", "cancel"],
      in_progress: ["pause", "complete"],
      paused: ["resume", "complete"],
      completed: [],
      cancelled: [],
    };

    if (!validTransitions[currentStatus]?.includes(action)) {
      return NextResponse.json(
        {
          error: `Cannot ${action} session with status ${currentStatus}`,
        },
        { status: 400 }
      );
    }

    // Determine new status based on action
    const statusMap: Record<string, string> = {
      start: "ACTIVE",
      pause: "PAUSED",
      resume: "ACTIVE",
      complete: "COMPLETED",
      cancel: "CANCELLED",
    };

    const newStatus = statusMap[action];

    // Update session status
    await db
      .update(schema.liveSessions)
      .set({
        status: newStatus as
          | "DRAFT"
          | "SCHEDULED"
          | "READY"
          | "ACTIVE"
          | "PAUSED"
          | "COMPLETED"
          | "CANCELLED",
        notes: notes
          ? `${liveSessionWithRelations.notes || ""}\n[${new Date().toISOString()}] ${
              session.user.name
            }: ${notes}`.trim()
          : liveSessionWithRelations.notes,
      })
      .where(eq(schema.liveSessions.id, sessionId));

    // Fetch updated session with nested relations
    const [updatedLiveSession] = await db
      .select()
      .from(schema.liveSessions)
      .where(eq(schema.liveSessions.id, sessionId))
      .limit(1);

    const [updatedTrack] = await db
      .select()
      .from(schema.tracks)
      .where(eq(schema.tracks.id, updatedLiveSession!.trackId))
      .limit(1);

    const [updatedGrade, updatedInstructor] = await Promise.all([
      updatedTrack!.gradeId ? db.select({ id: schema.grades.id, name: schema.grades.name })
        .from(schema.grades)
        .where(eq(schema.grades.id, updatedTrack!.gradeId))
        .limit(1)
        .then(r => r[0] || null) : Promise.resolve(null),
      updatedLiveSession!.instructorId ? db.select({ id: schema.users.id, name: schema.users.name })
        .from(schema.users)
        .where(eq(schema.users.id, updatedLiveSession!.instructorId))
        .limit(1)
        .then(r => r[0] || null) : Promise.resolve(null)
    ]);

    // Fetch attendances
    const attendances = await db
      .select()
      .from(schema.sessionAttendances)
      .where(eq(schema.sessionAttendances.sessionId, sessionId));

    // Fetch students for each attendance
    const attendancesWithStudents = await Promise.all(
      attendances.map(async (att: any) => {
        const [student] = await db
          .select({ id: schema.users.id, name: schema.users.name })
          .from(schema.users)
          .where(eq(schema.users.id, att.studentId))
          .limit(1);
        return { ...att, student: student || null };
      })
    );

    const updatedSession = {
      ...updatedLiveSession,
      track: {
        ...updatedTrack,
        grade: updatedGrade
      },
      instructor: updatedInstructor,
      attendances: attendancesWithStudents
    };

    // If starting session, create attendance records for enrolled students
    if (action === "start") {
      const enrolledStudents = await db
        .select({ id: schema.users.id })
        .from(schema.users)
        .where(
          and(
            eq(schema.users.role, "student"),
            eq(schema.users.gradeId, liveSessionWithRelations.track.gradeId!)
          )
        );

      // Create attendance records for students who don't have them
      const existingAttendances = await db
        .select({ studentId: schema.sessionAttendances.studentId })
        .from(schema.sessionAttendances)
        .where(eq(schema.sessionAttendances.sessionId, sessionId));

      const existingStudentIds = existingAttendances.map((a: any) => a.studentId);
      const newStudents = enrolledStudents.filter(
        (s: any) => !existingStudentIds.includes(s.id)
      );

      if (newStudents.length > 0) {
        await db
          .insert(schema.sessionAttendances)
          .values(newStudents.map((student: any) => ({
            sessionId,
            studentId: student.id,
            status: "absent", // Default to absent, instructor will mark present students
            markedBy: session.user.id,
          })));
      }
    }

    // Return success response with updated session data
    return NextResponse.json({
      message: `Session ${action}ed successfully`,
      session: updatedSession,
      previousStatus: currentStatus,
      newStatus: newStatus,
    });
  } catch (error) {
    console.error("Error controlling session:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET /api/sessions/control/[sessionId] - Get session control information
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

    // Get session with control information
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

    // Fetch attendances with students
    const attendances = await db
      .select()
      .from(schema.sessionAttendances)
      .where(eq(schema.sessionAttendances.sessionId, sessionId));

    const attendancesWithStudents = await Promise.all(
      attendances.map(async (att: any) => {
        const [student] = await db
          .select({ id: schema.users.id, name: schema.users.name })
          .from(schema.users)
          .where(eq(schema.users.id, att.studentId))
          .limit(1);
        return { ...att, student: student || null };
      })
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

    // Check if user can control this session
    const canControl =
      (session.user.role === "instructor" &&
        liveSessionWithRelations.instructorId === session.user.id) ||
      ["coordinator", "manager", "ceo"].includes(session.user.role);

    // Get available actions based on current status
    const currentStatus = liveSessionWithRelations.status;
    const availableActions: Record<
      string,
      Array<{ action: string; label: string; color: string }>
    > = {
      scheduled: [
        { action: "start", label: "بدء الجلسة", color: "green" },
        { action: "cancel", label: "إلغاء الجلسة", color: "red" },
      ],
      in_progress: [
        { action: "pause", label: "إيقاف مؤقت", color: "yellow" },
        { action: "complete", label: "إنهاء الجلسة", color: "blue" },
      ],
      paused: [
        { action: "resume", label: "استئناف الجلسة", color: "green" },
        { action: "complete", label: "إنهاء الجلسة", color: "blue" },
      ],
      completed: [],
      cancelled: [],
    };

    // Calculate session duration if in progress or completed
    let duration = null;
    if (liveSessionWithRelations.status === "ACTIVE" || liveSessionWithRelations.status === "COMPLETED") {
      const sessionDate = new Date(liveSessionWithRelations.date);
      const startTime = liveSessionWithRelations.startTime.split(":");
      const sessionStart = new Date(sessionDate);
      sessionStart.setHours(parseInt(startTime[0]), parseInt(startTime[1]));

      const now = new Date();
      const durationMs = now.getTime() - sessionStart.getTime();
      duration = Math.max(0, Math.floor(durationMs / (1000 * 60))); // Duration in minutes
    }

    return NextResponse.json({
      session: liveSessionWithRelations,
      canControl,
      availableActions: availableActions[currentStatus] || [],
      currentStatus,
      duration,
      attendanceStats: {
        total: liveSessionWithRelations.attendances.length,
        present: liveSessionWithRelations.attendances.filter((a: any) => a.status === "present")
          .length,
        absent: liveSessionWithRelations.attendances.filter((a: any) => a.status === "absent")
          .length,
        late: liveSessionWithRelations.attendances.filter((a: any) => a.status === "late").length,
      },
    });
  } catch (error) {
    console.error("Error fetching session control info:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
