import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

// GET /api/tracks/[id] - Get a specific track
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Await params in Next.js 15
    const { id } = await params;

    const track = await prisma.track.findUnique({
      where: { id },
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
          include: {
            instructor: {
              select: { id: true, name: true },
            },
            _count: {
              select: { attendances: true },
            },
          },
          orderBy: { date: "asc" },
        },
        _count: {
          select: { liveSessions: true, modules: true },
        },
      },
    });

    if (!track) {
      return NextResponse.json({ error: "Track not found" }, { status: 404 });
    }

    // Permission checks based on role
    const userRole = session.user.role;
    const userId = session.user.id;

    // Students can only view tracks in their assigned grade
    if (userRole === "student") {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { gradeId: true },
      });

      if (!user?.gradeId || user.gradeId !== track.gradeId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    // Instructors can only view their own tracks
    if (userRole === "instructor" && track.instructorId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Coordinators can only view tracks they coordinate
    if (userRole === "coordinator" && track.coordinatorId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ track });
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
    const session = await getServerSession(authOptions);

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
    const existingTrack = await prisma.track.findUnique({
      where: { id },
    });

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
      const instructor = await prisma.user.findUnique({
        where: { id: instructorId },
      });

      if (!instructor || instructor.role !== "instructor") {
        return NextResponse.json(
          { error: "Invalid instructor" },
          { status: 400 }
        );
      }
    }

    // Verify coordinator if provided
    if (coordinatorId) {
      const coordinator = await prisma.user.findUnique({
        where: { id: coordinatorId },
      });

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

    const track = await prisma.track.update({
      where: { id },
      data: updateData,
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

    return NextResponse.json({ track });
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
    const session = await getServerSession(authOptions);

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
    const existingTrack = await prisma.track.findUnique({
      where: { id },
      include: {
        _count: {
          select: { liveSessions: true },
        },
      },
    });

    if (!existingTrack) {
      return NextResponse.json({ error: "Track not found" }, { status: 404 });
    }

    // Check if track has live sessions
    if (existingTrack._count.liveSessions > 0) {
      return NextResponse.json(
        { error: "Cannot delete track with existing sessions" },
        { status: 400 }
      );
    }

    await prisma.track.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Track deleted successfully" });
  } catch (error) {
    console.error("Error deleting track:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
