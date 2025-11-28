import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

import { db, schema, eq, and, or, desc, asc, count, sql, isNull, inArray } from "@/lib/db";

// POST /api/sessions/manage - Create or update sessions
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only coordinators, managers, and CEOs can manage sessions
    if (!["coordinator", "manager", "ceo"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { action, sessionData } = body;

    if (action === "create") {
      const {
        title,
        description,
        date,
        startTime,
        endTime,
        trackId,
        instructorId,
      } = sessionData;

      // Validate required fields
      if (
        !title ||
        !date ||
        !startTime ||
        !endTime ||
        !trackId ||
        !instructorId
      ) {
        return NextResponse.json(
          { error: "Missing required fields" },
          { status: 400 }
        );
      }

      // Verify track exists
      const trackBase = await db
        .select()
        .from(schema.tracks)
        .where(eq(schema.tracks.id, trackId))
        .then((r) => r[0]);

      if (!trackBase) {
        return NextResponse.json({ error: "Track not found" }, { status: 404 });
      }

      // Fetch grade relation
      const grade = trackBase.gradeId
        ? await db
            .select()
            .from(schema.grades)
            .where(eq(schema.grades.id, trackBase.gradeId))
            .then((r) => r[0] || null)
        : null;
      
      const track = { ...trackBase, grade };

      // Verify instructor exists
      const instructor = await db
        .select()
        .from(schema.users)
        .where(and(eq(schema.users.id, instructorId), eq(schema.users.role, "instructor")))
        .then((r) => r[0]);

      if (!instructor) {
        return NextResponse.json(
          { error: "Instructor not found" },
          { status: 404 }
        );
      }

      // Check for scheduling conflicts
      const sessionDate = new Date(date);
      const conflicts = await db
        .select()
        .from(schema.liveSessions)
        .where(
          and(
            eq(schema.liveSessions.instructorId, instructorId),
            eq(schema.liveSessions.date, sessionDate),
            or(
              and(
                sql`${schema.liveSessions.startTime} <= ${startTime}`,
                sql`${schema.liveSessions.endTime} > ${startTime}`
              ),
              and(
                sql`${schema.liveSessions.startTime} < ${endTime}`,
                sql`${schema.liveSessions.endTime} >= ${endTime}`
              ),
              and(
                sql`${schema.liveSessions.startTime} >= ${startTime}`,
                sql`${schema.liveSessions.endTime} <= ${endTime}`
              )
            )
          )
        );

      if (conflicts.length > 0) {
        return NextResponse.json(
          { error: "Instructor has a scheduling conflict at this time" },
          { status: 409 }
        );
      }

      // Create the session
      const [sessionId] = await db
        .insert(schema.liveSessions)
        .values({
          title,
          description: description || "",
          date: sessionDate,
          startTime,
          endTime,
          trackId,
          instructorId,
          status: "SCHEDULED",
        })
        .$returningId();

      // Fetch the created session with relations
      const [createdSession, sessionTrack, sessionGrade, sessionInstructor] = await Promise.all([
        db.select().from(schema.liveSessions).where(eq(schema.liveSessions.id, sessionId.id)).then((r) => r[0]),
        db.select().from(schema.tracks).where(eq(schema.tracks.id, trackId)).then((r) => r[0]),
        db.select().from(schema.grades).where(eq(schema.grades.id, track.gradeId!)).then((r) => r[0] || null),
        db
          .select({ id: schema.users.id, name: schema.users.name, email: schema.users.email })
          .from(schema.users)
          .where(eq(schema.users.id, instructorId))
          .then((r) => r[0]),
      ]);

      const newSession = {
        ...createdSession,
        track: { ...sessionTrack, grade: sessionGrade },
        instructor: sessionInstructor,
      };

      return NextResponse.json(
        {
          session: newSession,
          message: "Session created successfully",
        },
        { status: 201 }
      );
    } else if (action === "update") {
      const { sessionId, ...updateData } = sessionData;

      if (!sessionId) {
        return NextResponse.json(
          { error: "Session ID is required for updates" },
          { status: 400 }
        );
      }

      // Verify session exists
      const existingSession = await db
        .select()
        .from(schema.liveSessions)
        .where(eq(schema.liveSessions.id, sessionId))
        .then((r) => r[0]);

      if (!existingSession) {
        return NextResponse.json(
          { error: "Session not found" },
          { status: 404 }
        );
      }

      // Update the session
      await db
        .update(schema.liveSessions)
        .set(updateData)
        .where(eq(schema.liveSessions.id, sessionId));

      // Fetch updated session with relations
      const [updated, sessionTrack, sessionInstructor] = await Promise.all([
        db.select().from(schema.liveSessions).where(eq(schema.liveSessions.id, sessionId)).then((r) => r[0]),
        db.select().from(schema.tracks).where(eq(schema.tracks.id, existingSession.trackId)).then((r) => r[0]),
        db
          .select({ id: schema.users.id, name: schema.users.name, email: schema.users.email })
          .from(schema.users)
          .where(eq(schema.users.id, existingSession.instructorId))
          .then((r) => r[0]),
      ]);

      // Fetch grade for track
      const sessionGrade = sessionTrack.gradeId
        ? await db
            .select()
            .from(schema.grades)
            .where(eq(schema.grades.id, sessionTrack.gradeId))
            .then((r) => r[0] || null)
        : null;

      const updatedSession = {
        ...updated,
        track: { ...sessionTrack, grade: sessionGrade },
        instructor: sessionInstructor,
      };

      return NextResponse.json({
        session: updatedSession,
        message: "Session updated successfully",
      });
    } else {
      return NextResponse.json(
        { error: "Invalid action. Use 'create' or 'update'" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error managing session:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/sessions/manage - Delete a session
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only coordinators, managers, and CEOs can delete sessions
    if (!["coordinator", "manager", "ceo"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    // Verify session exists
    const existingSession = await db
      .select()
      .from(schema.liveSessions)
      .where(eq(schema.liveSessions.id, sessionId))
      .then((r) => r[0]);

    if (!existingSession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // Check if session has already started
    const now = new Date();
    const sessionDateTime = new Date(
      `${existingSession.date}T${existingSession.startTime}`
    );

    if (sessionDateTime <= now && existingSession.status === "ACTIVE") {
      return NextResponse.json(
        { error: "Cannot delete an active session" },
        { status: 400 }
      );
    }

    // Delete related attendance records first
    await db
      .delete(schema.sessionAttendances)
      .where(eq(schema.sessionAttendances.sessionId, sessionId));

    // Delete the session
    await db
      .delete(schema.liveSessions)
      .where(eq(schema.liveSessions.id, sessionId));

    return NextResponse.json({
      message: "Session deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting session:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

