import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

import { db, schema, eq, and, or, desc, asc, count, sql, isNull, inArray } from "@/lib/db";

// GET /api/instructor/bookings - Fetch instructor's bookings
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only instructors can view their bookings
    if (session.user.role !== "instructor") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const trackId = searchParams.get("trackId");
    const status = searchParams.get("status");

    // Find availability slots for this instructor
    const availabilityConditions = [eq(schema.instructorAvailabilities.instructorId, session.user.id)];
    if (trackId) availabilityConditions.push(eq(schema.instructorAvailabilities.trackId, trackId));

    const availabilitySlots = await db
      .select({ id: schema.instructorAvailabilities.id })
      .from(schema.instructorAvailabilities)
      .where(and(...availabilityConditions));

    const availabilityIds = availabilitySlots.map((a: any) => a.id);

    if (availabilityIds.length === 0) {
      return NextResponse.json({ bookings: [] });
    }

    // Build booking conditions
    const bookingConditions = [inArray(schema.sessionBookings.availabilityId, availabilityIds)];
    if (status) bookingConditions.push(eq(schema.sessionBookings.status, status as any));

    // Query bookings
    const baseBookings = await db
      .select()
      .from(schema.sessionBookings)
      .where(and(...bookingConditions))
      .orderBy(desc(schema.sessionBookings.createdAt));

    // Fetch relations for each booking
    const bookings = await Promise.all(
      baseBookings.map(async (booking: any) => {
        const [student, track, availability, session] = await Promise.all([
          db
            .select({ id: schema.users.id, name: schema.users.name, email: schema.users.email, age: schema.users.age })
            .from(schema.users)
            .where(eq(schema.users.id, booking.studentId))
            .then((r) => r[0] || null),
          booking.trackId
            ? db
                .select({ id: schema.tracks.id, name: schema.tracks.name, gradeId: schema.tracks.gradeId })
                .from(schema.tracks)
                .where(eq(schema.tracks.id, booking.trackId))
                .then((r) => r[0] || null)
            : null,
          booking.availabilityId
            ? db
                .select()
                .from(schema.instructorAvailabilities)
                .where(eq(schema.instructorAvailabilities.id, booking.availabilityId))
                .then((r) => r[0] || null)
            : null,
          booking.sessionId
            ? db
                .select({
                  id: schema.liveSessions.id,
                  title: schema.liveSessions.title,
                  date: schema.liveSessions.date,
                  startTime: schema.liveSessions.startTime,
                  endTime: schema.liveSessions.endTime,
                  status: schema.liveSessions.status,
                })
                .from(schema.liveSessions)
                .where(eq(schema.liveSessions.id, booking.sessionId))
                .then((r) => r[0] || null)
            : null,
        ]);

        // Fetch track for availability if exists
        let availabilityWithTrack: any = availability;
        if (availability?.trackId) {
          const availTrack = await db
            .select({ id: schema.tracks.id, name: schema.tracks.name, gradeId: schema.tracks.gradeId })
            .from(schema.tracks)
            .where(eq(schema.tracks.id, availability.trackId))
            .then((r) => r[0] || null);
          availabilityWithTrack = { ...availability, track: availTrack };
        }

        return {
          ...booking,
          student,
          track,
          availability: availabilityWithTrack,
          session,
        };
      })
    );

    // Sort by availability weekStartDate desc, then createdAt desc
    bookings.sort((a: any, b: any) => {
      if (a.availability?.weekStartDate && b.availability?.weekStartDate) {
        const dateCompare = b.availability.weekStartDate.getTime() - a.availability.weekStartDate.getTime();
        if (dateCompare !== 0) return dateCompare;
      }
      return b.createdAt.getTime() - a.createdAt.getTime();
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



