import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db, schema, eq, and, or, gte, lt, lte, gt } from "@/lib/db";
import {
  validateExternalMeetingLink,
  getSessionStatusFromLink,
} from "@/lib/sessionValidation";
import {
  createSuccessResponse,
  ErrorResponses,
  withDatabaseErrorHandling,
  createErrorResponse,
} from "@/lib/api-response";

// GET /api/sessions/[id] - Get a specific session
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const result = await withDatabaseErrorHandling(async () => {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session) {
      return ErrorResponses.unauthorized();
    }

    const { id } = await params;

    const [liveSession] = await db
      .select()
      .from(schema.liveSessions)
      .where(eq(schema.liveSessions.id, id))
      .limit(1);

    if (!liveSession) {
      return ErrorResponses.notFound("الجلسة");
    }

    // Fetch track with grade and coordinator
    const [track] = await db
      .select()
      .from(schema.tracks)
      .where(eq(schema.tracks.id, liveSession.trackId))
      .limit(1);

    const [grade, coordinator] = await Promise.all([
      track!.gradeId ? db.select({ id: schema.grades.id, name: schema.grades.name })
        .from(schema.grades)
        .where(eq(schema.grades.id, track!.gradeId))
        .limit(1)
        .then(r => r[0] || null) : Promise.resolve(null),
      track!.coordinatorId ? db.select({ id: schema.users.id, name: schema.users.name, email: schema.users.email })
        .from(schema.users)
        .where(eq(schema.users.id, track!.coordinatorId))
        .limit(1)
        .then(r => r[0] || null) : Promise.resolve(null)
    ]);

    // Fetch instructor
    const instructor = liveSession.instructorId ? await db
      .select({ id: schema.users.id, name: schema.users.name, email: schema.users.email })
      .from(schema.users)
      .where(eq(schema.users.id, liveSession.instructorId))
      .limit(1)
      .then(r => r[0] || null) : null;

    // Fetch attendances with students
    const attendances = await db
      .select()
      .from(schema.sessionAttendances)
      .where(eq(schema.sessionAttendances.sessionId, id));

    const attendancesWithStudents = await Promise.all(
      attendances.map(async (att: any) => {
        const [student] = await db
          .select({ id: schema.users.id, name: schema.users.name, email: schema.users.email })
          .from(schema.users)
          .where(eq(schema.users.id, att.studentId))
          .limit(1);
        return { ...att, student: student || null };
      })
    );

    // Sort by student name
    attendancesWithStudents.sort((a, b) => {
      if (!a.student || !b.student) return 0;
      return (a.student.name || "").localeCompare(b.student.name || "");
    });

    const liveSessionWithRelations = {
      ...liveSession,
      track: {
        ...track,
        grade,
        coordinator
      },
      instructor,
      attendances: attendancesWithStudents,
      _count: {
        attendances: attendancesWithStudents.length
      }
    };

    // Permission check
    const allowedRoles = ["manager", "ceo"];
    const isInstructor =
      session.user.role === "instructor" &&
      liveSessionWithRelations.instructorId === session.user.id;
    const isCoordinator =
      session.user.role === "coordinator" &&
      liveSessionWithRelations.track.coordinator?.id === session.user.id;

    // For students, check if they're in the right grade
    let isStudentInGrade = false;
    if (session.user.role === "student") {
      const [student] = await db
        .select({ gradeId: schema.users.gradeId })
        .from(schema.users)
        .where(eq(schema.users.id, session.user.id))
        .limit(1);
      isStudentInGrade = student?.gradeId === liveSessionWithRelations.track.grade?.id;
    }

    if (
      !allowedRoles.includes(session.user.role) &&
      !isInstructor &&
      !isCoordinator &&
      !isStudentInGrade
    ) {
      return ErrorResponses.forbidden();
    }

    return createSuccessResponse(liveSessionWithRelations, "تم استرداد الجلسة بنجاح");
  });

  return result instanceof NextResponse ? result : result;
}

