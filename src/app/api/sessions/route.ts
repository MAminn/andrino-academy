import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

import { db, schema, eq, and, or, desc, asc, count, sql, isNull, inArray } from "@/lib/db";
import { SessionStatus } from "@/types/api";

// GET /api/sessions - Get sessions (with optional filters)
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // All authenticated users can view sessions (with appropriate filtering)
    const { searchParams } = new URL(request.url);
    const trackId = searchParams.get("trackId");
    const instructorId = searchParams.get("instructorId");
    const status = searchParams.get("status");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const upcoming = searchParams.get("upcoming");
    const today = searchParams.get("today");

    // Build where clause
    const whereClause: {
      trackId?: string | { in: string[] };
      instructorId?: string;
      status?: SessionStatus;
      date?: { gte?: Date; lte?: Date };
    } = {};

    if (trackId) {
      whereClause.trackId = trackId;
    }

    if (instructorId) {
      whereClause.instructorId = instructorId;
    }

    if (status) {
      whereClause.status = status as SessionStatus;
    }

    // Date range filter
    if (startDate || endDate) {
      whereClause.date = {};
      if (startDate) {
        whereClause.date.gte = new Date(startDate);
      }
      if (endDate) {
        whereClause.date.lte = new Date(endDate);
      }
    }

    // Handle special date filters
    if (upcoming === "true") {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      whereClause.date = {
        gte: tomorrow,
      };
    }

    if (today === "true") {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);

      whereClause.date = {
        gte: todayStart,
        lte: todayEnd,
      };
    }

    // Role-based filtering
    if (session.user.role === "instructor") {
      whereClause.instructorId = session.user.id;
    }

    if (session.user.role === "coordinator") {
      // Coordinators can only see sessions from tracks they coordinate
      const coordinatedTracks = await db
        .select({ id: schema.tracks.id })
        .from(schema.tracks)
        .where(eq(schema.tracks.coordinatorId, session.user.id));

      if (coordinatedTracks.length === 0) {
        return NextResponse.json({ sessions: [] });
      }

      if (!trackId) {
        // If no specific track filter, show all their coordinated tracks
        whereClause.trackId = {
          in: coordinatedTracks.map((t) => t.id),
        };
      } else {
        // Check if the requested track is one they coordinate
        const isAuthorized = coordinatedTracks.some((t) => t.id === trackId);
        if (!isAuthorized) {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
      }
    }

    if (session.user.role === "student") {
      // Students can only see sessions from their assigned grade's tracks
      const [student] = await db
        .select({
          gradeId: schema.users.gradeId,
        })
        .from(schema.users)
        .where(eq(schema.users.id, session.user.id));

      if (!student?.gradeId) {
        return NextResponse.json({ sessions: [] });
      }

      const gradeTracks = await db
        .select({ id: schema.tracks.id })
        .from(schema.tracks)
        .where(eq(schema.tracks.gradeId, student.gradeId));

      const trackIds = gradeTracks.map((t) => t.id);
      if (trackIds.length === 0) {
        return NextResponse.json({ sessions: [] });
      }

      if (!trackId) {
        whereClause.trackId = {
          in: trackIds,
        };
      } else {
        // Check if the requested track is in their grade
        const isAuthorized = trackIds.includes(trackId);
        if (!isAuthorized) {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
      }
    }

    // Build Drizzle where conditions
    const conditions = [];
    if (whereClause.trackId) {
      if (typeof whereClause.trackId === 'string') {
        conditions.push(eq(schema.liveSessions.trackId, whereClause.trackId));
      } else if (whereClause.trackId.in) {
        conditions.push(inArray(schema.liveSessions.trackId, whereClause.trackId.in));
      }
    }
    if (whereClause.instructorId) {
      conditions.push(eq(schema.liveSessions.instructorId, whereClause.instructorId));
    }
    if (whereClause.status) {
      conditions.push(eq(schema.liveSessions.status, whereClause.status));
    }
    if (whereClause.date?.gte) {
      conditions.push(sql`${schema.liveSessions.date} >= ${whereClause.date.gte}`);
    }
    if (whereClause.date?.lte) {
      conditions.push(sql`${schema.liveSessions.date} <= ${whereClause.date.lte}`);
    }

    const sessionsRaw = await db
      .select()
      .from(schema.liveSessions)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(asc(schema.liveSessions.date), asc(schema.liveSessions.startTime));

    // Manually fetch relations
    const sessions = await Promise.all(
      sessionsRaw.map(async (session) => {
        const [track] = await db
          .select()
          .from(schema.tracks)
          .where(eq(schema.tracks.id, session.trackId));

        const [grade] = track?.gradeId
          ? await db
              .select({ id: schema.grades.id, name: schema.grades.name })
              .from(schema.grades)
              .where(eq(schema.grades.id, track.gradeId))
          : [null];

        const [trackInstructor] = track?.instructorId
          ? await db
              .select({
                id: schema.users.id,
                name: schema.users.name,
                email: schema.users.email,
              })
              .from(schema.users)
              .where(eq(schema.users.id, track.instructorId))
          : [null];

        const [instructor] = await db
          .select({
            id: schema.users.id,
            name: schema.users.name,
            email: schema.users.email,
          })
          .from(schema.users)
          .where(eq(schema.users.id, session.instructorId));

        const attendances = await db
          .select()
          .from(schema.sessionAttendances)
          .where(eq(schema.sessionAttendances.sessionId, session.id));

        const attendancesWithStudents = await Promise.all(
          attendances.map(async (attendance) => {
            const [student] = await db
              .select({
                id: schema.users.id,
                name: schema.users.name,
                email: schema.users.email,
              })
              .from(schema.users)
              .where(eq(schema.users.id, attendance.studentId));
            return { ...attendance, student };
          })
        );

        return {
          ...session,
          track: track
            ? {
                ...track,
                grade,
                instructor: trackInstructor,
              }
            : null,
          instructor,
          attendances: attendancesWithStudents,
          _count: { attendances: attendances.length },
        };
      })
    );

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error("Error fetching sessions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/sessions - Create a new session
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Instructors can create sessions for their tracks, managers/coordinators/CEO can create any
    const body = await request.json();
    const {
      title,
      description,
      trackId,
      instructorId,
      date,
      startTime,
      endTime,
      meetLink,
      materials,
      notes,
      bookingIds,
    } = body;

    // Validation
    if (!title || typeof title !== "string") {
      return NextResponse.json(
        { error: "Session title is required" },
        { status: 400 }
      );
    }

    if (!trackId) {
      return NextResponse.json(
        { error: "Track ID is required" },
        { status: 400 }
      );
    }

    if (!date) {
      return NextResponse.json(
        { error: "Session date is required" },
        { status: 400 }
      );
    }

    if (!startTime || !endTime) {
      return NextResponse.json(
        { error: "Start time and end time are required" },
        { status: 400 }
      );
    }

    // Verify track exists
    const [track] = await db
      .select()
      .from(schema.tracks)
      .where(eq(schema.tracks.id, trackId));

    if (track) {
      const [instructor] = track.instructorId
        ? await db
            .select()
            .from(schema.users)
            .where(eq(schema.users.id, track.instructorId))
        : [null];
      const [coordinator] = track.coordinatorId
        ? await db
            .select()
            .from(schema.users)
            .where(eq(schema.users.id, track.coordinatorId))
        : [null];
      Object.assign(track, { instructor, coordinator });
    }

    if (!track) {
      return NextResponse.json({ error: "Track not found" }, { status: 400 });
    }

    // Permission check
    const allowedRoles = ["manager", "ceo"];
    const isTrackInstructor =
      session.user.role === "instructor" &&
      track.instructorId === session.user.id;
    const isTrackCoordinator =
      session.user.role === "coordinator" &&
      track.coordinatorId === session.user.id;

    if (
      !allowedRoles.includes(session.user.role) &&
      !isTrackInstructor &&
      !isTrackCoordinator
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Use track's instructor if no instructorId provided
    const sessionInstructorId = instructorId || track.instructorId;

    // Verify instructor if provided
    if (instructorId && instructorId !== track.instructorId) {
      const [instructor] = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.id, instructorId));

      if (!instructor || instructor.role !== "instructor") {
        return NextResponse.json(
          { error: "Invalid instructor" },
          { status: 400 }
        );
      }
    }

    // Validate date format
    const sessionDate = new Date(date);
    if (isNaN(sessionDate.getTime())) {
      return NextResponse.json(
        { error: "Invalid date format" },
        { status: 400 }
      );
    }

    // Validate time format (HH:mm)
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
      return NextResponse.json(
        { error: "Invalid time format. Use HH:mm format" },
        { status: 400 }
      );
    }

    // Check for time conflicts
    const conflictingSessions = await db
      .select()
      .from(schema.liveSessions)
      .where(
        and(
          eq(schema.liveSessions.trackId, trackId),
          eq(schema.liveSessions.date, sessionDate),
          or(
            // Case 1: existing session starts before new start and ends after new start
            and(
              sql`${schema.liveSessions.startTime} <= ${startTime}`,
              sql`${schema.liveSessions.endTime} > ${startTime}`
            ),
            // Case 2: existing session starts before new end and ends after new end  
            and(
              sql`${schema.liveSessions.startTime} < ${endTime}`,
              sql`${schema.liveSessions.endTime} >= ${endTime}`
            ),
            // Case 3: existing session is completely within new session
            and(
              sql`${schema.liveSessions.startTime} >= ${startTime}`,
              sql`${schema.liveSessions.endTime} <= ${endTime}`
            )
          )
        )
      );

    if (conflictingSessions.length > 0) {
      // Map to minimal conflict info to help frontend show details
      const conflicts = conflictingSessions.map((s) => ({
        id: s.id,
        title: s.title,
        date: s.date.toISOString().split("T")[0],
        startTime: s.startTime,
        endTime: s.endTime,
      }));

      return NextResponse.json(
        { error: "Time conflict with existing session", conflicts },
        { status: 400 }
      );
    }

    const [newSessionId] = await db
      .insert(schema.liveSessions)
      .values({
        title,
        description,
        trackId,
        instructorId: sessionInstructorId,
        date: sessionDate,
        startTime,
        endTime,
        externalLink: meetLink,
        materials,
        notes,
        status: "SCHEDULED",
      })
      .$returningId();

    // Fetch created session with relations
    const [newSession] = await db
      .select()
      .from(schema.liveSessions)
      .where(eq(schema.liveSessions.id, newSessionId.id));

    const [sessionTrack] = await db
      .select()
      .from(schema.tracks)
      .where(eq(schema.tracks.id, newSession.trackId));

    const [sessionGrade] = sessionTrack?.gradeId
      ? await db
          .select({ id: schema.grades.id, name: schema.grades.name })
          .from(schema.grades)
          .where(eq(schema.grades.id, sessionTrack.gradeId))
      : [null];

    const [sessionInstructor] = await db
      .select({
        id: schema.users.id,
        name: schema.users.name,
        email: schema.users.email,
      })
      .from(schema.users)
      .where(eq(schema.users.id, newSession.instructorId));

    const sessionWithRelations = {
      ...newSession,
      track: sessionTrack ? { ...sessionTrack, grade: sessionGrade } : null,
      instructor: sessionInstructor,
      _count: { attendances: 0 },
    };

    // Link bookings to session if bookingIds provided
    if (bookingIds && Array.isArray(bookingIds) && bookingIds.length > 0) {
      await db
        .update(schema.sessionBookings)
        .set({
          sessionId: newSession.id,
          status: "confirmed",
        })
        .where(
          and(
            inArray(schema.sessionBookings.id, bookingIds),
            isNull(schema.sessionBookings.sessionId)
          )
        );
    }

    return NextResponse.json({ session: sessionWithRelations }, { status: 201 });
  } catch (error) {
    console.error("Error creating session:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

