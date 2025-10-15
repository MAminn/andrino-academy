import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

// POST /api/students/[id]/unassign-grade - Unassign student from grade
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only managers and CEOs can unassign students from grades
    if (!["manager", "ceo"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const studentId = params.id;

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

    // Unassign student from grade
    const updatedStudent = await prisma.user.update({
      where: { id: studentId },
      data: { gradeId: null },
    });

    return NextResponse.json({
      message: "Student unassigned from grade successfully",
      student: updatedStudent,
    });
  } catch (error) {
    console.error("Error unassigning student from grade:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
