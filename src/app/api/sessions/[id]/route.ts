import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

// GET /api/sessions/[id] - Get a specific session
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const liveSession = await prisma.liveSession.findUnique({
      where: { id: params.id },
      include: {
        track: {
          include: {
            grade: {
              select: { id: true, name: true },
            },
            coordinator: {
              select: { id: true, name: true, email: true },
            },
          },
        },
        instructor: {
          select: { id: true, name: true, email: true },
        },
        attendances: {
          include: {
            student: {
              select: { id: true, name: true, email: true },
            },
          },
          orderBy: { student: { name: "asc" } },
        },
        _count: {
          select: { attendances: true },
        },
      },
    });

    if (!liveSession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // Permission check
    const allowedRoles = ["manager", "ceo"];
    const isInstructor =
      session.user.role === "instructor" &&
      liveSession.instructorId === session.user.id;
    const isCoordinator =
      session.user.role === "coordinator" &&
      liveSession.track.coordinator.id === session.user.id;

    // For students, check if they're in the right grade
    let isStudentInGrade = false;
    if (session.user.role === "student") {
      const student = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { gradeId: true },
      });
      isStudentInGrade = student?.gradeId === liveSession.track.grade.id;
    }

    if (
      !allowedRoles.includes(session.user.role) &&
      !isInstructor &&
      !isCoordinator &&
      !isStudentInGrade
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ session: liveSession });
  } catch (error) {
    console.error("Error fetching session:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/sessions/[id] - Update a specific session
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      description,
      date,
      startTime,
      endTime,
      meetLink,
      materials,
      notes,
      status,
    } = body;

    // Check if session exists
    const existingSession = await prisma.liveSession.findUnique({
      where: { id: params.id },
      include: {
        track: {
          include: {
            coordinator: true,
          },
        },
      },
    });

    if (!existingSession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // Permission check
    const allowedRoles = ["manager", "ceo"];
    const isInstructor =
      session.user.role === "instructor" &&
      existingSession.instructorId === session.user.id;
    const isCoordinator =
      session.user.role === "coordinator" &&
      existingSession.track.coordinator.id === session.user.id;

    if (
      !allowedRoles.includes(session.user.role) &&
      !isInstructor &&
      !isCoordinator
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Validation
    if (title && typeof title !== "string") {
      return NextResponse.json(
        { error: "Invalid session title" },
        { status: 400 }
      );
    }

    // Validate date if provided
    if (date) {
      const sessionDate = new Date(date);
      if (isNaN(sessionDate.getTime())) {
        return NextResponse.json(
          { error: "Invalid date format" },
          { status: 400 }
        );
      }
    }

    // Validate time format if provided
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (startTime && !timeRegex.test(startTime)) {
      return NextResponse.json(
        { error: "Invalid start time format. Use HH:mm format" },
        { status: 400 }
      );
    }

    if (endTime && !timeRegex.test(endTime)) {
      return NextResponse.json(
        { error: "Invalid end time format. Use HH:mm format" },
        { status: 400 }
      );
    }

    // Check for time conflicts if date/time is being updated
    if (date || startTime || endTime) {
      const checkDate = date ? new Date(date) : existingSession.date;
      const checkStartTime = startTime || existingSession.startTime;
      const checkEndTime = endTime || existingSession.endTime;

      const conflictingSessions = await prisma.liveSession.findMany({
        where: {
          id: { not: params.id }, // Exclude current session
          trackId: existingSession.trackId,
          date: checkDate,
          OR: [
            {
              AND: [
                { startTime: { lte: checkStartTime } },
                { endTime: { gt: checkStartTime } },
              ],
            },
            {
              AND: [
                { startTime: { lt: checkEndTime } },
                { endTime: { gte: checkEndTime } },
              ],
            },
            {
              AND: [
                { startTime: { gte: checkStartTime } },
                { endTime: { lte: checkEndTime } },
              ],
            },
          ],
        },
      });

      if (conflictingSessions.length > 0) {
        return NextResponse.json(
          { error: "Time conflict with existing session" },
          { status: 400 }
        );
      }
    }

    // Update data object
    const updateData: {
      title?: string;
      description?: string | null;
      date?: Date;
      startTime?: string;
      endTime?: string;
      meetLink?: string | null;
      materials?: string | null;
      notes?: string | null;
      status?: string;
    } = {};

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (date !== undefined) updateData.date = new Date(date);
    if (startTime !== undefined) updateData.startTime = startTime;
    if (endTime !== undefined) updateData.endTime = endTime;
    if (meetLink !== undefined) updateData.meetLink = meetLink;
    if (materials !== undefined) updateData.materials = materials;
    if (notes !== undefined) updateData.notes = notes;
    if (status !== undefined) updateData.status = status;

    const updatedSession = await prisma.liveSession.update({
      where: { id: params.id },
      data: updateData,
      include: {
        track: {
          include: {
            grade: {
              select: { id: true, name: true },
            },
          },
        },
        instructor: {
          select: { id: true, name: true, email: true },
        },
        _count: {
          select: { attendances: true },
        },
      },
    });

    return NextResponse.json({ session: updatedSession });
  } catch (error) {
    console.error("Error updating session:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/sessions/[id] - Delete a specific session
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if session exists
    const existingSession = await prisma.liveSession.findUnique({
      where: { id: params.id },
      include: {
        track: {
          include: {
            coordinator: true,
          },
        },
        _count: {
          select: { attendances: true },
        },
      },
    });

    if (!existingSession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // Permission check
    const allowedRoles = ["manager", "ceo"];
    const isInstructor =
      session.user.role === "instructor" &&
      existingSession.instructorId === session.user.id;
    const isCoordinator =
      session.user.role === "coordinator" &&
      existingSession.track.coordinator.id === session.user.id;

    if (
      !allowedRoles.includes(session.user.role) &&
      !isInstructor &&
      !isCoordinator
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Check if session has attendances
    if (existingSession._count.attendances > 0) {
      return NextResponse.json(
        { error: "Cannot delete session with recorded attendance" },
        { status: 400 }
      );
    }

    await prisma.liveSession.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Session deleted successfully" });
  } catch (error) {
    console.error("Error deleting session:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
