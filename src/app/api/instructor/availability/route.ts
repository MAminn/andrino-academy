import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

import { db, schema, eq, and, asc, sql } from "@/lib/db";

// GET /api/instructor/availability - Fetch instructor's availability slots
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only instructors can view their availability
    if (session.user.role !== "instructor") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const weekStartDate = searchParams.get("weekStartDate");
    const trackId = searchParams.get("trackId");

    // Build query filters
    const conditions: any[] = [
      eq(schema.instructorAvailabilities.instructorId, session.user.id),
    ];

    if (weekStartDate) {
      const [year, month, day] = weekStartDate.split('-').map(Number);
      const targetDate = new Date(year, month - 1, day);
      targetDate.setHours(0, 0, 0, 0);
      console.log("GET availability - Date comparison:", {
        receivedWeekStartDate: weekStartDate,
        parsedDate: targetDate.toISOString(),
        parsedDateLocal: targetDate.toString(),
        searchingForDateString: weekStartDate
      });
      // Use SQL DATE() function for comparison to handle timezone issues
      conditions.push(sql`DATE(${schema.instructorAvailabilities.weekStartDate}) = ${weekStartDate}`);
    }

    if (trackId) {
      conditions.push(eq(schema.instructorAvailabilities.trackId, trackId));
    }

    const availabilityData = await db
      .select({
        id: schema.instructorAvailabilities.id,
        instructorId: schema.instructorAvailabilities.instructorId,
        trackId: schema.instructorAvailabilities.trackId,
        weekStartDate: schema.instructorAvailabilities.weekStartDate,
        dayOfWeek: schema.instructorAvailabilities.dayOfWeek,
        startHour: schema.instructorAvailabilities.startHour,
        endHour: schema.instructorAvailabilities.endHour,
        isBooked: schema.instructorAvailabilities.isBooked,
        isConfirmed: schema.instructorAvailabilities.isConfirmed,
      })
      .from(schema.instructorAvailabilities)
      .where(and(...conditions))
      .orderBy(
        asc(schema.instructorAvailabilities.weekStartDate),
        asc(schema.instructorAvailabilities.dayOfWeek),
        asc(schema.instructorAvailabilities.startHour)
      );

    console.log(`GET availability - Found ${availabilityData.length} slots for instructor ${session.user.id}, track ${trackId}, week ${weekStartDate}`);
    console.log("Raw availability data:", availabilityData.map(a => ({
      id: a.id,
      dayOfWeek: a.dayOfWeek,
      startHour: a.startHour,
      endHour: a.endHour,
      isConfirmed: a.isConfirmed,
      isBooked: a.isBooked
    })));

    const availability = await Promise.all(
      availabilityData.map(async (avail) => {
        const [track] = await db
          .select({
            id: schema.tracks.id,
            name: schema.tracks.name,
            gradeId: schema.tracks.gradeId,
          })
          .from(schema.tracks)
          .where(eq(schema.tracks.id, avail.trackId))
          .limit(1);

        const bookingsData = await db
          .select({
            id: schema.sessionBookings.id,
            studentId: schema.sessionBookings.studentId,
          })
          .from(schema.sessionBookings)
          .where(eq(schema.sessionBookings.availabilityId, avail.id));

        const bookings = await Promise.all(
          bookingsData.map(async (booking) => {
            const [student] = await db
              .select({
                id: schema.users.id,
                name: schema.users.name,
                email: schema.users.email,
              })
              .from(schema.users)
              .where(eq(schema.users.id, booking.studentId))
              .limit(1);

            return {
              ...booking,
              student,
            };
          })
        );

        return {
          ...avail,
          track,
          bookings,
        };
      })
    );

    return NextResponse.json({ availability });
  } catch (error) {
    console.error("Error fetching availability:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/instructor/availability - Create availability slots
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only instructors can create availability
    if (session.user.role !== "instructor") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { trackId, weekStartDate, slots } = body;

    // Validation
    if (!trackId || !weekStartDate || !slots || !Array.isArray(slots)) {
      return NextResponse.json(
        { error: "trackId, weekStartDate, and slots array are required" },
        { status: 400 }
      );
    }

    // Verify track exists and instructor is assigned to it
    const [track] = await db
      .select({ id: schema.tracks.id })
      .from(schema.tracks)
      .where(
        and(
          eq(schema.tracks.id, trackId),
          eq(schema.tracks.instructorId, session.user.id)
        )
      )
      .limit(1);

    if (!track) {
      return NextResponse.json(
        { error: "Track not found or you are not assigned to this track" },
        { status: 404 }
      );
    }

    // Get schedule settings to determine week start
    const [scheduleSettings] = await db
      .select({ weekResetDay: schema.scheduleSettings.weekResetDay })
      .from(schema.scheduleSettings)
      .limit(1);
    const weekStartDay = scheduleSettings?.weekResetDay ?? 0; // Default to Sunday

    // Validate weekStartDate matches the configured week start day
    // Parse date in local time to avoid timezone shift issues
    const [year, month, day] = weekStartDate.split('-').map(Number);
    const weekStart = new Date(year, month - 1, day);
    weekStart.setHours(0, 0, 0, 0);
    
    console.log("API weekStartDate validation:", {
      receivedWeekStartDate: weekStartDate,
      parsedDate: weekStart.toISOString(),
      parsedDateLocal: weekStart.toString(),
      parsedDayOfWeek: weekStart.getDay(),
      expectedWeekStartDay: weekStartDay,
      matches: weekStart.getDay() === weekStartDay
    });
    
    if (weekStart.getDay() !== weekStartDay) {
      const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      console.log(`ERROR: weekStartDate validation failed. Expected ${dayNames[weekStartDay]}, got ${dayNames[weekStart.getDay()]}`);
      return NextResponse.json(
        { error: `weekStartDate must be a ${dayNames[weekStartDay]}` },
        { status: 400 }
      );
    }

    // Check if availability already exists and is confirmed for this week/track
    const [existingConfirmed] = await db
      .select({ id: schema.instructorAvailabilities.id })
      .from(schema.instructorAvailabilities)
      .where(
        and(
          eq(schema.instructorAvailabilities.instructorId, session.user.id),
          eq(schema.instructorAvailabilities.trackId, trackId),
          eq(schema.instructorAvailabilities.weekStartDate, weekStart),
          eq(schema.instructorAvailabilities.isConfirmed, true)
        )
      )
      .limit(1);

    if (existingConfirmed) {
      return NextResponse.json(
        { error: "Availability for this week/track is already confirmed and cannot be modified" },
        { status: 400 }
      );
    }

    // Delete any unconfirmed existing slots for this week/track
    await db
      .delete(schema.instructorAvailabilities)
      .where(
        and(
          eq(schema.instructorAvailabilities.instructorId, session.user.id),
          eq(schema.instructorAvailabilities.trackId, trackId),
          eq(schema.instructorAvailabilities.weekStartDate, weekStart),
          eq(schema.instructorAvailabilities.isConfirmed, false)
        )
      );

    // Create new availability slots
    console.log(`Creating ${slots.length} availability slots for instructor ${session.user.id}, track ${trackId}, week starting ${weekStartDate}`);
    
    const createdSlots = await Promise.all(
      slots.map((slot: any) => {
        const { dayOfWeek, startHour, endHour } = slot;

        // Validation
        if (
          typeof dayOfWeek !== "number" ||
          dayOfWeek < 0 ||
          dayOfWeek > 6
        ) {
          throw new Error("dayOfWeek must be between 0 (Sunday) and 6 (Saturday)");
        }

        if (
          typeof startHour !== "number" ||
          startHour < 13 ||
          startHour > 22
        ) {
          throw new Error("startHour must be between 13 (1pm) and 22 (10pm)");
        }

        if (
          typeof endHour !== "number" ||
          endHour < 13 ||
          endHour > 23 || // Allow 23 for the last slot (22:00-23:00)
          endHour <= startHour
        ) {
          throw new Error("endHour must be between 13 and 23, and greater than startHour");
        }

        return db.insert(schema.instructorAvailabilities).values({
          instructorId: session.user.id,
          trackId,
          weekStartDate: weekStart,
          dayOfWeek,
          startHour,
          endHour,
          isBooked: false,
          isConfirmed: false,
        });
      })
    );

    console.log(`Successfully created ${createdSlots.length} availability slots`);

    return NextResponse.json(
      {
        message: "Availability slots created successfully",
        slots: createdSlots,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating availability:", error);
    
    if (error instanceof Error && error.message.includes("must be")) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

