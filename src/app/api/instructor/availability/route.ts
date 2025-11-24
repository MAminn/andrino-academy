import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

// GET /api/instructor/availability - Fetch instructor's availability slots
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only instructors can view their availability
    if (session.user.role !== "instructor") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const weekStartDate = searchParams.get("weekStartDate");
    const trackId = searchParams.get("trackId");

    // Build query filters
    const where: any = {
      instructorId: session.user.id,
    };

    if (weekStartDate) {
      where.weekStartDate = new Date(weekStartDate);
    }

    if (trackId) {
      where.trackId = trackId;
    }

    const availability = await prisma.instructorAvailability.findMany({
      where,
      include: {
        track: {
          select: {
            id: true,
            name: true,
            gradeId: true,
          },
        },
        bookings: {
          include: {
            student: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: [
        { weekStartDate: "asc" },
        { dayOfWeek: "asc" },
        { startHour: "asc" },
      ],
    });

    return NextResponse.json({ availability });
  } catch (error) {
    console.error("Error fetching availability:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/instructor/availability - Create availability slots
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only instructors can create availability
    if (session.user.role !== "instructor") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { trackId, weekStartDate, slots } = body;

    // Validation
    if (!trackId || !weekStartDate || !slots || !Array.isArray(slots)) {
      return NextResponse.json(
        { error: "trackId, weekStartDate, and slots array are required" },
        { status: 400 }
      );
    }

    // Verify track exists and instructor is assigned to it
    const track = await prisma.track.findFirst({
      where: {
        id: trackId,
        instructorId: session.user.id,
      },
    });

    if (!track) {
      return NextResponse.json(
        { error: "Track not found or you are not assigned to this track" },
        { status: 404 }
      );
    }

    // Get schedule settings to determine week start
    const scheduleSettings = await prisma.scheduleSettings.findFirst();
    const weekStartDay = scheduleSettings?.weekResetDay ?? 0; // Default to Sunday

    // Validate weekStartDate matches the configured week start day
    const weekStart = new Date(weekStartDate);
    if (weekStart.getDay() !== weekStartDay) {
      const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      return NextResponse.json(
        { error: `weekStartDate must be a ${dayNames[weekStartDay]}` },
        { status: 400 }
      );
    }

    // Check if availability already exists and is confirmed for this week/track
    const existingConfirmed = await prisma.instructorAvailability.findFirst({
      where: {
        instructorId: session.user.id,
        trackId,
        weekStartDate: weekStart,
        isConfirmed: true,
      },
    });

    if (existingConfirmed) {
      return NextResponse.json(
        { error: "Availability for this week/track is already confirmed and cannot be modified" },
        { status: 400 }
      );
    }

    // Delete any unconfirmed existing slots for this week/track
    await prisma.instructorAvailability.deleteMany({
      where: {
        instructorId: session.user.id,
        trackId,
        weekStartDate: weekStart,
        isConfirmed: false,
      },
    });

    // Create new availability slots
    const createdSlots = await Promise.all(
      slots.map((slot: any) => {
        const { dayOfWeek, startHour, endHour } = slot;

        // Validation
        if (
          typeof dayOfWeek !== "number" ||
          dayOfWeek < 0 ||
          dayOfWeek > 6
        ) {
          throw new Error("dayOfWeek must be between 0 (Sunday) and 6 (Saturday)");
        }

        if (
          typeof startHour !== "number" ||
          startHour < 13 ||
          startHour > 22
        ) {
          throw new Error("startHour must be between 13 (1pm) and 22 (10pm)");
        }

        if (
          typeof endHour !== "number" ||
          endHour < 13 ||
          endHour > 22 ||
          endHour <= startHour
        ) {
          throw new Error("endHour must be between 13 and 22, and greater than startHour");
        }

        return prisma.instructorAvailability.create({
          data: {
            instructorId: session.user.id,
            trackId,
            weekStartDate: weekStart,
            dayOfWeek,
            startHour,
            endHour,
            isBooked: false,
            isConfirmed: false,
          },
        });
      })
    );

    return NextResponse.json(
      {
        message: "Availability slots created successfully",
        slots: createdSlots,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating availability:", error);
    
    if (error instanceof Error && error.message.includes("must be")) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
