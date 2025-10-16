import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";
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
    const session = await getServerSession(authOptions);

    if (!session) {
      return ErrorResponses.unauthorized();
    }

    const { id } = await params;

    const liveSession = await prisma.liveSession.findUnique({
      where: { id },
      include: {
        track: {
          include: {
            grade: {
              select: { id: true, name: true },
            },
            coordinator: {
              select: { id: true, name: true, email: true },
            },
          },
        },
        instructor: {
          select: { id: true, name: true, email: true },
        },
        attendances: {
          include: {
            student: {
              select: { id: true, name: true, email: true },
            },
          },
          orderBy: { student: { name: "asc" } },
        },
        _count: {
          select: { attendances: true },
        },
      },
    });

    if (!liveSession) {
      return ErrorResponses.notFound("الجلسة");
    }

    // Permission check
    const allowedRoles = ["manager", "ceo"];
    const isInstructor =
      session.user.role === "instructor" &&
      liveSession.instructorId === session.user.id;
    const isCoordinator =
      session.user.role === "coordinator" &&
      liveSession.track.coordinator.id === session.user.id;

    // For students, check if they're in the right grade
    let isStudentInGrade = false;
    if (session.user.role === "student") {
      const student = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { gradeId: true },
      });
      isStudentInGrade = student?.gradeId === liveSession.track.grade.id;
    }

    if (
      !allowedRoles.includes(session.user.role) &&
      !isInstructor &&
      !isCoordinator &&
      !isStudentInGrade
    ) {
      return ErrorResponses.forbidden();
    }

    return createSuccessResponse(liveSession, "تم استرداد الجلسة بنجاح");
  });

  return result instanceof NextResponse ? result : result;
}

// PUT /api/sessions/[id] - Update a specific session
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const result = await withDatabaseErrorHandling(async () => {
    const session = await getServerSession(authOptions);

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
      materials,
      notes,
      status,
    } = body;

    // Check if session exists
    const existingSession = await prisma.liveSession.findUnique({
      where: { id },
      include: {
        track: {
          include: {
            coordinator: true,
          },
        },
      },
    });

    if (!existingSession) {
      return ErrorResponses.notFound("الجلسة");
    }

    // Permission check
    const allowedRoles = ["manager", "ceo"];
    const isInstructor =
      session.user.role === "instructor" &&
      existingSession.instructorId === session.user.id;
    const isCoordinator =
      session.user.role === "coordinator" &&
      existingSession.track.coordinator.id === session.user.id;

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

    // Check for time conflicts if date/time is being updated
    if (date || startTime || endTime) {
      const checkDate = date ? new Date(date) : existingSession.date;
      const checkStartTime = startTime || existingSession.startTime;
      const checkEndTime = endTime || existingSession.endTime;

      const conflictingSessions = await prisma.liveSession.findMany({
        where: {
          id: { not: id }, // Exclude current session
          trackId: existingSession.trackId,
          date: checkDate,
          OR: [
            {
              AND: [
                { startTime: { lte: checkStartTime } },
                { endTime: { gt: checkStartTime } },
              ],
            },
            {
              AND: [
                { startTime: { lt: checkEndTime } },
                { endTime: { gte: checkEndTime } },
              ],
            },
            {
              AND: [
                { startTime: { gte: checkStartTime } },
                { endTime: { lte: checkEndTime } },
              ],
            },
          ],
        },
      });

      if (conflictingSessions.length > 0) {
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
      meetLink?: string | null;
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
    if (meetLink !== undefined) updateData.meetLink = meetLink;
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

    const updatedSession = await prisma.liveSession.update({
      where: { id },
      data: updateData,
      include: {
        track: {
          include: {
            grade: {
              select: { id: true, name: true },
            },
          },
        },
        instructor: {
          select: { id: true, name: true, email: true },
        },
        _count: {
          select: { attendances: true },
        },
      },
    });

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
    const session = await getServerSession(authOptions);

    if (!session) {
      return ErrorResponses.unauthorized();
    }

    const { id } = await params;

    const body = await request.json();
    const { meetLink, externalLink } = body;

    // Support both field names for compatibility
    const linkToUpdate = externalLink || meetLink;

    // Check if session exists
    const existingSession = await prisma.liveSession.findUnique({
      where: { id },
      include: {
        track: {
          include: {
            coordinator: true,
          },
        },
      },
    });

    if (!existingSession) {
      return ErrorResponses.notFound("الجلسة");
    }

    // Permission check - Only instructor of the session can update external link
    if (
      session.user.role !== "instructor" ||
      existingSession.instructorId !== session.user.id
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
      existingSession.status,
      !!(existingSession.date && existingSession.startTime)
    );

    // Update external link and status
    const updatedSession = await prisma.liveSession.update({
      where: { id },
      data: {
        externalLink: linkToUpdate?.trim() || null,
        status: newStatus as
          | "DRAFT"
          | "SCHEDULED"
          | "READY"
          | "ACTIVE"
          | "PAUSED"
          | "COMPLETED"
          | "CANCELLED",
      },
      include: {
        track: {
          include: {
            grade: {
              select: { id: true, name: true },
            },
          },
        },
        instructor: {
          select: { id: true, name: true, email: true },
        },
        _count: {
          select: { attendances: true },
        },
      },
    });

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
    const session = await getServerSession(authOptions);

    if (!session) {
      return ErrorResponses.unauthorized();
    }

    const { id } = await params;

    // Check if session exists
    const existingSession = await prisma.liveSession.findUnique({
      where: { id },
      include: {
        track: {
          include: {
            coordinator: true,
          },
        },
        _count: {
          select: { attendances: true },
        },
      },
    });

    if (!existingSession) {
      return ErrorResponses.notFound("الجلسة");
    }

    // Permission check
    const allowedRoles = ["manager", "ceo"];
    const isInstructor =
      session.user.role === "instructor" &&
      existingSession.instructorId === session.user.id;
    const isCoordinator =
      session.user.role === "coordinator" &&
      existingSession.track.coordinator.id === session.user.id;

    if (
      !allowedRoles.includes(session.user.role) &&
      !isInstructor &&
      !isCoordinator
    ) {
      return ErrorResponses.forbidden();
    }

    // Check if session has attendances
    if (existingSession._count.attendances > 0) {
      return createErrorResponse("لا يمكن حذف جلسة مسجل بها حضور", 400);
    }

    await prisma.liveSession.delete({
      where: { id },
    });

    return createSuccessResponse(null, "تم حذف الجلسة بنجاح");
  });

  return result instanceof NextResponse ? result : result;
}
