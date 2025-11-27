import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

// GET /api/student/available-slots - Fetch available time slots for a track
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only students can view available slots
    if (session.user.role !== "student") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const trackId = searchParams.get("trackId");
    const weekStartDate = searchParams.get("weekStartDate");

    // Validation
    if (!trackId) {
      return NextResponse.json(
        { error: "trackId is required" },
        { status: 400 }
      );
    }

    // Verify track exists
    const track = await prisma.track.findUnique({
      where: { id: trackId },
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!track) {
      return NextResponse.json(
        { error: "Track not found" },
        { status: 404 }
      );
    }

    // Build query
    const where: any = {
      trackId,
      isConfirmed: true, // Only show confirmed slots
      // Removed isBooked: false to allow multiple students to book the same slot
    };

    if (weekStartDate) {
      // Parse date in local time to avoid timezone shift issues
      const [year, month, day] = weekStartDate.split('-').map(Number);
      where.weekStartDate = new Date(year, month - 1, day);
    }

    // Fetch available slots
    const availableSlots = await prisma.instructorAvailability.findMany({
      where,
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        track: {
          select: {
            id: true,
            name: true,
            gradeId: true,
          },
        },
      },
      orderBy: [
        { weekStartDate: "asc" },
        { dayOfWeek: "asc" },
        { startHour: "asc" },
      ],
    });

    return NextResponse.json({
      track,
      availableSlots,
      totalSlots: availableSlots.length,
    });
  } catch (error) {
    console.error("Error fetching available slots:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
