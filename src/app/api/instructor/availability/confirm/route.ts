import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

// PUT /api/instructor/availability/confirm - Confirm weekly availability (locks it)
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only instructors can confirm availability
    if (session.user.role !== "instructor") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { trackId, weekStartDate } = body;

    // Validation
    if (!trackId || !weekStartDate) {
      return NextResponse.json(
        { error: "trackId and weekStartDate are required" },
        { status: 400 }
      );
    }

    // Parse date in local time to avoid timezone shift issues
    const [year, month, day] = weekStartDate.split('-').map(Number);
    const weekStart = new Date(year, month - 1, day);

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

    // Find all unconfirmed availability slots for this week/track
    const slotsToConfirm = await prisma.instructorAvailability.findMany({
      where: {
        instructorId: session.user.id,
        trackId,
        weekStartDate: weekStart,
        isConfirmed: false,
      },
    });

    if (slotsToConfirm.length === 0) {
      return NextResponse.json(
        { error: "No unconfirmed availability slots found for this week/track" },
        { status: 404 }
      );
    }

    // Confirm all slots
    await prisma.instructorAvailability.updateMany({
      where: {
        instructorId: session.user.id,
        trackId,
        weekStartDate: weekStart,
        isConfirmed: false,
      },
      data: {
        isConfirmed: true,
      },
    });

    return NextResponse.json({
      message: `Confirmed ${slotsToConfirm.length} availability slots for the week`,
      confirmedCount: slotsToConfirm.length,
    });
  } catch (error) {
    console.error("Error confirming availability:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
