import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

// GET /api/students - Get students (with optional filters)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only manager and CEO can view all students
    if (!["manager", "ceo"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const gradeId = searchParams.get("gradeId");
    const unassigned = searchParams.get("unassigned") === "true";

    // Build where clause
    const whereClause: {
      role: string;
      gradeId?: string | null;
    } = {
      role: "student",
    };

    if (unassigned) {
      whereClause.gradeId = null;
    } else if (gradeId) {
      whereClause.gradeId = gradeId;
    }

    const students = await prisma.user.findMany({
      where: whereClause,
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
        assignedGrade: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
      orderBy: [{ name: "asc" }],
    });

    return NextResponse.json({ students });
  } catch (error) {
    console.error("Error fetching students:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
