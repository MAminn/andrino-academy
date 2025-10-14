import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

// GET /api/students/[id] - Get a specific student
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Students can access their own data, managers and CEO can access any student
    if (session.user.role === "student") {
      // Students can only access their own data
      if (session.user.id !== id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    } else if (
      !["manager", "ceo", "coordinator", "instructor"].includes(
        session.user.role
      )
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const student = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        age: true,
        parentEmail: true,
        parentPhone: true,
        parentName: true,
        priorExperience: true,
        gradeLevel: true,
        gradeId: true,
        phone: true,
        address: true,
        emergencyContact: true,
        createdAt: true,
        updatedAt: true,
        assignedGrade: {
          select: {
            id: true,
            name: true,
            description: true,
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
                  take: 5, // Latest 5 sessions
                },
                _count: {
                  select: { liveSessions: true },
                },
              },
            },
          },
        },
        sessionAttendances: {
          include: {
            session: {
              select: {
                id: true,
                title: true,
                date: true,
                startTime: true,
                endTime: true,
                track: {
                  select: { id: true, name: true },
                },
              },
            },
          },
          orderBy: { session: { date: "desc" } },
          take: 10, // Latest 10 attendances
        },
      },
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // Check if user is actually a student
    const fullUser = await prisma.user.findUnique({
      where: { id },
      select: { role: true },
    });

    if (fullUser?.role !== "student") {
      return NextResponse.json(
        { error: "User is not a student" },
        { status: 400 }
      );
    }

    return NextResponse.json({ student });
  } catch (error) {
    console.error("Error fetching student:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/students/[id] - Update student (mainly for grade assignment)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only manager and CEO can update students
    if (!["manager", "ceo"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { gradeId } = body;

    // Check if student exists
    const existingStudent = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        role: true,
        gradeId: true,
        name: true,
        email: true,
      },
    });

    if (!existingStudent) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    if (existingStudent.role !== "student") {
      return NextResponse.json(
        { error: "User is not a student" },
        { status: 400 }
      );
    }

    // Verify grade exists if provided
    if (gradeId) {
      const grade = await prisma.grade.findUnique({
        where: { id: gradeId },
      });

      if (!grade) {
        return NextResponse.json({ error: "Grade not found" }, { status: 400 });
      }

      if (!grade.isActive) {
        return NextResponse.json(
          { error: "Cannot assign student to inactive grade" },
          { status: 400 }
        );
      }
    }

    // Update student
    const updateData: {
      gradeId?: string | null;
    } = {};

    if (gradeId !== undefined) {
      updateData.gradeId = gradeId;
    }

    const updatedStudent = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        age: true,
        parentEmail: true,
        parentPhone: true,
        parentName: true,
        priorExperience: true,
        gradeLevel: true,
        gradeId: true,
        createdAt: true,
        updatedAt: true,
        assignedGrade: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
    });

    // Log the grade assignment change
    console.log(
      `Student ${updatedStudent.name} (${updatedStudent.email}) assigned to grade by ${session.user.email}`
    );

    return NextResponse.json({
      student: updatedStudent,
      message: gradeId
        ? `Student assigned to grade successfully`
        : `Student removed from grade successfully`,
    });
  } catch (error) {
    console.error("Error updating student:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
