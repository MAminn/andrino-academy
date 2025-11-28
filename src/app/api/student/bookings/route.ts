import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db, schema } from "@/lib/db";
import { eq, and, sql, gte, asc } from "drizzle-orm";

// GET /api/student/bookings - Fetch student's bookings
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only students can view their bookings
    if (session.user.role !== "student") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const upcoming = searchParams.get("upcoming");

    // Build conditions
    const conditions: any[] = [
      eq(schema.sessionBookings.studentId, session.user.id),
    ];

    if (status) {
      conditions.push(eq(schema.sessionBookings.status, status));
    }

    // If upcoming filter is set, only show bookings for future dates
    if (upcoming === "true") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const upcomingAvailabilities = await db
        .select({ id: schema.instructorAvailabilities.id })
        .from(schema.instructorAvailabilities)
        .where(sql`${schema.instructorAvailabilities.weekStartDate} >= ${today}`);
      
      const upcomingIds = upcomingAvailabilities.map(a => a.id);
      if (upcomingIds.length > 0) {
        conditions.push(sql`${schema.sessionBookings.availabilityId} IN (${sql.join(upcomingIds.map(id => sql`${id}`), sql`, `)})`);
      }
    }

    const bookingsData = await db
      .select({
        id: schema.sessionBookings.id,
        studentId: schema.sessionBookings.studentId,
        trackId: schema.sessionBookings.trackId,
        availabilityId: schema.sessionBookings.availabilityId,
        sessionId: schema.sessionBookings.sessionId,
        status: schema.sessionBookings.status,
      })
      .from(schema.sessionBookings)
      .where(and(...conditions));

    // Manually fetch all relations
    const bookings = await Promise.all(
      bookingsData.map(async (booking) => {
        const [track] = await db
          .select({
            id: schema.tracks.id,
            name: schema.tracks.name,
            gradeId: schema.tracks.gradeId,
            instructorId: schema.tracks.instructorId,
          })
          .from(schema.tracks)
          .where(eq(schema.tracks.id, booking.trackId))
          .limit(1);

        const [trackInstructor] = track
          ? await db
              .select({
                id: schema.users.id,
                name: schema.users.name,
                email: schema.users.email,
              })
              .from(schema.users)
              .where(eq(schema.users.id, track.instructorId))
              .limit(1)
          : [null];

        const [availability] = booking.availabilityId
          ? await db
              .select({
                id: schema.instructorAvailabilities.id,
                weekStartDate: schema.instructorAvailabilities.weekStartDate,
                dayOfWeek: schema.instructorAvailabilities.dayOfWeek,
                startHour: schema.instructorAvailabilities.startHour,
                endHour: schema.instructorAvailabilities.endHour,
                instructorId: schema.instructorAvailabilities.instructorId,
                trackId: schema.instructorAvailabilities.trackId,
              })
              .from(schema.instructorAvailabilities)
              .where(eq(schema.instructorAvailabilities.id, booking.availabilityId))
              .limit(1)
          : [null];

        const [availInstructor] = availability
          ? await db
              .select({
                id: schema.users.id,
                name: schema.users.name,
                email: schema.users.email,
              })
              .from(schema.users)
              .where(eq(schema.users.id, availability.instructorId))
              .limit(1)
          : [null];

        const [availTrack] = availability
          ? await db
              .select({
                id: schema.tracks.id,
                name: schema.tracks.name,
                gradeId: schema.tracks.gradeId,
              })
              .from(schema.tracks)
              .where(eq(schema.tracks.id, availability.trackId))
              .limit(1)
          : [null];

        const [grade] = availTrack?.gradeId
          ? await db
              .select({
                id: schema.grades.id,
                name: schema.grades.name,
              })
              .from(schema.grades)
              .where(eq(schema.grades.id, availTrack.gradeId))
              .limit(1)
          : [null];

        const [liveSession] = booking.sessionId
          ? await db
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
              .limit(1)
          : [null];

        return {
          ...booking,
          track: track
            ? {
                ...track,
                instructor: trackInstructor,
              }
            : null,
          availability: availability
            ? {
                ...availability,
                instructor: availInstructor,
                track: availTrack ? {
                  ...availTrack,
                  gradeName: grade?.name,
                } : null,
              }
            : null,
          session: liveSession,
        };
      })
    );

    // Sort manually since Drizzle doesn't support nested orderBy
    bookings.sort((a, b) => {
      if (!a.availability || !b.availability) return 0;
      const dateCompare = new Date(a.availability.weekStartDate).getTime() - new Date(b.availability.weekStartDate).getTime();
      if (dateCompare !== 0) return dateCompare;
      const dayCompare = a.availability.dayOfWeek - b.availability.dayOfWeek;
      if (dayCompare !== 0) return dayCompare;
      return a.availability.startHour - b.availability.startHour;
    });

    // Calculate next session
    const now = new Date();
    const nextBooking = bookings.find(booking => {
      if (!booking.availability) return false;
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
