import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

import { db, schema, eq, and } from "@/lib/db";

// PUT /api/instructor/availability/confirm - Confirm weekly availability (locks it)
export async function PUT(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only instructors can confirm availability
    if (session.user.role !== "instructor") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { trackId, weekStartDate } = body;

    // Validation
    if (!trackId || !weekStartDate) {
      return NextResponse.json(
        { error: "trackId and weekStartDate are required" },
        { status: 400 }
      );
    }

    // Parse date in local time to avoid timezone shift issues
    const [year, month, day] = weekStartDate.split('-').map(Number);
    const weekStart = new Date(year, month - 1, day);
    weekStart.setHours(0, 0, 0, 0);

    console.log("Confirm availability - date parsing:", {
      receivedWeekStartDate: weekStartDate,
      parsedDate: weekStart.toISOString(),
      parsedDayOfWeek: weekStart.getDay(),
      instructorId: session.user.id,
      trackId
    });

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

    // Find all unconfirmed availability slots for this week/track
    const slotsToConfirm = await db
      .select({ 
        id: schema.instructorAvailabilities.id,
        weekStartDate: schema.instructorAvailabilities.weekStartDate,
        dayOfWeek: schema.instructorAvailabilities.dayOfWeek,
        startHour: schema.instructorAvailabilities.startHour,
        endHour: schema.instructorAvailabilities.endHour,
      })
      .from(schema.instructorAvailabilities)
      .where(
        and(
          eq(schema.instructorAvailabilities.instructorId, session.user.id),
          eq(schema.instructorAvailabilities.trackId, trackId),
          eq(schema.instructorAvailabilities.weekStartDate, weekStart),
          eq(schema.instructorAvailabilities.isConfirmed, false)
        )
      );

    console.log("Found slots to confirm:", slotsToConfirm);

    if (slotsToConfirm.length === 0) {
      // Debug: Check what slots exist for this instructor/track
      const allSlots = await db
        .select({
          id: schema.instructorAvailabilities.id,
          weekStartDate: schema.instructorAvailabilities.weekStartDate,
          dayOfWeek: schema.instructorAvailabilities.dayOfWeek,
          startHour: schema.instructorAvailabilities.startHour,
          isConfirmed: schema.instructorAvailabilities.isConfirmed,
        })
        .from(schema.instructorAvailabilities)
        .where(
          and(
            eq(schema.instructorAvailabilities.instructorId, session.user.id),
            eq(schema.instructorAvailabilities.trackId, trackId)
          )
        );
      
      console.log("All slots for this instructor/track:", allSlots);
      
      // Provide a helpful error message based on what we found
      if (allSlots.length === 0) {
        return NextResponse.json(
          { error: "لم يتم العثور على فترات متاحة. الرجاء حفظ الفترات الزمنية أولاً قبل التأكيد." },
          { status: 404 }
        );
      } else {
        // Slots exist but they're all confirmed
        return NextResponse.json(
          { error: "جميع الفترات الزمنية مؤكدة بالفعل لهذا الأسبوع/المسار" },
          { status: 404 }
        );
      }
    }

    // Confirm all slots
    await db
      .update(schema.instructorAvailabilities)
      .set({ isConfirmed: true })
      .where(
        and(
          eq(schema.instructorAvailabilities.instructorId, session.user.id),
          eq(schema.instructorAvailabilities.trackId, trackId),
          eq(schema.instructorAvailabilities.weekStartDate, weekStart),
          eq(schema.instructorAvailabilities.isConfirmed, false)
        )
      );

    return NextResponse.json({
      message: `Confirmed ${slotsToConfirm.length} availability slots for the week`,
      confirmedCount: slotsToConfirm.length,
    });
  } catch (error) {
    console.error("Error confirming availability:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

