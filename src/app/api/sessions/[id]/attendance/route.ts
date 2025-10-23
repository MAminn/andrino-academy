import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/sessions/[id]/attendance
 * Update attendance records for a session
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

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
    const liveSession = await prisma.liveSession.findUnique({
      where: { id: sessionId },
      include: {
        track: {
          include: {
            coordinator: true,
            instructor: true,
          },
        },
      },
    });

    if (!liveSession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // Check if user has permission for this specific session
    const userRole = session.user.role;
    const userId = session.user.id;

    if (userRole === "coordinator" || userRole === "instructor") {
      // Coordinator must be assigned to the track, or instructor must be teaching it
      const isCoordinator = liveSession.track.coordinatorId === userId;
      const isInstructor = liveSession.track.instructorId === userId;

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
        const existingRecord = await prisma.sessionAttendance.findFirst({
          where: {
            sessionId: sessionId,
            studentId: record.studentId,
          },
        });

        if (existingRecord) {
          // Update existing record
          return prisma.sessionAttendance.update({
            where: { id: existingRecord.id },
            data: {
              status: record.status,
              notes: record.notes,
              markedBy: session.user.id,
              markedAt: new Date(),
            },
          });
        } else {
          // Create new record
          return prisma.sessionAttendance.create({
            data: {
              sessionId: sessionId,
              studentId: record.studentId,
              status: record.status,
              notes: record.notes,
              markedBy: session.user.id,
              markedAt: new Date(),
            },
          });
        }
      }
    );

    await Promise.all(updatePromises);

    // Fetch updated attendance records
    const updatedAttendance = await prisma.sessionAttendance.findMany({
      where: { sessionId: sessionId },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { student: { name: "asc" } },
    });

    return NextResponse.json({
      success: true,
      message: "Attendance updated successfully",
      attendance: updatedAttendance,
    });
  } catch (error) {
    console.error("Error updating attendance:", error);
    return NextResponse.json(
      { error: "Failed to update attendance" },
      { status: 500 }
    );
  }
}
