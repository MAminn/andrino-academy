import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

// POST /api/students/assign-grade - Bulk assign students to grade
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only manager and CEO can assign grades
    if (!["manager", "ceo"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { studentIds, gradeId } = body;

    // Validation
    if (!Array.isArray(studentIds) || studentIds.length === 0) {
      return NextResponse.json(
        { error: "Student IDs array is required" },
        { status: 400 }
      );
    }

    if (!gradeId) {
      return NextResponse.json(
        { error: "Grade ID is required" },
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

    if (!grade.isActive) {
      return NextResponse.json(
        { error: "Cannot assign students to inactive grade" },
        { status: 400 }
      );
    }

    // Verify all users are students
    const users = await prisma.user.findMany({
      where: {
        id: { in: studentIds },
        role: "student",
      },
      select: { id: true, name: true, email: true },
    });

    if (users.length !== studentIds.length) {
      return NextResponse.json(
        { error: "Some users are not valid students" },
        { status: 400 }
      );
    }

    // Bulk update students
    const updateResult = await prisma.user.updateMany({
      where: {
        id: { in: studentIds },
        role: "student",
      },
      data: {
        gradeId: gradeId,
      },
    });

    // Get updated students for response
    const updatedStudents = await prisma.user.findMany({
      where: {
        id: { in: studentIds },
      },
      select: {
        id: true,
        name: true,
        email: true,
        age: true,
        priorExperience: true,
        gradeId: true,
        assignedGrade: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
    });

    // Log the assignment
    console.log(
      `${updateResult.count} students assigned to grade ${grade.name} by ${session.user.email}`
    );

    return NextResponse.json({
      students: updatedStudents,
      assignedCount: updateResult.count,
      message: `${updateResult.count} students assigned to grade ${grade.name} successfully`,
    });
  } catch (error) {
    console.error("Error assigning students to grade:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
