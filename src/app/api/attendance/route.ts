import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

import { db, schema, eq, and, or, desc, asc, count, sql, isNull, inArray } from "@/lib/db";

// GET /api/attendance - Get attendance records
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("studentId");
    const sessionId = searchParams.get("sessionId");

    // Build where clause based on user role and filters
    interface WhereClause {
      studentId?: string;
      instructorId?: string;
      sessionId?: string | { in: string[] };
    }

    const whereClause: WhereClause = {};

    if (session.user.role === "student") {
      // Students can only see their own attendance
      whereClause.studentId = session.user.id;

      if (studentId && studentId !== session.user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    } else if (session.user.role === "instructor") {
      // Instructors can see attendance for their sessions
      const instructorSessions = await db
        .select({ id: schema.liveSessions.id })
        .from(schema.liveSessions)
        .where(eq(schema.liveSessions.instructorId, session.user.id));

      if (sessionId) {
        const isAuthorized = instructorSessions.some((s: any) => s.id === sessionId);
        if (!isAuthorized) {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
        whereClause.sessionId = sessionId;
      } else {
        whereClause.sessionId = {
          in: instructorSessions.map((s: any) => s.id),
        };
      }

      if (studentId) {
        whereClause.studentId = studentId;
      }
    } else if (["manager", "ceo", "coordinator"].includes(session.user.role)) {
      // Admin roles can see all attendance with filters
      if (studentId) {
        whereClause.studentId = studentId;
      }
      if (sessionId) {
        whereClause.sessionId = sessionId;
      }
    } else {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Build Drizzle WHERE conditions
    const conditions = [];
    if (whereClause.studentId) conditions.push(eq(schema.sessionAttendances.studentId, whereClause.studentId));
    if (whereClause.sessionId) {
      if (typeof whereClause.sessionId === 'string') {
        conditions.push(eq(schema.sessionAttendances.sessionId, whereClause.sessionId));
      } else if (whereClause.sessionId.in) {
        conditions.push(inArray(schema.sessionAttendances.sessionId, whereClause.sessionId.in));
      }
    }

    const baseAttendances = await db
      .select()
      .from(schema.sessionAttendances)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(schema.sessionAttendances.createdAt))
      .catch(() => []);

    // Fetch relations
    const attendances = await Promise.all(
      baseAttendances.map(async (att: any) => {
        const [session, student] = await Promise.all([
          att.sessionId
            ? db
                .select()
                .from(schema.liveSessions)
                .where(eq(schema.liveSessions.id, att.sessionId))
                .then(async (r) => {
                  const sess = r[0];
                  if (!sess) return null;
                  const track = sess.trackId
                    ? await db
                        .select({ id: schema.tracks.id, name: schema.tracks.name })
                        .from(schema.tracks)
                        .where(eq(schema.tracks.id, sess.trackId))
                        .then((tr) => tr[0] || null)
                    : null;
                  return { ...sess, track };
                })
            : null,
          att.studentId
            ? db
                .select({ id: schema.users.id, name: schema.users.name, email: schema.users.email })
                .from(schema.users)
                .where(eq(schema.users.id, att.studentId))
                .then((r) => r[0] || null)
            : null,
        ]);
        return { ...att, session, student };
      })
    );

    return NextResponse.json({ attendances });
  } catch (error) {
    console.error("Error fetching attendance:", error);
    // Return empty array instead of error to prevent dashboard crashes
    return NextResponse.json({ attendances: [] });
  }
}

// POST /api/attendance - Create attendance record
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only instructors and admins can mark attendance
    if (
      !["instructor", "manager", "ceo", "coordinator"].includes(
        session.user.role
      )
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { sessionId, studentId, status, notes } = body;

    if (!sessionId || !studentId || !status) {
      return NextResponse.json(
        { error: "Missing required fields: sessionId, studentId, status" },
        { status: 400 }
      );
    }

    // Verify the session exists
    const [liveSession] = await db
      .select({ id: schema.liveSessions.id, instructorId: schema.liveSessions.instructorId })
      .from(schema.liveSessions)
      .where(eq(schema.liveSessions.id, sessionId))
      .limit(1);

    if (!liveSession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // If instructor, verify they own this session
    if (
      session.user.role === "instructor" &&
      liveSession.instructorId !== session.user.id
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Create or update attendance record
    const [existing] = await db
      .select({ id: schema.sessionAttendances.id })
      .from(schema.sessionAttendances)
      .where(
        and(
          eq(schema.sessionAttendances.sessionId, sessionId),
          eq(schema.sessionAttendances.studentId, studentId)
        )
      )
      .limit(1);

    if (existing) {
      await db
        .update(schema.sessionAttendances)
        .set({
          status,
          notes,
          updatedAt: new Date(),
        })
        .where(eq(schema.sessionAttendances.id, existing.id));
    } else {
      await db.insert(schema.sessionAttendances).values({
        sessionId,
        studentId,
        status,
        notes,
      });
    }

    // Fetch the attendance record with relations
    const [attendance] = await db
      .select({
        id: schema.sessionAttendances.id,
        sessionId: schema.sessionAttendances.sessionId,
        studentId: schema.sessionAttendances.studentId,
        status: schema.sessionAttendances.status,
        notes: schema.sessionAttendances.notes,
        createdAt: schema.sessionAttendances.createdAt,
        updatedAt: schema.sessionAttendances.updatedAt,
      })
      .from(schema.sessionAttendances)
      .where(
        and(
          eq(schema.sessionAttendances.sessionId, sessionId),
          eq(schema.sessionAttendances.studentId, studentId)
        )
      )
      .limit(1);

    const [liveSessionData] = attendance
      ? await db
          .select({
            id: schema.liveSessions.id,
            title: schema.liveSessions.title,
            trackId: schema.liveSessions.trackId,
          })
          .from(schema.liveSessions)
          .where(eq(schema.liveSessions.id, attendance.sessionId))
          .limit(1)
      : [null];

    const [track] = liveSessionData
      ? await db
          .select({
            id: schema.tracks.id,
            name: schema.tracks.name,
          })
          .from(schema.tracks)
          .where(eq(schema.tracks.id, liveSessionData.trackId))
          .limit(1)
      : [null];

    const [student] = attendance
      ? await db
          .select({
            id: schema.users.id,
            name: schema.users.name,
            email: schema.users.email,
          })
          .from(schema.users)
          .where(eq(schema.users.id, attendance.studentId))
          .limit(1)
      : [null];

    const attendanceWithRelations: any = {
      ...attendance,
      session: liveSessionData
        ? {
            ...liveSessionData,
            track,
          }
        : null,
      student,
    };

    return NextResponse.json({ attendance: attendanceWithRelations }, { status: 201 });
  } catch (error) {
    console.error("Error creating attendance:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

