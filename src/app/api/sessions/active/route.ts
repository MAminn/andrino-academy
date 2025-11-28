import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

import { db, schema, eq, and, or, desc, asc, count, sql, isNull, inArray, lte } from "@/lib/db";

// GET /api/sessions/active - Check for active sessions right now
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const currentHour = now.getHours();
    const currentMinutes = now.getMinutes();
    const currentTime = `${String(currentHour).padStart(2, '0')}:${String(currentMinutes).padStart(2, '0')}`;

    let activeSessions: any[] = [];

    if (session.user.role === "instructor") {
      // Find availability slots
      const availSlots = await db
        .select({ id: schema.instructorAvailabilities.id, weekStartDate: schema.instructorAvailabilities.weekStartDate, dayOfWeek: schema.instructorAvailabilities.dayOfWeek, startHour: schema.instructorAvailabilities.startHour, endHour: schema.instructorAvailabilities.endHour })
        .from(schema.instructorAvailabilities)
        .where(and(eq(schema.instructorAvailabilities.instructorId, session.user.id), lte(schema.instructorAvailabilities.weekStartDate, now)));

      const availIds = availSlots.map((a: any) => a.id);
      if (availIds.length === 0) {
        return NextResponse.json({ activeSessions: [] });
      }

      const baseBookings = await db
        .select()
        .from(schema.sessionBookings)
        .where(and(eq(schema.sessionBookings.status, "confirmed"), inArray(schema.sessionBookings.availabilityId, availIds)));

      // Fetch relations and filter
      const bookingsWithRelations = await Promise.all(
        baseBookings.map(async (booking: any) => {
          const [student, track, availability, sess] = await Promise.all([
            db.select({ id: schema.users.id, name: schema.users.name, email: schema.users.email }).from(schema.users).where(eq(schema.users.id, booking.studentId)).then((r) => r[0]),
            booking.trackId ? db.select({ id: schema.tracks.id, name: schema.tracks.name }).from(schema.tracks).where(eq(schema.tracks.id, booking.trackId)).then((r) => r[0]) : null,
            availSlots.find((a: any) => a.id === booking.availabilityId) || null,
            booking.sessionId ? db.select({ id: schema.liveSessions.id, title: schema.liveSessions.title, externalLink: schema.liveSessions.externalLink, status: schema.liveSessions.status }).from(schema.liveSessions).where(eq(schema.liveSessions.id, booking.sessionId)).then((r) => r[0]) : null,
          ]);
          return { ...booking, student, track, availability, session: sess };
        })
      );

      // Filter for sessions happening right now
      activeSessions = bookingsWithRelations.filter((booking: any) => {
        const sessionDate = new Date(booking.availability.weekStartDate);
        sessionDate.setDate(sessionDate.getDate() + booking.availability.dayOfWeek);
        const sessionDateStr = sessionDate.toISOString().split('T')[0];
        
        if (sessionDateStr !== today) return false;
        
        const isActiveNow = currentHour >= booking.availability.startHour && 
                           currentHour < booking.availability.endHour;
        return isActiveNow;
      });

    } else if (session.user.role === "student") {
      // Find student's active sessions
      const bookingsData = await db
        .select({
          id: schema.sessionBookings.id,
          trackId: schema.sessionBookings.trackId,
          availabilityId: schema.sessionBookings.availabilityId,
          sessionId: schema.sessionBookings.sessionId,
          status: schema.sessionBookings.status,
        })
        .from(schema.sessionBookings)
        .where(
          and(
            eq(schema.sessionBookings.studentId, session.user.id),
            eq(schema.sessionBookings.status, "confirmed")
          )
        );

      const bookings = await Promise.all(
        bookingsData.map(async (booking) => {
          const [track] = await db
            .select({
              id: schema.tracks.id,
              name: schema.tracks.name,
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

          const [availabilityInstructor] = availability
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
                  externalLink: schema.liveSessions.externalLink,
                  status: schema.liveSessions.status,
                })
                .from(schema.liveSessions)
                .where(eq(schema.liveSessions.id, booking.sessionId))
                .limit(1)
            : [null];

          return {
            ...booking,
            track: track ? {
              ...track,
              instructor: trackInstructor || null,
            } : null,
            availability: availability ? {
              ...availability,
              instructor: availabilityInstructor || null,
            } : null,
            session: liveSession || null,
          };
        })
      );

      // Filter for sessions happening right now
      activeSessions = bookings.filter(booking => {
        if (!booking.availability) return false;
        
        const sessionDate = new Date(booking.availability.weekStartDate);
        sessionDate.setDate(sessionDate.getDate() + booking.availability.dayOfWeek);
        const sessionDateStr = sessionDate.toISOString().split('T')[0];
        
        if (sessionDateStr !== today) return false;
        
        const isActiveNow = currentHour >= booking.availability.startHour && 
                           currentHour < booking.availability.endHour;
        return isActiveNow;
      });
    }

    return NextResponse.json({
      hasActiveSessions: activeSessions.length > 0,
      activeSessions,
      currentTime: now.toISOString(),
    });
  } catch (error) {
    console.error("Error checking active sessions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

