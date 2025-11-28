import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db, schema, eq, asc } from "@/lib/db";

// GET /api/users - Get users with optional role filter
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
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
    const users = role 
      ? await db.select().from(schema.users).where(eq(schema.users.role, role)).orderBy(asc(schema.users.name))
      : await db.select().from(schema.users).orderBy(asc(schema.users.name));

    // If include=tracks, fetch tracks separately
    if (include === "tracks") {
      const usersWithTracks = await Promise.all(
        users.map(async (user) => {
          const tracks = await db
            .select({
              id: schema.tracks.id,
              name: schema.tracks.name,
              gradeId: schema.tracks.gradeId,
            })
            .from(schema.tracks)
            .where(eq(schema.tracks.instructorId, user.id));

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt,
            tracks,
            _count: { tracks: tracks.length },
          };
        })
      );
      return NextResponse.json({ users: usersWithTracks });
    }

    // Transform data for consistency
    const transformedUsers = users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      _count: { tracks: 0 },
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
