import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

// GET /api/instructor/bookings - Fetch instructor's bookings
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only instructors can view their bookings
    if (session.user.role !== "instructor") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const trackId = searchParams.get("trackId");
    const status = searchParams.get("status");

    // Build query - find bookings through availability slots
    const availabilityWhere: any = {
      instructorId: session.user.id,
    };

    if (trackId) {
      availabilityWhere.trackId = trackId;
    }

    const bookingWhere: any = {};

    if (status) {
      bookingWhere.status = status;
    }

    const bookings = await prisma.sessionBooking.findMany({
      where: {
        ...bookingWhere,
        availability: availabilityWhere,
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            age: true,
          },
        },
        track: {
          select: {
            id: true,
            name: true,
            gradeId: true,
          },
        },
        availability: {
          select: {
            id: true,
            weekStartDate: true,
            dayOfWeek: true,
            startHour: true,
            endHour: true,
            track: {
              select: {
                id: true,
                name: true,
                gradeId: true,
              },
            },
          },
        },
        session: {
          select: {
            id: true,
            title: true,
            date: true,
            startTime: true,
            endTime: true,
            status: true,
          },
        },
      },
      orderBy: [
        { availability: { weekStartDate: "desc" } },
        { createdAt: "desc" },
      ],
    });

    return NextResponse.json({ bookings });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
