import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

import { db, schema, eq, and, or, desc, asc, count, sql, isNull } from "@/lib/db";

// POST /api/student/book-session - Book an available time slot
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user) {
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
    const [availabilityData] = await db
      .select({
        id: schema.instructorAvailabilities.id,
        trackId: schema.instructorAvailabilities.trackId,
        isConfirmed: schema.instructorAvailabilities.isConfirmed,
      })
      .from(schema.instructorAvailabilities)
      .where(eq(schema.instructorAvailabilities.id, availabilityId))
      .limit(1);

    const [track] = availabilityData
      ? await db
          .select({
            id: schema.tracks.id,
            name: schema.tracks.name,
          })
          .from(schema.tracks)
          .where(eq(schema.tracks.id, availabilityData.trackId))
          .limit(1)
      : [null];

    const bookings = availabilityData
      ? await db
          .select({
            id: schema.sessionBookings.id,
            studentId: schema.sessionBookings.studentId,
          })
          .from(schema.sessionBookings)
          .where(eq(schema.sessionBookings.availabilityId, availabilityData.id))
      : [];

    const availability: any = availabilityData
      ? {
          ...availabilityData,
          track,
          bookings,
        }
      : null;

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
      (b: any) => b.studentId === session.user.id
    );

    if (existingBooking) {
      return NextResponse.json(
        { error: "You have already booked this slot" },
        { status: 400 }
      );
    }

    // Create the booking (multiple students can book the same slot)
    const [bookingId] = await db
      .insert(schema.sessionBookings)
      .values({
        availabilityId,
        studentId: session.user.id,
        trackId: availability.trackId,
        status: "confirmed",
        studentNotes: studentNotes || null,
      })
      .$returningId();

    const [newBooking] = await db
      .select({
        id: schema.sessionBookings.id,
        availabilityId: schema.sessionBookings.availabilityId,
        studentId: schema.sessionBookings.studentId,
        trackId: schema.sessionBookings.trackId,
        status: schema.sessionBookings.status,
        studentNotes: schema.sessionBookings.studentNotes,
      })
      .from(schema.sessionBookings)
      .where(eq(schema.sessionBookings.id, bookingId.id))
      .limit(1);

    const [bookingAvail] = await db
      .select({
        id: schema.instructorAvailabilities.id,
        instructorId: schema.instructorAvailabilities.instructorId,
      })
      .from(schema.instructorAvailabilities)
      .where(eq(schema.instructorAvailabilities.id, newBooking.availabilityId))
      .limit(1);

    const [instructor] = bookingAvail
      ? await db
          .select({
            id: schema.users.id,
            name: schema.users.name,
            email: schema.users.email,
          })
          .from(schema.users)
          .where(eq(schema.users.id, bookingAvail.instructorId))
          .limit(1)
      : [null];

    const [bookingTrack] = await db
      .select({
        id: schema.tracks.id,
        name: schema.tracks.name,
      })
      .from(schema.tracks)
      .where(eq(schema.tracks.id, newBooking.trackId))
      .limit(1);

    const booking: any = {
      ...newBooking,
      availability: bookingAvail
        ? {
            ...bookingAvail,
            instructor,
          }
        : null,
      track: bookingTrack,
    };

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
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user) {
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
    const [booking] = await db
      .select({
        id: schema.sessionBookings.id,
        studentId: schema.sessionBookings.studentId,
        availabilityId: schema.sessionBookings.availabilityId,
        sessionId: schema.sessionBookings.sessionId,
        status: schema.sessionBookings.status,
      })
      .from(schema.sessionBookings)
      .where(eq(schema.sessionBookings.id, bookingId))
      .limit(1);

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

    // Delete booking and mark availability as not booked
    await db
      .delete(schema.sessionBookings)
      .where(eq(schema.sessionBookings.id, bookingId));

    await db
      .update(schema.instructorAvailabilities)
      .set({ isBooked: false })
      .where(eq(schema.instructorAvailabilities.id, booking.availabilityId));

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