// PUT /api/sessions/[id] - Update a specific session
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const result = await withDatabaseErrorHandling(async () => {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session) {
      return ErrorResponses.unauthorized();
    }

    const { id } = await params;

    const body = await request.json();
    const {
      title,
      description,
      date,
      startTime,
      endTime,
      meetLink,
      externalLink,
      trackId,
      instructorId,
      materials,
      notes,
      status,
    } = body;

    // Support both meetLink and externalLink for compatibility
    const linkToUpdate = externalLink || meetLink;

    // Check if session exists
    const [existingSession] = await db
      .select()
      .from(schema.liveSessions)
      .where(eq(schema.liveSessions.id, id))
      .limit(1);

    if (!existingSession) {
      return ErrorResponses.notFound("الجلسة");
    }

    // Fetch track with coordinator
    const [track] = await db
      .select()
      .from(schema.tracks)
      .where(eq(schema.tracks.id, existingSession.trackId))
      .limit(1);

    const coordinator = track!.coordinatorId ? await db
      .select({ id: schema.users.id })
      .from(schema.users)
      .where(eq(schema.users.id, track!.coordinatorId))
      .limit(1)
      .then(r => r[0] || null) : null;

    const existingSessionWithRelations = {
      ...existingSession,
      track: {
        ...track,
        coordinator
      }
    };

    // Permission check
    const allowedRoles = ["manager", "ceo"];
    const isInstructor =
      session.user.role === "instructor" &&
      existingSessionWithRelations.instructorId === session.user.id;
    const isCoordinator =
      session.user.role === "coordinator" &&
      existingSessionWithRelations.track.coordinator?.id === session.user.id;

    if (
      !allowedRoles.includes(session.user.role) &&
      !isInstructor &&
      !isCoordinator
    ) {
      return ErrorResponses.forbidden();
    }

    // Validation
    if (title && typeof title !== "string") {
      return createErrorResponse("عنوان الجلسة غير صحيح", 400);
    }

    // Validate trackId if changing track
    if (trackId && trackId !== existingSessionWithRelations.trackId) {
      const [newTrack] = await db
        .select()
        .from(schema.tracks)
        .where(eq(schema.tracks.id, trackId))
        .limit(1);

      if (!newTrack) {
        return createErrorResponse("المسار المحدد غير موجود", 400);
      }

      // Fetch instructor and coordinator for permission check
      const [newTrackInstructor, newTrackCoordinator] = await Promise.all([
        newTrack.instructorId ? db.select({ id: schema.users.id })
          .from(schema.users)
          .where(eq(schema.users.id, newTrack.instructorId))
          .limit(1)
          .then(r => r[0] || null) : Promise.resolve(null),
        newTrack.coordinatorId ? db.select({ id: schema.users.id })
          .from(schema.users)
          .where(eq(schema.users.id, newTrack.coordinatorId))
          .limit(1)
          .then(r => r[0] || null) : Promise.resolve(null)
      ]);

      const newTrackWithRelations = {
        ...newTrack,
        instructor: newTrackInstructor,
        coordinator: newTrackCoordinator
      };

      // Check permission for new track
      const canAccessNewTrack =
        allowedRoles.includes(session.user.role) ||
        (session.user.role === "coordinator" &&
          newTrackWithRelations.coordinatorId === session.user.id);

      if (!canAccessNewTrack) {
        return ErrorResponses.forbidden();
      }
    }

    // Validate instructorId if provided
    if (instructorId && instructorId !== existingSessionWithRelations.instructorId) {
      const [instructor] = await db
        .select({ id: schema.users.id, role: schema.users.role })
        .from(schema.users)
        .where(eq(schema.users.id, instructorId))
        .limit(1);

      if (!instructor || instructor.role !== "instructor") {
        return createErrorResponse("المعلم المحدد غير موجود", 400);
      }
    }

    // Validate date if provided
    if (date) {
      const sessionDate = new Date(date);
      if (isNaN(sessionDate.getTime())) {
        return createErrorResponse("تنسيق التاريخ غير صحيح", 400);
      }
    }

    // Validate time format if provided
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (startTime && !timeRegex.test(startTime)) {
      return createErrorResponse(
        "تنسيق وقت البداية غير صحيح. استخدم تنسيق HH:mm",
        400
      );
    }

    if (endTime && !timeRegex.test(endTime)) {
      return createErrorResponse(
        "تنسيق وقت النهاية غير صحيح. استخدم تنسيق HH:mm",
        400
      );
    }

    // Check for time conflicts if date/time/track is being updated
    if (date || startTime || endTime || trackId) {
      const checkDate = date ? new Date(date) : existingSessionWithRelations.date;
      const checkStartTime = startTime || existingSessionWithRelations.startTime;
      const checkEndTime = endTime || existingSessionWithRelations.endTime;
      const checkTrackId = trackId || existingSessionWithRelations.trackId;

      const conflictingSessions = await db
        .select({ id: schema.liveSessions.id })
        .from(schema.liveSessions)
        .where(
          and(
            eq(schema.liveSessions.trackId, checkTrackId),
            eq(schema.liveSessions.date, checkDate),
            or(
              and(
                lte(schema.liveSessions.startTime, checkStartTime),
                gt(schema.liveSessions.endTime, checkStartTime)
              ),
              and(
                lt(schema.liveSessions.startTime, checkEndTime),
                gte(schema.liveSessions.endTime, checkEndTime)
              ),
              and(
                gte(schema.liveSessions.startTime, checkStartTime),
                lte(schema.liveSessions.endTime, checkEndTime)
              )
            )
          )
        );

      // Filter out current session
      const conflicts = conflictingSessions.filter((s: any) => s.id !== id);

      if (conflicts.length > 0) {
        return createErrorResponse("تعارض زمني مع جلسة موجودة", 400);
      }
    }

    // Update data object
    const updateData: {
      title?: string;
      description?: string | null;
      date?: Date;
      startTime?: string;
      endTime?: string;
      trackId?: string;
      instructorId?: string;
      externalLink?: string | null;
      materials?: string | null;
      notes?: string | null;
      status?:
        | "DRAFT"
        | "SCHEDULED"
        | "READY"
        | "ACTIVE"
        | "PAUSED"
        | "COMPLETED"
        | "CANCELLED";
    } = {};

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (date !== undefined) updateData.date = new Date(date);
    if (startTime !== undefined) updateData.startTime = startTime;
    if (endTime !== undefined) updateData.endTime = endTime;

    // If trackId is being changed, automatically update instructorId to match the new track's instructor
    if (trackId !== undefined && trackId !== existingSessionWithRelations.trackId) {
      const [newTrack] = await db
        .select({ instructorId: schema.tracks.instructorId })
        .from(schema.tracks)
        .where(eq(schema.tracks.id, trackId))
        .limit(1);
      if (newTrack) {
        updateData.trackId = trackId;
        updateData.instructorId = newTrack.instructorId; // Auto-assign track's instructor
      }
    } else if (instructorId !== undefined) {
      // Only allow manual instructor change if track isn't changing
      updateData.instructorId = instructorId;
    }

    if (linkToUpdate !== undefined) updateData.externalLink = linkToUpdate;
    if (materials !== undefined) updateData.materials = materials;
    if (notes !== undefined) updateData.notes = notes;
    if (status !== undefined)
      updateData.status = status as
        | "DRAFT"
        | "SCHEDULED"
        | "READY"
        | "ACTIVE"
        | "PAUSED"
        | "COMPLETED"
        | "CANCELLED";

    await db
      .update(schema.liveSessions)
      .set(updateData)
      .where(eq(schema.liveSessions.id, id));

    // Fetch updated session with nested relations
    const [updatedLiveSession] = await db
      .select()
      .from(schema.liveSessions)
      .where(eq(schema.liveSessions.id, id))
      .limit(1);

    const [updatedTrack] = await db
      .select()
      .from(schema.tracks)
      .where(eq(schema.tracks.id, updatedLiveSession!.trackId))
      .limit(1);

    const [updatedGrade, updatedInstructor] = await Promise.all([
      updatedTrack!.gradeId ? db.select({ id: schema.grades.id, name: schema.grades.name })
        .from(schema.grades)
        .where(eq(schema.grades.id, updatedTrack!.gradeId))
        .limit(1)
        .then(r => r[0] || null) : Promise.resolve(null),
      updatedLiveSession!.instructorId ? db.select({ id: schema.users.id, name: schema.users.name, email: schema.users.email })
        .from(schema.users)
        .where(eq(schema.users.id, updatedLiveSession!.instructorId))
        .limit(1)
        .then(r => r[0] || null) : Promise.resolve(null)
    ]);

    // Get attendance count
    const attendances = await db
      .select({ id: schema.sessionAttendances.id })
      .from(schema.sessionAttendances)
      .where(eq(schema.sessionAttendances.sessionId, id));

    const updatedSession = {
      ...updatedLiveSession,
      track: {
        ...updatedTrack,
        grade: updatedGrade
      },
      instructor: updatedInstructor,
      _count: {
        attendances: attendances.length
      }
    };

    return createSuccessResponse(updatedSession, "تم تحديث الجلسة بنجاح");
  });

  return result instanceof NextResponse ? result : result;
}

