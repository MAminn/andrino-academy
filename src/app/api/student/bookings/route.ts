import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

// GET /api/student/bookings - Fetch student's bookings
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only students can view their bookings
    if (session.user.role !== "student") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const upcoming = searchParams.get("upcoming");

    // Build query
    const where: any = {
      studentId: session.user.id,
    };

    if (status) {
      where.status = status;
    }

    // If upcoming filter is set, only show bookings for future dates
    if (upcoming === "true") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      where.availability = {
        weekStartDate: {
          gte: today,
        },
      };
    }

    const bookings = await prisma.sessionBooking.findMany({
      where,
      include: {
        track: {
          select: {
            id: true,
            name: true,
            gradeId: true,
            instructor: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        availability: {
          select: {
            id: true,
            weekStartDate: true,
            dayOfWeek: true,
            startHour: true,
            endHour: true,
            instructor: {
              select: {
                id: true,
                name: true,
                email: true,
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
        { availability: { weekStartDate: "asc" } },
        { availability: { dayOfWeek: "asc" } },
        { availability: { startHour: "asc" } },
      ],
    });

    // Calculate next session
    const now = new Date();
    const nextBooking = bookings.find(booking => {
      const bookingDate = new Date(booking.availability.weekStartDate);
      bookingDate.setDate(bookingDate.getDate() + booking.availability.dayOfWeek);
      bookingDate.setHours(booking.availability.startHour, 0, 0, 0);
      return bookingDate > now && booking.status === "confirmed";
    });

    return NextResponse.json({
      bookings,
      totalBookings: bookings.length,
      confirmedBookings: bookings.filter(b => b.status === "confirmed").length,
      nextBooking: nextBooking || null,
    });
  } catch (error) {
    console.error("Error fetching student bookings:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
