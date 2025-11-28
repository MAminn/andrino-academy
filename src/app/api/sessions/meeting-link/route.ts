import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

import { db, schema, eq, and, or, desc, asc, count, sql, isNull } from "@/lib/db";

// POST /api/sessions/meeting-link - Add/update meeting link for a session
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user) {
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
    const [bookingData] = await db
      .select({
        id: schema.sessionBookings.id,
        trackId: schema.sessionBookings.trackId,
        availabilityId: schema.sessionBookings.availabilityId,
        sessionId: schema.sessionBookings.sessionId,
      })
      .from(schema.sessionBookings)
      .where(eq(schema.sessionBookings.id, bookingId))
      .limit(1);

    const [availability] = bookingData
      ? await db
          .select({
            instructorId: schema.instructorAvailabilities.instructorId,
            trackId: schema.instructorAvailabilities.trackId,
            weekStartDate: schema.instructorAvailabilities.weekStartDate,
            dayOfWeek: schema.instructorAvailabilities.dayOfWeek,
            startHour: schema.instructorAvailabilities.startHour,
            endHour: schema.instructorAvailabilities.endHour,
          })
          .from(schema.instructorAvailabilities)
          .where(eq(schema.instructorAvailabilities.id, bookingData.availabilityId))
          .limit(1)
      : [null];

    const [track] = bookingData
      ? await db
          .select({ name: schema.tracks.name })
          .from(schema.tracks)
          .where(eq(schema.tracks.id, bookingData.trackId))
          .limit(1)
      : [null];

    const booking: any = bookingData
      ? {
          ...bookingData,
          availability,
          track,
        }
      : null;

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
      const updateData: any = {
        externalLink: meetingLink,
        linkAddedAt: new Date(),
        status: "READY",
      };
      if (title) {
        updateData.title = title;
      }

      await db
        .update(schema.liveSessions)
        .set(updateData)
        .where(eq(schema.liveSessions.id, booking.sessionId));

      [liveSession] = await db
        .select()
        .from(schema.liveSessions)
        .where(eq(schema.liveSessions.id, booking.sessionId))
        .limit(1);
    } else {
      // Create new session
      const [newSessionId] = await db
        .insert(schema.liveSessions)
        .values({
          title: title || `${booking.track.name} - Session`,
          trackId: booking.trackId,
          instructorId: session.user.id,
          date: sessionDate,
          startTime: `${String(booking.availability.startHour).padStart(2, '0')}:00`,
          endTime: `${String(booking.availability.endHour).padStart(2, '0')}:00`,
          externalLink: meetingLink,
          linkAddedAt: new Date(),
          status: "READY",
        })
        .$returningId();

      [liveSession] = await db
        .select()
        .from(schema.liveSessions)
        .where(eq(schema.liveSessions.id, newSessionId.id))
        .limit(1);

      // Link the booking to the session
      await db
        .update(schema.sessionBookings)
        .set({ sessionId: liveSession.id })
        .where(eq(schema.sessionBookings.id, bookingId));
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
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user) {
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
    const [availabilityData] = await db
      .select({
        id: schema.instructorAvailabilities.id,
        instructorId: schema.instructorAvailabilities.instructorId,
        trackId: schema.instructorAvailabilities.trackId,
        weekStartDate: schema.instructorAvailabilities.weekStartDate,
        dayOfWeek: schema.instructorAvailabilities.dayOfWeek,
        startHour: schema.instructorAvailabilities.startHour,
        endHour: schema.instructorAvailabilities.endHour,
      })
      .from(schema.instructorAvailabilities)
      .where(eq(schema.instructorAvailabilities.id, availabilityId))
      .limit(1);

    const bookings = availabilityData
      ? await db
          .select({ id: schema.sessionBookings.id })
          .from(schema.sessionBookings)
          .where(
            and(
              eq(schema.sessionBookings.availabilityId, availabilityData.id),
              eq(schema.sessionBookings.status, "confirmed")
            )
          )
      : [];

    const [track] = availabilityData
      ? await db
          .select({ name: schema.tracks.name })
          .from(schema.tracks)
          .where(eq(schema.tracks.id, availabilityData.trackId))
          .limit(1)
      : [null];

    const availability: any = availabilityData
      ? {
          ...availabilityData,
          bookings,
          track,
        }
      : null;

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
    const [existingSession] = await db
      .select()
      .from(schema.liveSessions)
      .where(
        and(
          eq(schema.liveSessions.trackId, availability.trackId),
          eq(schema.liveSessions.instructorId, session.user.id),
          eq(schema.liveSessions.date, sessionDate),
          eq(schema.liveSessions.startTime, `${String(availability.startHour).padStart(2, '0')}:00`)
        )
      )
      .limit(1);

    let liveSession;
    if (existingSession) {
      // Update existing session
      const updateData: any = {
        externalLink: meetingLink,
        linkAddedAt: new Date(),
        status: "READY",
      };
      if (title) {
        updateData.title = title;
      }

      await db
        .update(schema.liveSessions)
        .set(updateData)
        .where(eq(schema.liveSessions.id, existingSession.id));

      [liveSession] = await db
        .select()
        .from(schema.liveSessions)
        .where(eq(schema.liveSessions.id, existingSession.id))
        .limit(1);
    } else {
      // Create new session
      const [newSessionId] = await db
        .insert(schema.liveSessions)
        .values({
          title: title || `${availability.track.name} - Session`,
          trackId: availability.trackId,
          instructorId: session.user.id,
          date: sessionDate,
          startTime: `${String(availability.startHour).padStart(2, '0')}:00`,
          endTime: `${String(availability.endHour).padStart(2, '0')}:00`,
          externalLink: meetingLink,
          linkAddedAt: new Date(),
          status: "READY",
        })
        .$returningId();

      [liveSession] = await db
        .select()
        .from(schema.liveSessions)
        .where(eq(schema.liveSessions.id, newSessionId.id))
        .limit(1);
    }

    // Link all bookings to this session
    await db
      .update(schema.sessionBookings)
      .set({ sessionId: liveSession.id })
      .where(
        and(
          eq(schema.sessionBookings.availabilityId, availability.id),
          eq(schema.sessionBookings.status, "confirmed")
        )
      );

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

