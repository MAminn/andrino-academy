import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

// POST /api/students/[id]/assign-grade - Assign student to grade
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only managers and CEOs can assign students to grades
    if (!["manager", "ceo"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { gradeId } = await request.json();
    const studentId = params.id;

    if (!gradeId) {
      return NextResponse.json(
        { error: "Grade ID is required" },
        { status: 400 }
      );
    }

    // Check if student exists
    const student = await prisma.user.findFirst({
      where: {
        id: studentId,
        role: "student",
      },
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // Check if grade exists
    const grade = await prisma.grade.findUnique({
      where: { id: gradeId },
    });

    if (!grade) {
      return NextResponse.json({ error: "Grade not found" }, { status: 404 });
    }

    // Assign student to grade
    const updatedStudent = await prisma.user.update({
      where: { id: studentId },
      data: { gradeId: gradeId },
    });

    return NextResponse.json({
      message: "Student assigned to grade successfully",
      student: updatedStudent,
    });
  } catch (error) {
    console.error("Error assigning student to grade:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
