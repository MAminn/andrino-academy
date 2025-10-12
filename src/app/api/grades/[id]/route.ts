import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

// GET /api/grades/[id] - Get a specific grade
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only manager, coordinator, instructor, and CEO can view grades
    const allowedRoles = ["manager", "coordinator", "instructor", "ceo"];
    if (!allowedRoles.includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const grade = await prisma.grade.findUnique({
      where: { id: params.id },
      include: {
        tracks: {
          include: {
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
        },
        students: {
          select: {
            id: true,
            name: true,
            email: true,
            age: true,
            priorExperience: true,
          },
        },
        _count: {
          select: {
            students: true,
            tracks: true,
          },
        },
      },
    });

    if (!grade) {
      return NextResponse.json({ error: "Grade not found" }, { status: 404 });
    }

    return NextResponse.json({ grade });
  } catch (error) {
    console.error("Error fetching grade:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/grades/[id] - Update a specific grade (Manager only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only manager and CEO can update grades
    if (!["manager", "ceo"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { name, description, order, isActive } = body;

    // Check if grade exists
    const existingGrade = await prisma.grade.findUnique({
      where: { id: params.id },
    });

    if (!existingGrade) {
      return NextResponse.json({ error: "Grade not found" }, { status: 404 });
    }

    // Validation
    if (name && typeof name !== "string") {
      return NextResponse.json(
        { error: "Invalid grade name" },
        { status: 400 }
      );
    }

    // Check if new name already exists (if changing name)
    if (name && name !== existingGrade.name) {
      const nameExists = await prisma.grade.findUnique({
        where: { name },
      });

      if (nameExists) {
        return NextResponse.json(
          { error: "Grade name already exists" },
          { status: 400 }
        );
      }
    }

    // Update data object
    const updateData: {
      name?: string;
      description?: string | null;
      order?: number | null;
      isActive?: boolean;
    } = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (order !== undefined) updateData.order = order;
    if (isActive !== undefined) updateData.isActive = isActive;

    const grade = await prisma.grade.update({
      where: { id: params.id },
      data: updateData,
      include: {
        _count: {
          select: {
            students: true,
            tracks: true,
          },
        },
      },
    });

    return NextResponse.json({ grade });
  } catch (error) {
    console.error("Error updating grade:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/grades/[id] - Delete a specific grade (Manager only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only manager and CEO can delete grades
    if (!["manager", "ceo"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Check if grade exists
    const existingGrade = await prisma.grade.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            students: true,
            tracks: true,
          },
        },
      },
    });

    if (!existingGrade) {
      return NextResponse.json({ error: "Grade not found" }, { status: 404 });
    }

    // Check if grade has students or tracks assigned
    if (existingGrade._count.students > 0) {
      return NextResponse.json(
        { error: "Cannot delete grade with assigned students" },
        { status: 400 }
      );
    }

    if (existingGrade._count.tracks > 0) {
      return NextResponse.json(
        { error: "Cannot delete grade with existing tracks" },
        { status: 400 }
      );
    }

    await prisma.grade.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Grade deleted successfully" });
  } catch (error) {
    console.error("Error deleting grade:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
