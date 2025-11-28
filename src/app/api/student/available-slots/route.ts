import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

import { db, schema, eq, and, or, desc, asc, count, sql, isNull } from "@/lib/db";

// GET /api/student/available-slots - Fetch available time slots for a track
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only students can view available slots
    if (session.user.role !== "student") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const trackId = searchParams.get("trackId");
    const weekStartDate = searchParams.get("weekStartDate");

    // Validation
    if (!trackId) {
      return NextResponse.json(
        { error: "trackId is required" },
        { status: 400 }
      );
    }

    // Verify track exists
    const [trackData] = await db
      .select({
        id: schema.tracks.id,
        name: schema.tracks.name,
        instructorId: schema.tracks.instructorId,
      })
      .from(schema.tracks)
      .where(eq(schema.tracks.id, trackId))
      .limit(1);

    const [instructor] = trackData
      ? await db
          .select({
            id: schema.users.id,
            name: schema.users.name,
            email: schema.users.email,
          })
          .from(schema.users)
          .where(eq(schema.users.id, trackData.instructorId))
          .limit(1)
      : [null];

    const track: any = trackData
      ? {
          ...trackData,
          instructor,
        }
      : null;

    if (!track) {
      return NextResponse.json(
        { error: "Track not found" },
        { status: 404 }
      );
    }

    // Build conditions
    const conditions: any[] = [
      eq(schema.instructorAvailabilities.trackId, trackId),
      eq(schema.instructorAvailabilities.isConfirmed, true),
    ];

    if (weekStartDate) {
      console.log("Student available-slots - Date filtering:", {
        receivedWeekStartDate: weekStartDate,
        searchingForDateString: weekStartDate
      });
      // Use SQL DATE() function for comparison to handle timezone issues
      conditions.push(sql`DATE(${schema.instructorAvailabilities.weekStartDate}) = ${weekStartDate}`);
    }

    // Fetch available slots
    const availableSlotsData = await db
      .select({
        id: schema.instructorAvailabilities.id,
        trackId: schema.instructorAvailabilities.trackId,
        instructorId: schema.instructorAvailabilities.instructorId,
        weekStartDate: schema.instructorAvailabilities.weekStartDate,
        dayOfWeek: schema.instructorAvailabilities.dayOfWeek,
        startHour: schema.instructorAvailabilities.startHour,
        endHour: schema.instructorAvailabilities.endHour,
        isConfirmed: schema.instructorAvailabilities.isConfirmed,
      })
      .from(schema.instructorAvailabilities)
      .where(and(...conditions))
      .orderBy(
        asc(schema.instructorAvailabilities.weekStartDate),
        asc(schema.instructorAvailabilities.dayOfWeek),
        asc(schema.instructorAvailabilities.startHour)
      );

    console.log(`Student available-slots - Found ${availableSlotsData.length} slots for track ${trackId}, week ${weekStartDate}`);

    const availableSlots = await Promise.all(
      availableSlotsData.map(async (slot) => {
        const [slotInstructor] = await db
          .select({
            id: schema.users.id,
            name: schema.users.name,
            email: schema.users.email,
          })
          .from(schema.users)
          .where(eq(schema.users.id, slot.instructorId))
          .limit(1);

        const [slotTrack] = await db
          .select({
            id: schema.tracks.id,
            name: schema.tracks.name,
            gradeId: schema.tracks.gradeId,
          })
          .from(schema.tracks)
          .where(eq(schema.tracks.id, slot.trackId))
          .limit(1);

        return {
          ...slot,
          instructor: slotInstructor,
          track: slotTrack,
        };
      })
    );

    return NextResponse.json({
      track,
      availableSlots,
      totalSlots: availableSlots.length,
    });
  } catch (error) {
    console.error("Error fetching available slots:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

