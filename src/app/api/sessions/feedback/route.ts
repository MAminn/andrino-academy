import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db, schema } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";

// POST /api/sessions/feedback - Submit feedback after session
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { bookingId, feedback, type } = body; // type: 'student' or 'instructor'

    if (!bookingId || !feedback) {
      return NextResponse.json(
        { error: "bookingId and feedback are required" },
        { status: 400 }
      );
    }

    // Get the booking
    const [booking] = await db
      .select({
        id: schema.sessionBookings.id,
        studentId: schema.sessionBookings.studentId,
        availabilityId: schema.sessionBookings.availabilityId,
      })
      .from(schema.sessionBookings)
      .where(eq(schema.sessionBookings.id, bookingId))
      .limit(1);

    const [availability] = booking
      ? await db
          .select({
            instructorId: schema.instructorAvailabilities.instructorId,
          })
          .from(schema.instructorAvailabilities)
          .where(eq(schema.instructorAvailabilities.id, booking.availabilityId))
          .limit(1)
      : [null];

    const bookingWithAvailability: any = booking
      ? { ...booking, availability }
      : null;

    if (!bookingWithAvailability) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    // Verify user has permission to leave feedback
    if (type === "student" && bookingWithAvailability.studentId !== session.user.id) {
      return NextResponse.json(
        { error: "You can only leave feedback for your own sessions" },
        { status: 403 }
      );
    }

    if (type === "instructor" && bookingWithAvailability.availability?.instructorId !== session.user.id) {
      return NextResponse.json(
        { error: "You can only leave feedback for your own sessions" },
        { status: 403 }
      );
    }

    // Update booking with feedback
    const updateData: any = { status: "completed" };
    if (type === "student") {
      updateData.studentNotes = feedback;
      updateData.feedbackGivenAt = new Date();
    } else if (type === "instructor") {
      updateData.instructorNotes = feedback;
    }

    await db
      .update(schema.sessionBookings)
      .set(updateData)
      .where(eq(schema.sessionBookings.id, bookingId));

    // Fetch updated booking with relations
    const [updatedBookingData] = await db
      .select({
        id: schema.sessionBookings.id,
        studentId: schema.sessionBookings.studentId,
        availabilityId: schema.sessionBookings.availabilityId,
        status: schema.sessionBookings.status,
        studentNotes: schema.sessionBookings.studentNotes,
        instructorNotes: schema.sessionBookings.instructorNotes,
        feedbackGivenAt: schema.sessionBookings.feedbackGivenAt,
      })
      .from(schema.sessionBookings)
      .where(eq(schema.sessionBookings.id, bookingId))
      .limit(1);

    const [student] = updatedBookingData
      ? await db
          .select({ name: schema.users.name })
          .from(schema.users)
          .where(eq(schema.users.id, updatedBookingData.studentId))
          .limit(1)
      : [null];

    const [availabilityData] = updatedBookingData
      ? await db
          .select({
            instructorId: schema.instructorAvailabilities.instructorId,
          })
          .from(schema.instructorAvailabilities)
          .where(eq(schema.instructorAvailabilities.id, updatedBookingData.availabilityId))
          .limit(1)
      : [null];

    const [instructor] = availabilityData
      ? await db
          .select({ name: schema.users.name })
          .from(schema.users)
          .where(eq(schema.users.id, availabilityData.instructorId))
          .limit(1)
      : [null];

    const updatedBooking: any = {
      ...updatedBookingData,
      student,
      availability: availabilityData
        ? {
            ...availabilityData,
            instructor,
          }
        : null,
    };

    return NextResponse.json({
      message: "Feedback submitted successfully",
      booking: updatedBooking,
    });
  } catch (error) {
    console.error("Error submitting feedback:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET /api/sessions/feedback - Get pending feedback requests
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    
    let pendingFeedback: any[] = [];

    if (session.user.role === "instructor") {
      // Find instructor's availabilities first
      const instructorAvailabilities = await db
        .select({ id: schema.instructorAvailabilities.id })
        .from(schema.instructorAvailabilities)
        .where(eq(schema.instructorAvailabilities.instructorId, session.user.id));

      const availabilityIds = instructorAvailabilities.map(a => a.id);

      if (availabilityIds.length > 0) {
        // Find completed sessions without instructor feedback
        const bookingsData = await db
          .select({
            id: schema.sessionBookings.id,
            studentId: schema.sessionBookings.studentId,
            trackId: schema.sessionBookings.trackId,
            availabilityId: schema.sessionBookings.availabilityId,
            sessionId: schema.sessionBookings.sessionId,
          })
          .from(schema.sessionBookings)
          .where(
            and(
              eq(schema.sessionBookings.status, "confirmed"),
              isNull(schema.sessionBookings.instructorNotes)
            )
          );

        // Fetch relations manually
        const bookings = await Promise.all(
          bookingsData.map(async (booking) => {
            const [student] = await db
              .select({
                id: schema.users.id,
                name: schema.users.name,
              })
              .from(schema.users)
              .where(eq(schema.users.id, booking.studentId))
              .limit(1);

            const [track] = await db
              .select({ name: schema.tracks.name })
              .from(schema.tracks)
              .where(eq(schema.tracks.id, booking.trackId))
              .limit(1);

            const [availability] = booking.availabilityId
              ? await db
                  .select({
                    weekStartDate: schema.instructorAvailabilities.weekStartDate,
                    dayOfWeek: schema.instructorAvailabilities.dayOfWeek,
                    startHour: schema.instructorAvailabilities.startHour,
                    endHour: schema.instructorAvailabilities.endHour,
                  })
                  .from(schema.instructorAvailabilities)
                  .where(eq(schema.instructorAvailabilities.id, booking.availabilityId))
                  .limit(1)
              : [null];

            const [liveSession] = booking.sessionId
              ? await db
                  .select({
                    id: schema.liveSessions.id,
                    title: schema.liveSessions.title,
                    date: schema.liveSessions.date,
                    status: schema.liveSessions.status,
                  })
                  .from(schema.liveSessions)
                  .where(eq(schema.liveSessions.id, booking.sessionId))
                  .limit(1)
              : [null];

            // Filter out bookings where session is not COMPLETED
            if (!liveSession || liveSession.status !== "COMPLETED") {
              return null;
            }

            return {
              ...booking,
              student,
              track,
              availability,
              session: liveSession,
            };
          })
        );

        pendingFeedback = bookings.filter(b => b !== null);
      }

    } else if (session.user.role === "student") {
      // Find completed sessions without student feedback
      const bookingsData = await db
        .select({
          id: schema.sessionBookings.id,
          trackId: schema.sessionBookings.trackId,
          availabilityId: schema.sessionBookings.availabilityId,
          sessionId: schema.sessionBookings.sessionId,
        })
        .from(schema.sessionBookings)
        .where(
          and(
            eq(schema.sessionBookings.studentId, session.user.id),
            eq(schema.sessionBookings.status, "confirmed"),
            isNull(schema.sessionBookings.feedbackGivenAt)
          )
        );

      const bookings = await Promise.all(
        bookingsData.map(async (booking) => {
          const [track] = await db
            .select({ name: schema.tracks.name })
            .from(schema.tracks)
            .where(eq(schema.tracks.id, booking.trackId))
            .limit(1);

          const [availability] = booking.availabilityId
            ? await db
                .select({
                  weekStartDate: schema.instructorAvailabilities.weekStartDate,
                  dayOfWeek: schema.instructorAvailabilities.dayOfWeek,
                  startHour: schema.instructorAvailabilities.startHour,
                  endHour: schema.instructorAvailabilities.endHour,
                  instructorId: schema.instructorAvailabilities.instructorId,
                })
                .from(schema.instructorAvailabilities)
                .where(eq(schema.instructorAvailabilities.id, booking.availabilityId))
                .limit(1)
            : [null];

          const [instructor] = availability
            ? await db
                .select({
                  id: schema.users.id,
                  name: schema.users.name,
                })
                .from(schema.users)
                .where(eq(schema.users.id, availability.instructorId))
                .limit(1)
            : [null];

          const [liveSession] = booking.sessionId
            ? await db
                .select({
                  id: schema.liveSessions.id,
                  title: schema.liveSessions.title,
                  date: schema.liveSessions.date,
                  status: schema.liveSessions.status,
                })
                .from(schema.liveSessions)
                .where(eq(schema.liveSessions.id, booking.sessionId))
                .limit(1)
            : [null];

          // Filter out bookings where session is not COMPLETED
          if (!liveSession || liveSession.status !== "COMPLETED") {
            return null;
          }

          return {
            ...booking,
            track,
            availability: availability
              ? {
                  ...availability,
                  instructor,
                }
              : null,
            session: liveSession,
          };
        })
      );

      pendingFeedback = bookings.filter(b => b !== null);
    }

    return NextResponse.json({
      pendingFeedback,
      count: pendingFeedback.length,
    });
  } catch (error) {
    console.error("Error fetching pending feedback:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
