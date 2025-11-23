import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";
import { SessionStatus } from "@/types/api";

// GET /api/sessions - Get sessions (with optional filters)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // All authenticated users can view sessions (with appropriate filtering)
    const { searchParams } = new URL(request.url);
    const trackId = searchParams.get("trackId");
    const instructorId = searchParams.get("instructorId");
    const status = searchParams.get("status");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const upcoming = searchParams.get("upcoming");
    const today = searchParams.get("today");

    // Build where clause
    const whereClause: {
      trackId?: string | { in: string[] };
      instructorId?: string;
      status?: SessionStatus;
      date?: { gte?: Date; lte?: Date };
    } = {};

    if (trackId) {
      whereClause.trackId = trackId;
    }

    if (instructorId) {
      whereClause.instructorId = instructorId;
    }

    if (status) {
      whereClause.status = status as SessionStatus;
    }

    // Date range filter
    if (startDate || endDate) {
      whereClause.date = {};
      if (startDate) {
        whereClause.date.gte = new Date(startDate);
      }
      if (endDate) {
        whereClause.date.lte = new Date(endDate);
      }
    }

    // Handle special date filters
    if (upcoming === "true") {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      whereClause.date = {
        gte: tomorrow,
      };
    }

    if (today === "true") {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);

      whereClause.date = {
        gte: todayStart,
        lte: todayEnd,
      };
    }

    // Role-based filtering
    if (session.user.role === "instructor") {
      whereClause.instructorId = session.user.id;
    }

    if (session.user.role === "coordinator") {
      // Coordinators can only see sessions from tracks they coordinate
      const coordinatedTracks = await prisma.track.findMany({
        where: { coordinatorId: session.user.id },
        select: { id: true },
      });

      if (coordinatedTracks.length === 0) {
        return NextResponse.json({ sessions: [] });
      }

      if (!trackId) {
        // If no specific track filter, show all their coordinated tracks
        whereClause.trackId = {
          in: coordinatedTracks.map((t) => t.id),
        };
      } else {
        // Check if the requested track is one they coordinate
        const isAuthorized = coordinatedTracks.some((t) => t.id === trackId);
        if (!isAuthorized) {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
      }
    }

    if (session.user.role === "student") {
      // Students can only see sessions from their assigned grade's tracks
      const student = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: {
          assignedGrade: {
            include: {
              tracks: {
                select: { id: true },
              },
            },
          },
        },
      });

      if (!student?.assignedGrade) {
        return NextResponse.json({ sessions: [] });
      }

      const trackIds = student.assignedGrade.tracks.map((t) => t.id);
      if (trackIds.length === 0) {
        return NextResponse.json({ sessions: [] });
      }

      if (!trackId) {
        whereClause.trackId = {
          in: trackIds,
        };
      } else {
        // Check if the requested track is in their grade
        const isAuthorized = trackIds.includes(trackId);
        if (!isAuthorized) {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
      }
    }

    const sessions = await prisma.liveSession.findMany({
      where: whereClause,
      include: {
        track: {
          include: {
            grade: {
              select: { id: true, name: true },
            },
            instructor: {
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
        },
        _count: {
          select: { attendances: true },
        },
      },
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
    });

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error("Error fetching sessions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/sessions - Create a new session
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Instructors can create sessions for their tracks, managers/coordinators/CEO can create any
    const body = await request.json();
    const {
      title,
      description,
      trackId,
      instructorId,
      date,
      startTime,
      endTime,
      meetLink,
      materials,
      notes,
      bookingIds,
    } = body;

    // Validation
    if (!title || typeof title !== "string") {
      return NextResponse.json(
        { error: "Session title is required" },
        { status: 400 }
      );
    }

    if (!trackId) {
      return NextResponse.json(
        { error: "Track ID is required" },
        { status: 400 }
      );
    }

    if (!date) {
      return NextResponse.json(
        { error: "Session date is required" },
        { status: 400 }
      );
    }

    if (!startTime || !endTime) {
      return NextResponse.json(
        { error: "Start time and end time are required" },
        { status: 400 }
      );
    }

    // Verify track exists
    const track = await prisma.track.findUnique({
      where: { id: trackId },
      include: {
        instructor: true,
        coordinator: true,
      },
    });

    if (!track) {
      return NextResponse.json({ error: "Track not found" }, { status: 400 });
    }

    // Permission check
    const allowedRoles = ["manager", "ceo"];
    const isTrackInstructor =
      session.user.role === "instructor" &&
      track.instructorId === session.user.id;
    const isTrackCoordinator =
      session.user.role === "coordinator" &&
      track.coordinatorId === session.user.id;

    if (
      !allowedRoles.includes(session.user.role) &&
      !isTrackInstructor &&
      !isTrackCoordinator
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Use track's instructor if no instructorId provided
    const sessionInstructorId = instructorId || track.instructorId;

    // Verify instructor if provided
    if (instructorId && instructorId !== track.instructorId) {
      const instructor = await prisma.user.findUnique({
        where: { id: instructorId },
      });

      if (!instructor || instructor.role !== "instructor") {
        return NextResponse.json(
          { error: "Invalid instructor" },
          { status: 400 }
        );
      }
    }

    // Validate date format
    const sessionDate = new Date(date);
    if (isNaN(sessionDate.getTime())) {
      return NextResponse.json(
        { error: "Invalid date format" },
        { status: 400 }
      );
    }

    // Validate time format (HH:mm)
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
      return NextResponse.json(
        { error: "Invalid time format. Use HH:mm format" },
        { status: 400 }
      );
    }

    // Check for time conflicts
    const conflictingSessions = await prisma.liveSession.findMany({
      where: {
        trackId,
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

    if (conflictingSessions.length > 0) {
      // Map to minimal conflict info to help frontend show details
      const conflicts = conflictingSessions.map((s) => ({
        id: s.id,
        title: s.title,
        date: s.date.toISOString().split("T")[0],
        startTime: s.startTime,
        endTime: s.endTime,
      }));

      return NextResponse.json(
        { error: "Time conflict with existing session", conflicts },
        { status: 400 }
      );
    }

    const newSession = await prisma.liveSession.create({
      data: {
        title,
        description,
        trackId,
        instructorId: sessionInstructorId,
        date: sessionDate,
        startTime,
        endTime,
        externalLink: meetLink,
        materials,
        notes,
        status: "SCHEDULED",
      },
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

    // Link bookings to session if bookingIds provided
    if (bookingIds && Array.isArray(bookingIds) && bookingIds.length > 0) {
      await prisma.sessionBooking.updateMany({
        where: {
          id: { in: bookingIds },
          sessionId: null, // Only update bookings not already linked
        },
        data: {
          sessionId: newSession.id,
          status: "confirmed",
        },
      });
    }

    return NextResponse.json({ session: newSession }, { status: 201 });
  } catch (error) {
    console.error("Error creating session:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
