import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

import { db, schema, eq, and, or, desc, asc, count, sql, isNull } from "@/lib/db";
import {
  createSuccessResponse,
  ErrorResponses,
  withDatabaseErrorHandling,
} from "@/lib/api-response";

// GET /api/tracks - Get tracks (with optional grade filter)
export async function GET(request: NextRequest) {
  const result = await withDatabaseErrorHandling(async () => {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user) {
      return ErrorResponses.unauthorized();
    }

    // Allow manager, coordinator, instructor, CEO, and students to view tracks
    // Students need this to see available tracks for booking sessions
    const allowedRoles = ["manager", "coordinator", "instructor", "ceo", "student"];
    if (!allowedRoles.includes(session.user.role)) {
      return ErrorResponses.forbidden();
    }

    const { searchParams } = new URL(request.url);
    const gradeId = searchParams.get("gradeId");

    // Build where clause
    const whereClause: {
      gradeId?: string;
      instructorId?: string;
      coordinatorId?: string;
    } = {};
    if (gradeId) {
      whereClause.gradeId = gradeId;
    }

    // For instructors, only show their own tracks
    if (session.user.role === "instructor") {
      whereClause.instructorId = session.user.id;
    }

    // For coordinators, only show tracks they coordinate
    if (session.user.role === "coordinator") {
      whereClause.coordinatorId = session.user.id;
    }

    // For students, only show tracks from their assigned grade
    if (session.user.role === "student") {
      const [student] = await db
        .select({ gradeId: schema.users.gradeId })
        .from(schema.users)
        .where(eq(schema.users.id, session.user.id));
      if (student?.gradeId) {
        whereClause.gradeId = student.gradeId;
      }
    }

    // Build Drizzle where conditions
    const conditions = [];
    if (whereClause.gradeId) {
      conditions.push(eq(schema.tracks.gradeId, whereClause.gradeId));
    }
    if (whereClause.instructorId) {
      conditions.push(eq(schema.tracks.instructorId, whereClause.instructorId));
    }
    if (whereClause.coordinatorId) {
      conditions.push(eq(schema.tracks.coordinatorId, whereClause.coordinatorId));
    }

    const tracksRaw = await db
      .select()
      .from(schema.tracks)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(asc(schema.tracks.order));

    // Manually fetch relations
    const tracks = await Promise.all(
      tracksRaw.map(async (track) => {
        const [grade] = track.gradeId
          ? await db
              .select({
                id: schema.grades.id,
                name: schema.grades.name,
                description: schema.grades.description,
              })
              .from(schema.grades)
              .where(eq(schema.grades.id, track.gradeId))
          : [null];

        const [instructor] = track.instructorId
          ? await db
              .select({
                id: schema.users.id,
                name: schema.users.name,
                email: schema.users.email,
              })
              .from(schema.users)
              .where(eq(schema.users.id, track.instructorId))
          : [null];

        const [coordinator] = track.coordinatorId
          ? await db
              .select({
                id: schema.users.id,
                name: schema.users.name,
                email: schema.users.email,
              })
              .from(schema.users)
              .where(eq(schema.users.id, track.coordinatorId))
          : [null];

        const liveSessions = await db
          .select({
            id: schema.liveSessions.id,
            title: schema.liveSessions.title,
            date: schema.liveSessions.date,
            startTime: schema.liveSessions.startTime,
            endTime: schema.liveSessions.endTime,
            status: schema.liveSessions.status,
          })
          .from(schema.liveSessions)
          .where(eq(schema.liveSessions.trackId, track.id))
          .orderBy(asc(schema.liveSessions.date));

        return {
          ...track,
          grade,
          instructor,
          coordinator,
          liveSessions,
          _count: { liveSessions: liveSessions.length },
        };
      })
    );

    return createSuccessResponse(tracks, "تم استرداد المسارات بنجاح");
  });

  return result instanceof NextResponse ? result : result;
}

// POST /api/tracks - Create a new track (Manager only)
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only manager, coordinator, and CEO can create tracks
    if (!["manager", "coordinator", "ceo"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { name, description, gradeId, instructorId, coordinatorId, order } =
      body;

    // Validation
    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { error: "Track name is required" },
        { status: 400 }
      );
    }

    if (!gradeId) {
      return NextResponse.json(
        { error: "Grade ID is required" },
        { status: 400 }
      );
    }

    if (!instructorId) {
      return NextResponse.json(
        { error: "Instructor ID is required" },
        { status: 400 }
      );
    }

    // Auto-assign coordinator if not provided and current user is coordinator
    let finalCoordinatorId = coordinatorId;
    if (!finalCoordinatorId && session.user.role === "coordinator") {
      finalCoordinatorId = session.user.id;
    }

    if (!finalCoordinatorId) {
      return NextResponse.json(
        { error: "Coordinator ID is required" },
        { status: 400 }
      );
    }

    // Verify grade exists
    const [grade] = await db
      .select()
      .from(schema.grades)
      .where(eq(schema.grades.id, gradeId));

    if (!grade) {
      return NextResponse.json({ error: "Grade not found" }, { status: 400 });
    }

    // Verify instructor exists and has instructor role
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

    // Verify coordinator exists and has coordinator role
    const [coordinator] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, finalCoordinatorId));

    if (!coordinator || coordinator.role !== "coordinator") {
      return NextResponse.json(
        { error: "Invalid coordinator" },
        { status: 400 }
      );
    }

    // If no order provided, set it to the next available order within the grade
    let trackOrder = order;
    if (!trackOrder) {
      const [lastTrack] = await db
        .select()
        .from(schema.tracks)
        .where(eq(schema.tracks.gradeId, gradeId))
        .orderBy(desc(schema.tracks.order))
        .limit(1);
      trackOrder = (lastTrack?.order || 0) + 1;
    }

    const [newTrackId] = await db
      .insert(schema.tracks)
      .values({
        name,
        description,
        gradeId,
        instructorId,
        coordinatorId: finalCoordinatorId,
        order: trackOrder,
        isActive: true,
      })
      .$returningId();

    // Fetch created track with relations
    const [newTrack] = await db
      .select()
      .from(schema.tracks)
      .where(eq(schema.tracks.id, newTrackId.id));

    const [trackGrade] = await db
      .select({
        id: schema.grades.id,
        name: schema.grades.name,
        description: schema.grades.description,
      })
      .from(schema.grades)
      .where(eq(schema.grades.id, newTrack.gradeId));

    const [trackInstructor] = await db
      .select({
        id: schema.users.id,
        name: schema.users.name,
        email: schema.users.email,
      })
      .from(schema.users)
      .where(eq(schema.users.id, newTrack.instructorId));

    const [trackCoordinator] = await db
      .select({
        id: schema.users.id,
        name: schema.users.name,
        email: schema.users.email,
      })
      .from(schema.users)
      .where(eq(schema.users.id, newTrack.coordinatorId));

    const track = {
      ...newTrack,
      grade: trackGrade,
      instructor: trackInstructor,
      coordinator: trackCoordinator,
      _count: { liveSessions: 0 },
    };

    return NextResponse.json({ track }, { status: 201 });
  } catch (error) {
    console.error("Error creating track:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