// PATCH /api/sessions/[id] - Partially update a session (for quick updates like meetLink)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const result = await withDatabaseErrorHandling(async () => {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session) {
      return ErrorResponses.unauthorized();
    }

    const { id } = await params;

    const body = await request.json();
    const { meetLink, externalLink } = body;

    // Support both field names for compatibility
    const linkToUpdate = externalLink || meetLink;

    // Check if session exists
    const [existingSession] = await db
      .select()
      .from(schema.liveSessions)
      .where(eq(schema.liveSessions.id, id))
      .limit(1);

    if (!existingSession) {
      return ErrorResponses.notFound("الجلسة");
    }

    // Fetch track with coordinator
    const [track] = await db
      .select()
      .from(schema.tracks)
      .where(eq(schema.tracks.id, existingSession.trackId))
      .limit(1);

    const coordinator = track!.coordinatorId ? await db
      .select({ id: schema.users.id })
      .from(schema.users)
      .where(eq(schema.users.id, track!.coordinatorId))
      .limit(1)
      .then(r => r[0] || null) : null;

    const existingSessionWithRelations = {
      ...existingSession,
      track: {
        ...track,
        coordinator
      }
    };

    // Permission check - Only instructor of the session can update external link
    if (
      session.user.role !== "instructor" ||
      existingSessionWithRelations.instructorId !== session.user.id
    ) {
      return ErrorResponses.forbidden();
    }

    // Use external link validation utility
    if (linkToUpdate !== undefined) {
      const validation = validateExternalMeetingLink(linkToUpdate);

      if (linkToUpdate && !validation.isValid) {
        return createErrorResponse(
          validation.error || "رابط الاجتماع الخارجي غير صحيح",
          400,
          { platform: validation.platform }
        );
      }
    }

    // Determine new session status based on external link
    const newStatus = getSessionStatusFromLink(
      linkToUpdate,
      existingSessionWithRelations.status,
      !!(existingSessionWithRelations.date && existingSessionWithRelations.startTime)
    );

    // Update external link and status
    await db
      .update(schema.liveSessions)
      .set({
        externalLink: linkToUpdate?.trim() || null,
        status: newStatus as
          | "DRAFT"
          | "SCHEDULED"
          | "READY"
          | "ACTIVE"
          | "PAUSED"
          | "COMPLETED"
          | "CANCELLED",
      })
      .where(eq(schema.liveSessions.id, id));

    // Fetch updated session with nested relations
    const [updatedLiveSession] = await db
      .select()
      .from(schema.liveSessions)
      .where(eq(schema.liveSessions.id, id))
      .limit(1);

    const [updatedTrack] = await db
      .select()
      .from(schema.tracks)
      .where(eq(schema.tracks.id, updatedLiveSession!.trackId))
      .limit(1);

    const [updatedGrade, updatedInstructor] = await Promise.all([
      updatedTrack!.gradeId ? db.select({ id: schema.grades.id, name: schema.grades.name })
        .from(schema.grades)
        .where(eq(schema.grades.id, updatedTrack!.gradeId))
        .limit(1)
        .then(r => r[0] || null) : Promise.resolve(null),
      updatedLiveSession!.instructorId ? db.select({ id: schema.users.id, name: schema.users.name, email: schema.users.email })
        .from(schema.users)
        .where(eq(schema.users.id, updatedLiveSession!.instructorId))
        .limit(1)
        .then(r => r[0] || null) : Promise.resolve(null)
    ]);

    // Get attendance count
    const attendances = await db
      .select({ id: schema.sessionAttendances.id })
      .from(schema.sessionAttendances)
      .where(eq(schema.sessionAttendances.sessionId, id));

    const updatedSession = {
      ...updatedLiveSession,
      track: {
        ...updatedTrack,
        grade: updatedGrade
      },
      instructor: updatedInstructor,
      _count: {
        attendances: attendances.length
      }
    };

    return createSuccessResponse(
      updatedSession,
      `تم تحديث رابط الجلسة بنجاح - الحالة الجديدة: ${newStatus}`
    );
  });

  return result instanceof NextResponse ? result : result;
}

