import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

// GET /api/users - Get users with optional role filter
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only managers, coordinators, and CEOs can view users
    if (!["manager", "coordinator", "ceo"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role");
    const include = searchParams.get("include");

    // Build where clause
    const whereClause: { role?: string } = {};
    if (role) {
      whereClause.role = role;
    }

    // Build include/select clause based on include parameter
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const queryOptions: any = {
      where: whereClause,
      orderBy: { name: "asc" },
    };

    if (include === "tracks") {
      queryOptions.select = {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        instructedTracks: {
          include: {
            grade: {
              select: { id: true, name: true },
            },
            _count: {
              select: { liveSessions: true },
            },
          },
        },
      };
    } else {
      queryOptions.select = {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      };
    }

    const users = await prisma.user.findMany(queryOptions);

    // Transform data for consistency
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const transformedUsers = users.map((user: any) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      tracks: user.instructedTracks || [],
      _count: {
        tracks: user.instructedTracks?.length || 0,
      },
    }));

    return NextResponse.json({ users: transformedUsers });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
