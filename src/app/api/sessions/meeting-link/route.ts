import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

// POST /api/sessions/meeting-link - Add/update meeting link for a session
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only instructors can add meeting links
    if (session.user.role !== "instructor") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { bookingId, meetingLink, title } = body;

    if (!bookingId || !meetingLink) {
      return NextResponse.json(
        { error: "bookingId and meetingLink are required" },
        { status: 400 }
      );
    }

    // Verify booking exists and instructor owns it
    const booking = await prisma.sessionBooking.findUnique({
      where: { id: bookingId },
      include: {
        availability: {
          select: {
            instructorId: true,
            trackId: true,
            weekStartDate: true,
            dayOfWeek: true,
            startHour: true,
            endHour: true,
          },
        },
        track: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    if (booking.availability.instructorId !== session.user.id) {
      return NextResponse.json(
        { error: "You can only add meeting links to your own sessions" },
        { status: 403 }
      );
    }

    // Calculate session date
    const sessionDate = new Date(booking.availability.weekStartDate);
    sessionDate.setDate(sessionDate.getDate() + booking.availability.dayOfWeek);

    // Create or update LiveSession
    let liveSession;
    if (booking.sessionId) {
      // Update existing session
      liveSession = await prisma.liveSession.update({
        where: { id: booking.sessionId },
        data: {
          externalLink: meetingLink,
          linkAddedAt: new Date(),
          status: "READY",
          ...(title && { title }),
        },
      });
    } else {
      // Create new session
      liveSession = await prisma.liveSession.create({
        data: {
          title: title || `${booking.track.name} - Session`,
          trackId: booking.trackId,
          instructorId: session.user.id,
          date: sessionDate,
          startTime: `${String(booking.availability.startHour).padStart(2, '0')}:00`,
          endTime: `${String(booking.availability.endHour).padStart(2, '0')}:00`,
          externalLink: meetingLink,
          linkAddedAt: new Date(),
          status: "READY",
        },
      });

      // Link the booking to the session
      await prisma.sessionBooking.update({
        where: { id: bookingId },
        data: { sessionId: liveSession.id },
      });
    }

    return NextResponse.json({
      message: "Meeting link added successfully",
      session: liveSession,
    });
  } catch (error) {
    console.error("Error adding meeting link:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/sessions/meeting-link - Bulk add meeting link to all bookings for a time slot
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only instructors can add meeting links
    if (session.user.role !== "instructor") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { availabilityId, meetingLink, title } = body;

    if (!availabilityId || !meetingLink) {
      return NextResponse.json(
        { error: "availabilityId and meetingLink are required" },
        { status: 400 }
      );
    }

    // Get all bookings for this availability slot
    const availability = await prisma.instructorAvailability.findUnique({
      where: { id: availabilityId },
      include: {
        bookings: {
          where: { status: "confirmed" },
        },
        track: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!availability) {
      return NextResponse.json(
        { error: "Availability slot not found" },
        { status: 404 }
      );
    }

    if (availability.instructorId !== session.user.id) {
      return NextResponse.json(
        { error: "You can only add meeting links to your own sessions" },
        { status: 403 }
      );
    }

    // Calculate session date
    const sessionDate = new Date(availability.weekStartDate);
    sessionDate.setDate(sessionDate.getDate() + availability.dayOfWeek);

    // Create or get the LiveSession for this slot
    let liveSession = await prisma.liveSession.findFirst({
      where: {
        trackId: availability.trackId,
        instructorId: session.user.id,
        date: sessionDate,
        startTime: `${String(availability.startHour).padStart(2, '0')}:00`,
      },
    });

    if (liveSession) {
      // Update existing session
      liveSession = await prisma.liveSession.update({
        where: { id: liveSession.id },
        data: {
          externalLink: meetingLink,
          linkAddedAt: new Date(),
          status: "READY",
          ...(title && { title }),
        },
      });
    } else {
      // Create new session
      liveSession = await prisma.liveSession.create({
        data: {
          title: title || `${availability.track.name} - Session`,
          trackId: availability.trackId,
          instructorId: session.user.id,
          date: sessionDate,
          startTime: `${String(availability.startHour).padStart(2, '0')}:00`,
          endTime: `${String(availability.endHour).padStart(2, '0')}:00`,
          externalLink: meetingLink,
          linkAddedAt: new Date(),
          status: "READY",
        },
      });
    }

    // Link all bookings to this session
    await prisma.sessionBooking.updateMany({
      where: {
        availabilityId: availability.id,
        status: "confirmed",
      },
      data: {
        sessionId: liveSession.id,
      },
    });

    return NextResponse.json({
      message: `Meeting link added for ${availability.bookings.length} students`,
      session: liveSession,
      studentCount: availability.bookings.length,
    });
  } catch (error) {
    console.error("Error adding meeting link:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
