import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

// GET /api/attendance/session/[sessionId] - Get attendance for a specific session
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

    // Only instructors and coordinators can view attendance
    if (
      !["instructor", "coordinator", "manager", "ceo"].includes(
        session.user.role
      )
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get the session with attendance data
    const liveSession = await prisma.liveSession.findUnique({
      where: { id: sessionId },
      include: {
        track: {
          include: {
            grade: {
              select: { id: true, name: true },
            },
          },
        },
        instructor: {
          select: { id: true, name: true },
        },
        attendances: {
          include: {
            student: {
              select: {
                id: true,
                name: true,
                email: true,
                gradeId: true,
              },
            },
          },
          orderBy: {
            student: {
              name: "asc",
            },
          },
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
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get all students in the track's grade who should attend this session
    const enrolledStudents = await prisma.user.findMany({
      where: {
        role: "student",
        gradeId: liveSession.track.gradeId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        gradeId: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    // Create attendance records for students who don't have them yet
    const existingAttendances = liveSession.attendances.map((a) => a.studentId);
    const missingStudents = enrolledStudents.filter(
      (s) => !existingAttendances.includes(s.id)
    );

    if (missingStudents.length > 0) {
      await prisma.sessionAttendance.createMany({
        data: missingStudents.map((student) => ({
          sessionId: sessionId,
          studentId: student.id,
          status: "absent",
        })),
      });
    }

    // Fetch updated attendance data
    const updatedSession = await prisma.liveSession.findUnique({
      where: { id: sessionId },
      include: {
        track: {
          include: {
            grade: {
              select: { id: true, name: true },
            },
          },
        },
        instructor: {
          select: { id: true, name: true },
        },
        attendances: {
          include: {
            student: {
              select: {
                id: true,
                name: true,
                email: true,
                gradeId: true,
              },
            },
          },
          orderBy: {
            student: {
              name: "asc",
            },
          },
        },
      },
    });

    // Calculate attendance statistics
    const totalStudents = updatedSession!.attendances.length;
    const presentCount = updatedSession!.attendances.filter(
      (a) => a.status === "present"
    ).length;
    const absentCount = updatedSession!.attendances.filter(
      (a) => a.status === "absent"
    ).length;
    const lateCount = updatedSession!.attendances.filter(
      (a) => a.status === "late"
    ).length;
    const excusedCount = updatedSession!.attendances.filter(
      (a) => a.status === "excused"
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
    const session = await getServerSession(authOptions);

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
    const liveSession = await prisma.liveSession.findUnique({
      where: { id: sessionId },
      select: { id: true, instructorId: true },
    });

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

    // Update attendance records
    const updatePromises = attendanceUpdates.map(
      async (update: { studentId: string; status: string; notes?: string }) => {
        const validStatuses = ["present", "absent", "late", "excused"];
        if (!validStatuses.includes(update.status)) {
          throw new Error(`Invalid status: ${update.status}`);
        }

        return prisma.sessionAttendance.upsert({
          where: {
            sessionId_studentId: {
              sessionId: sessionId,
              studentId: update.studentId,
            },
          },
          update: {
            status: update.status,
            notes: update.notes || null,
            markedBy: session.user.id,
            markedAt: new Date(),
          },
          create: {
            sessionId: sessionId,
            studentId: update.studentId,
            status: update.status,
            notes: update.notes || null,
            markedBy: session.user.id,
            markedAt: new Date(),
          },
        });
      }
    );

    await Promise.all(updatePromises);

    // Return updated attendance data
    const updatedAttendance = await prisma.liveSession.findUnique({
      where: { id: sessionId },
      include: {
        attendances: {
          include: {
            student: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            student: {
              name: "asc",
            },
          },
        },
      },
    });

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
