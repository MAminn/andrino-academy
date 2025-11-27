import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

// POST /api/student/book-session - Book an available time slot
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only students can book sessions
    if (session.user.role !== "student") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { availabilityId, studentNotes } = body;

    // Validation
    if (!availabilityId) {
      return NextResponse.json(
        { error: "availabilityId is required" },
        { status: 400 }
      );
    }

    // Fetch the availability slot
    const availability = await prisma.instructorAvailability.findUnique({
      where: { id: availabilityId },
      include: {
        track: true,
        bookings: true,
      },
    });

    if (!availability) {
      return NextResponse.json(
        { error: "Availability slot not found" },
        { status: 404 }
      );
    }

    // Check if slot is confirmed
    if (!availability.isConfirmed) {
      return NextResponse.json(
        { error: "This slot is not yet confirmed by the instructor" },
        { status: 400 }
      );
    }

    // Check if student already has a booking for this slot (prevent duplicate bookings by same student)
    const existingBooking = availability.bookings.find(
      (b) => b.studentId === session.user.id
    );

    if (existingBooking) {
      return NextResponse.json(
        { error: "You have already booked this slot" },
        { status: 400 }
      );
    }

    // Create the booking (multiple students can book the same slot)
    const booking = await prisma.sessionBooking.create({
      data: {
        availabilityId,
        studentId: session.user.id,
        trackId: availability.trackId,
        status: "confirmed", // Changed from "booked" to "confirmed"
        studentNotes: studentNotes || null,
      },
      include: {
        availability: {
          include: {
            instructor: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        track: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        message: "Session booked successfully",
        booking,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error booking session:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/student/book-session - Cancel a booking
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only students can cancel their bookings
    if (session.user.role !== "student") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get("bookingId");

    // Validation
    if (!bookingId) {
      return NextResponse.json(
        { error: "bookingId is required" },
        { status: 400 }
      );
    }

    // Fetch the booking
    const booking = await prisma.sessionBooking.findUnique({
      where: { id: bookingId },
      include: {
        availability: true,
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    // Verify student owns this booking
    if (booking.studentId !== session.user.id) {
      return NextResponse.json(
        { error: "You can only cancel your own bookings" },
        { status: 403 }
      );
    }

    // Check if booking is already completed
    if (booking.status === "completed") {
      return NextResponse.json(
        { error: "Cannot cancel a completed booking" },
        { status: 400 }
      );
    }

    // Check if session has been created (linked)
    if (booking.sessionId) {
      return NextResponse.json(
        { error: "Cannot cancel - instructor has already created a session for this booking" },
        { status: 400 }
      );
    }

    // Delete booking and mark availability as not booked in a transaction
    await prisma.$transaction([
      prisma.sessionBooking.delete({
        where: { id: bookingId },
      }),
      prisma.instructorAvailability.update({
        where: { id: booking.availabilityId },
        data: { isBooked: false },
      }),
    ]);

    return NextResponse.json({
      message: "Booking cancelled successfully",
    });
  } catch (error) {
    console.error("Error cancelling booking:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
