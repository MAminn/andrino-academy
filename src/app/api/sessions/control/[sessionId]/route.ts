import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";
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
    const session = await getServerSession(authOptions);

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
    const liveSession = await prisma.liveSession.findUnique({
      where: { id: sessionId },
      include: {
        track: {
          include: {
            grade: { select: { id: true, name: true } },
          },
        },
        instructor: {
          select: { id: true, name: true },
        },
      },
    });

    if (!liveSession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // If instructor, verify they own this session
    if (
      session.user.role === "instructor" &&
      liveSession.instructorId !== session.user.id
    ) {
      return NextResponse.json(
        { error: "You can only control your own sessions" },
        { status: 403 }
      );
    }

    // Validate action based on current status and external link requirements
    const currentStatus = liveSession.status;

    // Check external link requirement for starting sessions
    if (action === "start") {
      if (!canStartSession(liveSession.externalLink)) {
        const validation = validateExternalMeetingLink(
          liveSession.externalLink
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
    const updatedSession = await prisma.liveSession.update({
      where: { id: sessionId },
      data: {
        status: newStatus as
          | "DRAFT"
          | "SCHEDULED"
          | "READY"
          | "ACTIVE"
          | "PAUSED"
          | "COMPLETED"
          | "CANCELLED",
        notes: notes
          ? `${liveSession.notes || ""}\n[${new Date().toISOString()}] ${
              session.user.name
            }: ${notes}`.trim()
          : liveSession.notes,
      },
      include: {
        track: {
          include: {
            grade: { select: { id: true, name: true } },
          },
        },
        instructor: {
          select: { id: true, name: true },
        },
        attendances: {
          include: {
            student: {
              select: { id: true, name: true },
            },
          },
        },
      },
    });

    // If starting session, create attendance records for enrolled students
    if (action === "start") {
      const enrolledStudents = await prisma.user.findMany({
        where: {
          role: "student",
          gradeId: liveSession.track.gradeId,
        },
        select: { id: true },
      });

      // Create attendance records for students who don't have them
      const existingAttendances = await prisma.sessionAttendance.findMany({
        where: { sessionId },
        select: { studentId: true },
      });

      const existingStudentIds = existingAttendances.map((a) => a.studentId);
      const newStudents = enrolledStudents.filter(
        (s) => !existingStudentIds.includes(s.id)
      );

      if (newStudents.length > 0) {
        await prisma.sessionAttendance.createMany({
          data: newStudents.map((student) => ({
            sessionId,
            studentId: student.id,
            status: "absent", // Default to absent, instructor will mark present students
            markedBy: session.user.id,
          })),
        });
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
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get session with control information
    const liveSession = await prisma.liveSession.findUnique({
      where: { id: sessionId },
      include: {
        track: {
          include: {
            grade: { select: { id: true, name: true } },
          },
        },
        instructor: {
          select: { id: true, name: true },
        },
        attendances: {
          include: {
            student: {
              select: { id: true, name: true },
            },
          },
        },
      },
    });

    if (!liveSession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // Check if user can control this session
    const canControl =
      (session.user.role === "instructor" &&
        liveSession.instructorId === session.user.id) ||
      ["coordinator", "manager", "ceo"].includes(session.user.role);

    // Get available actions based on current status
    const currentStatus = liveSession.status;
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
    if (liveSession.status === "ACTIVE" || liveSession.status === "COMPLETED") {
      const sessionDate = new Date(liveSession.date);
      const startTime = liveSession.startTime.split(":");
      const sessionStart = new Date(sessionDate);
      sessionStart.setHours(parseInt(startTime[0]), parseInt(startTime[1]));

      const now = new Date();
      const durationMs = now.getTime() - sessionStart.getTime();
      duration = Math.max(0, Math.floor(durationMs / (1000 * 60))); // Duration in minutes
    }

    return NextResponse.json({
      session: liveSession,
      canControl,
      availableActions: availableActions[currentStatus] || [],
      currentStatus,
      duration,
      attendanceStats: {
        total: liveSession.attendances.length,
        present: liveSession.attendances.filter((a) => a.status === "present")
          .length,
        absent: liveSession.attendances.filter((a) => a.status === "absent")
          .length,
        late: liveSession.attendances.filter((a) => a.status === "late").length,
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
