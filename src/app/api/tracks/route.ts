import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";
import {
  createSuccessResponse,
  ErrorResponses,
  withDatabaseErrorHandling,
} from "@/lib/api-response";

// GET /api/tracks - Get tracks (with optional grade filter)
export async function GET(request: NextRequest) {
  const result = await withDatabaseErrorHandling(async () => {
    const session = await getServerSession(authOptions);

    if (!session) {
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
      const student = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { gradeId: true },
      });
      if (student?.gradeId) {
        whereClause.gradeId = student.gradeId;
      }
    }

    const tracks = await prisma.track.findMany({
      where: whereClause,
      include: {
        grade: {
          select: { id: true, name: true, description: true },
        },
        instructor: {
          select: { id: true, name: true, email: true },
        },
        coordinator: {
          select: { id: true, name: true, email: true },
        },
        liveSessions: {
          select: {
            id: true,
            title: true,
            date: true,
            startTime: true,
            endTime: true,
            status: true,
          },
          orderBy: { date: "asc" },
        },
        _count: {
          select: { liveSessions: true },
        },
      },
      orderBy: [{ grade: { order: "asc" } }, { order: "asc" }],
    });

    return createSuccessResponse(tracks, "تم استرداد المسارات بنجاح");
  });

  return result instanceof NextResponse ? result : result;
}

// POST /api/tracks - Create a new track (Manager only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
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
    const grade = await prisma.grade.findUnique({
      where: { id: gradeId },
    });

    if (!grade) {
      return NextResponse.json({ error: "Grade not found" }, { status: 400 });
    }

    // Verify instructor exists and has instructor role
    const instructor = await prisma.user.findUnique({
      where: { id: instructorId },
    });

    if (!instructor || instructor.role !== "instructor") {
      return NextResponse.json(
        { error: "Invalid instructor" },
        { status: 400 }
      );
    }

    // Verify coordinator exists and has coordinator role
    const coordinator = await prisma.user.findUnique({
      where: { id: finalCoordinatorId },
    });

    if (!coordinator || coordinator.role !== "coordinator") {
      return NextResponse.json(
        { error: "Invalid coordinator" },
        { status: 400 }
      );
    }

    // If no order provided, set it to the next available order within the grade
    let trackOrder = order;
    if (!trackOrder) {
      const lastTrack = await prisma.track.findFirst({
        where: { gradeId },
        orderBy: { order: "desc" },
      });
      trackOrder = (lastTrack?.order || 0) + 1;
    }

    const track = await prisma.track.create({
      data: {
        name,
        description,
        gradeId,
        instructorId,
        coordinatorId: finalCoordinatorId,
        order: trackOrder,
        isActive: true,
      },
      include: {
        grade: {
          select: { id: true, name: true, description: true },
        },
        instructor: {
          select: { id: true, name: true, email: true },
        },
        coordinator: {
          select: { id: true, name: true, email: true },
        },
        _count: {
          select: { liveSessions: true },
        },
      },
    });

    return NextResponse.json({ track }, { status: 201 });
  } catch (error) {
    console.error("Error creating track:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
