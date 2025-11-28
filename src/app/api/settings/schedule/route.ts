import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

import { db, schema, eq, and, or, desc, asc, count, sql, isNull } from "@/lib/db";

// GET /api/settings/schedule - Get schedule settings
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // All authenticated users can view schedule settings (needed for instructors to set availability)
    // Only manager and CEO can modify them (handled in PUT endpoint)

    // Fetch settings (should only be one record)
    const settings = await db
      .select()
      .from(schema.scheduleSettings)
      .limit(1)
      .then((r) => r[0]);

    if (!settings) {
      // Create default settings if none exist
      const [settingsId] = await db
        .insert(schema.scheduleSettings)
        .values({
          weekResetDay: 0, // Sunday
          weekResetHour: 22, // 10 PM
          availabilityOpenHours: 168, // Full week
        })
        .$returningId();

      const defaultSettings = await db
        .select()
        .from(schema.scheduleSettings)
        .where(eq(schema.scheduleSettings.id, settingsId.id))
        .then((r) => r[0]);

      return NextResponse.json({ settings: defaultSettings });
    }

    return NextResponse.json({ settings });
  } catch (error) {
    console.error("Error fetching schedule settings:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/settings/schedule - Update schedule settings
export async function PUT(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only manager and CEO can update schedule settings
    if (!["manager", "ceo"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { weekResetDay, weekResetHour, availabilityOpenHours, nextOpenDate } = body;

    // Build update data
    const updateData: any = {};

    if (weekResetDay !== undefined) {
      // Validation
      if (
        typeof weekResetDay !== "number" ||
        weekResetDay < 0 ||
        weekResetDay > 6
      ) {
        return NextResponse.json(
          { error: "weekResetDay must be between 0 (Sunday) and 6 (Saturday)" },
          { status: 400 }
        );
      }
      updateData.weekResetDay = weekResetDay;
    }

    if (weekResetHour !== undefined) {
      // Validation
      if (
        typeof weekResetHour !== "number" ||
        weekResetHour < 0 ||
        weekResetHour > 23
      ) {
        return NextResponse.json(
          { error: "weekResetHour must be between 0 and 23" },
          { status: 400 }
        );
      }
      updateData.weekResetHour = weekResetHour;
    }

    if (availabilityOpenHours !== undefined) {
      // Validation
      if (
        typeof availabilityOpenHours !== "number" ||
        availabilityOpenHours < 1
      ) {
        return NextResponse.json(
          { error: "availabilityOpenHours must be a positive number" },
          { status: 400 }
        );
      }
      updateData.availabilityOpenHours = availabilityOpenHours;
    }

    if (nextOpenDate !== undefined) {
      // Validation - accept null to clear or valid date string
      if (nextOpenDate !== null) {
        const date = new Date(nextOpenDate);
        if (isNaN(date.getTime())) {
          return NextResponse.json(
            { error: "nextOpenDate must be a valid date" },
            { status: 400 }
          );
        }
        updateData.nextOpenDate = date;
      } else {
        updateData.nextOpenDate = null;
      }
    }

    // Fetch existing settings
    const existingSettings = await db
      .select()
      .from(schema.scheduleSettings)
      .limit(1)
      .then((r) => r[0]);

    let settings;

    if (existingSettings) {
      // Update existing settings
      await db
        .update(schema.scheduleSettings)
        .set(updateData)
        .where(eq(schema.scheduleSettings.id, existingSettings.id));
      
      settings = await db
        .select()
        .from(schema.scheduleSettings)
        .where(eq(schema.scheduleSettings.id, existingSettings.id))
        .then((r) => r[0]);
    } else {
      // Create new settings with provided values
      const [settingsId] = await db
        .insert(schema.scheduleSettings)
        .values({
          weekResetDay: weekResetDay ?? 0,
          weekResetHour: weekResetHour ?? 22,
          availabilityOpenHours: availabilityOpenHours ?? 168,
        })
        .$returningId();
      
      settings = await db
        .select()
        .from(schema.scheduleSettings)
        .where(eq(schema.scheduleSettings.id, settingsId.id))
        .then((r) => r[0]);
    }

    return NextResponse.json({
      message: "Schedule settings updated successfully",
      settings,
    });
  } catch (error) {
    console.error("Error updating schedule settings:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