// DELETE /api/sessions/[id] - Delete a specific session
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const result = await withDatabaseErrorHandling(async () => {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session) {
      return ErrorResponses.unauthorized();
    }

    const { id } = await params;

    // Check if session exists
    const [existingSession] = await db
      .select()
      .from(schema.liveSessions)
      .where(eq(schema.liveSessions.id, id))
      .limit(1);

    if (!existingSession) {
      return ErrorResponses.notFound("الجلسة");
    }

    // Fetch track with coordinator
    const [track] = await db
      .select()
      .from(schema.tracks)
      .where(eq(schema.tracks.id, existingSession.trackId))
      .limit(1);

    const coordinator = track!.coordinatorId ? await db
      .select({ id: schema.users.id })
      .from(schema.users)
      .where(eq(schema.users.id, track!.coordinatorId))
      .limit(1)
      .then(r => r[0] || null) : null;

    // Get attendance count
    const attendances = await db
      .select({ id: schema.sessionAttendances.id })
      .from(schema.sessionAttendances)
      .where(eq(schema.sessionAttendances.sessionId, id));

    const existingSessionWithRelations = {
      ...existingSession,
      track: {
        ...track,
        coordinator
      },
      _count: {
        attendances: attendances.length
      }
    };

    // Permission check
    const allowedRoles = ["manager", "ceo"];
    const isInstructor =
      session.user.role === "instructor" &&
      existingSessionWithRelations.instructorId === session.user.id;
    const isCoordinator =
      session.user.role === "coordinator" &&
      existingSessionWithRelations.track.coordinator?.id === session.user.id;

    if (
      !allowedRoles.includes(session.user.role) &&
      !isInstructor &&
      !isCoordinator
    ) {
      return ErrorResponses.forbidden();
    }

    // Check if session has attendances
    if (existingSessionWithRelations._count.attendances > 0) {
      return createErrorResponse("لا يمكن حذف جلسة مسجل بها حضور", 400);
    }

    await db
      .delete(schema.liveSessions)
      .where(eq(schema.liveSessions.id, id));

    return createSuccessResponse(null, "تم حذف الجلسة بنجاح");
  });

  return result instanceof NextResponse ? result : result;
}
