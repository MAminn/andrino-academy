import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

// GET /api/grades - Get all grades
export async function GET() {
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

    const grades = await prisma.grade.findMany({
      include: {
        tracks: {
          include: {
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
        },
        students: {
          select: { id: true, name: true, email: true },
        },
        _count: {
          select: {
            students: true,
            tracks: true,
          },
        },
      },
      orderBy: { order: "asc" },
    });

    return NextResponse.json({ grades });
  } catch (error) {
    console.error("Error fetching grades:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/grades - Create a new grade (Manager only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only manager and CEO can create grades
    if (!["manager", "ceo"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { name, description, order } = body;

    // Validation
    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { error: "Grade name is required" },
        { status: 400 }
      );
    }

    // Check if grade name already exists
    const existingGrade = await prisma.grade.findUnique({
      where: { name },
    });

    if (existingGrade) {
      return NextResponse.json(
        { error: "Grade name already exists" },
        { status: 400 }
      );
    }

    // If no order provided, set it to the next available order
    let gradeOrder = order;
    if (!gradeOrder) {
      const lastGrade = await prisma.grade.findFirst({
        orderBy: { order: "desc" },
      });
      gradeOrder = (lastGrade?.order || 0) + 1;
    }

    const grade = await prisma.grade.create({
      data: {
        name,
        description,
        order: gradeOrder,
        isActive: true,
      },
      include: {
        _count: {
          select: {
            students: true,
            tracks: true,
          },
        },
      },
    });

    return NextResponse.json({ grade }, { status: 201 });
  } catch (error) {
    console.error("Error creating grade:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
