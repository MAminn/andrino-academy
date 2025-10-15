import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

// POST /api/sessions/manage - Create or update sessions
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only coordinators, managers, and CEOs can manage sessions
    if (!["coordinator", "manager", "ceo"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { action, sessionData } = body;

    if (action === "create") {
      const {
        title,
        description,
        date,
        startTime,
        endTime,
        trackId,
        instructorId,
      } = sessionData;

      // Validate required fields
      if (
        !title ||
        !date ||
        !startTime ||
        !endTime ||
        !trackId ||
        !instructorId
      ) {
        return NextResponse.json(
          { error: "Missing required fields" },
          { status: 400 }
        );
      }

      // Verify track exists
      const track = await prisma.track.findUnique({
        where: { id: trackId },
        include: { grade: true },
      });

      if (!track) {
        return NextResponse.json({ error: "Track not found" }, { status: 404 });
      }

      // Verify instructor exists
      const instructor = await prisma.user.findUnique({
        where: { id: instructorId, role: "instructor" },
      });

      if (!instructor) {
        return NextResponse.json(
          { error: "Instructor not found" },
          { status: 404 }
        );
      }

      // Check for scheduling conflicts
      const sessionDate = new Date(date);
      const conflicts = await prisma.liveSession.findMany({
        where: {
          instructorId,
          date: sessionDate,
          OR: [
            {
              AND: [
                { startTime: { lte: startTime } },
                { endTime: { gt: startTime } },
              ],
            },
            {
              AND: [
                { startTime: { lt: endTime } },
                { endTime: { gte: endTime } },
              ],
            },
            {
              AND: [
                { startTime: { gte: startTime } },
                { endTime: { lte: endTime } },
              ],
            },
          ],
        },
      });

      if (conflicts.length > 0) {
        return NextResponse.json(
          { error: "Instructor has a scheduling conflict at this time" },
          { status: 409 }
        );
      }

      // Create the session
      const newSession = await prisma.liveSession.create({
        data: {
          title,
          description: description || "",
          date: sessionDate,
          startTime,
          endTime,
          trackId,
          instructorId,
          status: "scheduled",
        },
        include: {
          track: {
            include: { grade: true },
          },
          instructor: {
            select: { id: true, name: true, email: true },
          },
        },
      });

      return NextResponse.json(
        {
          session: newSession,
          message: "Session created successfully",
        },
        { status: 201 }
      );
    } else if (action === "update") {
      const { sessionId, ...updateData } = sessionData;

      if (!sessionId) {
        return NextResponse.json(
          { error: "Session ID is required for updates" },
          { status: 400 }
        );
      }

      // Verify session exists
      const existingSession = await prisma.liveSession.findUnique({
        where: { id: sessionId },
      });

      if (!existingSession) {
        return NextResponse.json(
          { error: "Session not found" },
          { status: 404 }
        );
      }

      // Update the session
      const updatedSession = await prisma.liveSession.update({
        where: { id: sessionId },
        data: updateData,
        include: {
          track: {
            include: { grade: true },
          },
          instructor: {
            select: { id: true, name: true, email: true },
          },
        },
      });

      return NextResponse.json({
        session: updatedSession,
        message: "Session updated successfully",
      });
    } else {
      return NextResponse.json(
        { error: "Invalid action. Use 'create' or 'update'" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error managing session:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/sessions/manage - Delete a session
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only coordinators, managers, and CEOs can delete sessions
    if (!["coordinator", "manager", "ceo"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    // Verify session exists
    const existingSession = await prisma.liveSession.findUnique({
      where: { id: sessionId },
    });

    if (!existingSession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // Check if session has already started
    const now = new Date();
    const sessionDateTime = new Date(
      `${existingSession.date}T${existingSession.startTime}`
    );

    if (sessionDateTime <= now && existingSession.status === "active") {
      return NextResponse.json(
        { error: "Cannot delete an active session" },
        { status: 400 }
      );
    }

    // Delete related attendance records first
    await prisma.sessionAttendance.deleteMany({
      where: { sessionId },
    });

    // Delete the session
    await prisma.liveSession.delete({
      where: { id: sessionId },
    });

    return NextResponse.json({
      message: "Session deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting session:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
