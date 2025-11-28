import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db, schema, eq, and, count, desc } from "@/lib/db";

// GET /api/tracks/[id] - Get a specific track
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Await params in Next.js 15
    const { id } = await params;

    const [track] = await db
      .select()
      .from(schema.tracks)
      .where(eq(schema.tracks.id, id))
      .limit(1);

    if (!track) {
      return NextResponse.json({ error: "Track not found" }, { status: 404 });
    }

    // Fetch nested relations
    const [grade, instructor, coordinator, liveSessions, sessionCount, moduleCount] = await Promise.all([
      track.gradeId ? db.select({ id: schema.grades.id, name: schema.grades.name, description: schema.grades.description })
        .from(schema.grades)
        .where(eq(schema.grades.id, track.gradeId))
        .limit(1)
        .then(r => r[0] || null) : Promise.resolve(null),
      track.instructorId ? db.select({ id: schema.users.id, name: schema.users.name, email: schema.users.email })
        .from(schema.users)
        .where(eq(schema.users.id, track.instructorId))
        .limit(1)
        .then(r => r[0] || null) : Promise.resolve(null),
      track.coordinatorId ? db.select({ id: schema.users.id, name: schema.users.name, email: schema.users.email })
        .from(schema.users)
        .where(eq(schema.users.id, track.coordinatorId))
        .limit(1)
        .then(r => r[0] || null) : Promise.resolve(null),
      db.select()
        .from(schema.liveSessions)
        .where(eq(schema.liveSessions.trackId, id))
        .orderBy(schema.liveSessions.date),
      db.select({ count: count() })
        .from(schema.liveSessions)
        .where(eq(schema.liveSessions.trackId, id))
        .then(r => r[0].count),
      db.select({ count: count() })
        .from(schema.modules)
        .where(eq(schema.modules.trackId, id))
        .then(r => r[0].count)
    ]);

    // Fetch instructor and attendance counts for each session
    const liveSessionsWithDetails = await Promise.all(
      liveSessions.map(async (session: any) => {
        const [sessionInstructor, attendanceCount] = await Promise.all([
          session.instructorId ? db.select({ id: schema.users.id, name: schema.users.name })
            .from(schema.users)
            .where(eq(schema.users.id, session.instructorId))
            .limit(1)
            .then(r => r[0] || null) : Promise.resolve(null),
          db.select({ count: count() })
            .from(schema.sessionAttendances)
            .where(eq(schema.sessionAttendances.sessionId, session.id))
            .then(r => r[0].count)
        ]);
        return { ...session, instructor: sessionInstructor, _count: { attendances: attendanceCount } };
      })
    );

    const trackWithRelations = {
      ...track,
      grade,
      instructor,
      coordinator,
      liveSessions: liveSessionsWithDetails,
      _count: { liveSessions: sessionCount, modules: moduleCount }
    };

    // Permission checks based on role
    const userRole = session.user.role;
    const userId = session.user.id;

    // Students can only view tracks in their assigned grade
    if (userRole === "student") {
      const [user] = await db
        .select({ gradeId: schema.users.gradeId })
        .from(schema.users)
        .where(eq(schema.users.id, userId))
        .limit(1);

      if (!user?.gradeId || user.gradeId !== trackWithRelations.gradeId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    // Instructors can only view their own tracks
    if (userRole === "instructor" && trackWithRelations.instructorId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Coordinators can only view tracks they coordinate
    if (userRole === "coordinator" && trackWithRelations.coordinatorId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ track: trackWithRelations });
  } catch (error) {
    console.error("Error fetching track:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/tracks/[id] - Update a specific track
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only manager and CEO can update tracks
    if (!["manager", "ceo"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { name, description, instructorId, coordinatorId, order, isActive } =
      body;

    // Await params in Next.js 15
    const { id } = await params;

    // Check if track exists
    const [existingTrack] = await db
      .select()
      .from(schema.tracks)
      .where(eq(schema.tracks.id, id))
      .limit(1);

    if (!existingTrack) {
      return NextResponse.json({ error: "Track not found" }, { status: 404 });
    }

    // Validation
    if (name && typeof name !== "string") {
      return NextResponse.json(
        { error: "Invalid track name" },
        { status: 400 }
      );
    }

    // Verify instructor if provided
    if (instructorId) {
      const [instructor] = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.id, instructorId))
        .limit(1);

      if (!instructor || instructor.role !== "instructor") {
        return NextResponse.json(
          { error: "Invalid instructor" },
          { status: 400 }
        );
      }
    }

    // Verify coordinator if provided
    if (coordinatorId) {
      const [coordinator] = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.id, coordinatorId))
        .limit(1);

      if (!coordinator || coordinator.role !== "coordinator") {
        return NextResponse.json(
          { error: "Invalid coordinator" },
          { status: 400 }
        );
      }
    }

    // Update data object
    const updateData: {
      name?: string;
      description?: string | null;
      instructorId?: string;
      coordinatorId?: string;
      order?: number | null;
      isActive?: boolean;
    } = {};

    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (instructorId !== undefined) updateData.instructorId = instructorId;
    if (coordinatorId !== undefined) updateData.coordinatorId = coordinatorId;
    if (order !== undefined) updateData.order = order;
    if (isActive !== undefined) updateData.isActive = isActive;

    await db
      .update(schema.tracks)
      .set(updateData)
      .where(eq(schema.tracks.id, id));

    // Fetch updated track with relations
    const [track] = await db
      .select()
      .from(schema.tracks)
      .where(eq(schema.tracks.id, id))
      .limit(1);

    const [grade, instructor, coordinator, sessionCount] = await Promise.all([
      track!.gradeId ? db.select({ id: schema.grades.id, name: schema.grades.name, description: schema.grades.description })
        .from(schema.grades)
        .where(eq(schema.grades.id, track!.gradeId))
        .limit(1)
        .then(r => r[0] || null) : Promise.resolve(null),
      track!.instructorId ? db.select({ id: schema.users.id, name: schema.users.name, email: schema.users.email })
        .from(schema.users)
        .where(eq(schema.users.id, track!.instructorId))
        .limit(1)
        .then(r => r[0] || null) : Promise.resolve(null),
      track!.coordinatorId ? db.select({ id: schema.users.id, name: schema.users.name, email: schema.users.email })
        .from(schema.users)
        .where(eq(schema.users.id, track!.coordinatorId))
        .limit(1)
        .then(r => r[0] || null) : Promise.resolve(null),
      db.select({ count: count() })
        .from(schema.liveSessions)
        .where(eq(schema.liveSessions.trackId, id))
        .then(r => r[0].count)
    ]);

    const trackWithRelations = {
      ...track,
      grade,
      instructor,
      coordinator,
      _count: { liveSessions: sessionCount }
    };

    return NextResponse.json({ track: trackWithRelations });
  } catch (error) {
    console.error("Error updating track:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/tracks/[id] - Delete a specific track
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only manager and CEO can delete tracks
    if (!["manager", "ceo"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Await params in Next.js 15
    const { id } = await params;

    // Check if track exists
    const [existingTrack] = await db
      .select()
      .from(schema.tracks)
      .where(eq(schema.tracks.id, id))
      .limit(1);

    if (!existingTrack) {
      return NextResponse.json({ error: "Track not found" }, { status: 404 });
    }

    // Check if track has live sessions
    const sessionCount = await db
      .select({ count: count() })
      .from(schema.liveSessions)
      .where(eq(schema.liveSessions.trackId, id))
      .then(r => r[0].count);

    if (sessionCount > 0) {
      return NextResponse.json(
        { error: "Cannot delete track with existing sessions" },
        { status: 400 }
      );
    }

    await db
      .delete(schema.tracks)
      .where(eq(schema.tracks.id, id));

    return NextResponse.json({ message: "Track deleted successfully" });
  } catch (error) {
    console.error("Error deleting track:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
