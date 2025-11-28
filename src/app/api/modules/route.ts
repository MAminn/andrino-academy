import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

import { db, schema, eq, and, or, desc, asc, count, sql, isNull, inArray } from "@/lib/db";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

type ModuleType = "VIDEO" | "PDF" | "DOCUMENT" | "IMAGE";
type ModuleCategory = "LECTURE" | "TUTORIAL" | "EXERCISE" | "REFERENCE" | "SLIDES" | "HANDOUT" | "ASSIGNMENT" | "SOLUTION" | "SUPPLEMENTARY" | "PROJECT" | "UNCATEGORIZED";

// File size limits (in bytes)
const FILE_SIZE_LIMITS = {
  VIDEO: 2 * 1024 * 1024 * 1024, // 2GB
  PDF: 100 * 1024 * 1024, // 100MB
  DOCUMENT: 50 * 1024 * 1024, // 50MB
  IMAGE: 50 * 1024 * 1024, // 50MB
};

// Allowed MIME types
const ALLOWED_MIME_TYPES = {
  VIDEO: [
    "video/mp4",
    "video/webm",
    "video/ogg",
    "video/quicktime",
    "video/x-msvideo",
    "video/x-matroska",
  ],
  PDF: ["application/pdf"],
  DOCUMENT: [
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "text/plain",
  ],
  IMAGE: ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp", "image/svg+xml"],
};

// GET /api/modules - Get all modules (with filters)
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const trackId = searchParams.get("trackId");
    const sessionId = searchParams.get("sessionId");
    const type = searchParams.get("type") as ModuleType | null;
    const category = searchParams.get("category") as ModuleCategory | null;
    const isPublished = searchParams.get("isPublished");

    // Build filter
    const where: any = {};

    if (trackId) {
      where.trackId = trackId;
    }

    if (sessionId) {
      where.sessionId = sessionId;
    }

    if (type) {
      where.type = type;
    }

    if (category) {
      where.category = category;
    }

    // Students can only see published modules
    if (session.user.role === "student") {
      where.isPublished = true;
    } else if (isPublished !== null && isPublished !== undefined) {
      where.isPublished = isPublished === "true";
    }

    // Build WHERE conditions
    const conditions = [];
    if (trackId) conditions.push(eq(schema.modules.trackId, trackId));
    if (sessionId) conditions.push(eq(schema.modules.sessionId, sessionId));
    // Note: type filter removed - modules table doesn't have type field, it's in contentItems
    if (category) conditions.push(eq(schema.modules.category, category));
    if (session.user.role === "student") {
      conditions.push(eq(schema.modules.isPublished, true));
    } else if (isPublished !== null && isPublished !== undefined) {
      conditions.push(eq(schema.modules.isPublished, isPublished === "true"));
    }

    // Query base modules
    const baseModules = await db
      .select()
      .from(schema.modules)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(asc(schema.modules.order), asc(schema.modules.createdAt));

    // Fetch relations for each module
    const modules = await Promise.all(
      baseModules.map(async (module) => {
        const [track, session, contentItems, tasks, assignments] = await Promise.all([
          module.trackId
            ? db
                .select({ id: schema.tracks.id, name: schema.tracks.name, gradeId: schema.tracks.gradeId })
                .from(schema.tracks)
                .where(eq(schema.tracks.id, module.trackId))
                .then((r) => r[0] || null)
            : null,
          module.sessionId
            ? db
                .select({ id: schema.liveSessions.id, title: schema.liveSessions.title, date: schema.liveSessions.date })
                .from(schema.liveSessions)
                .where(eq(schema.liveSessions.id, module.sessionId))
                .then((r) => r[0] || null)
            : null,
          db
            .select()
            .from(schema.contentItems)
            .where(eq(schema.contentItems.moduleId, module.id))
            .orderBy(asc(schema.contentItems.order)),
          db
            .select()
            .from(schema.tasks)
            .where(eq(schema.tasks.moduleId, module.id))
            .orderBy(asc(schema.tasks.order)),
          db
            .select()
            .from(schema.assignments)
            .where(eq(schema.assignments.moduleId, module.id))
            .orderBy(asc(schema.assignments.order)),
        ]);

        return {
          ...module,
          track,
          session,
          contentItems,
          tasks,
          assignments,
        };
      })
    );

    return NextResponse.json({ modules });
  } catch (error) {
    console.error("Error fetching modules:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/modules - Create a new module with file upload (Manager only)
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only manager and CEO can create modules
    if (!["manager", "ceo"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const formData = await request.formData();

    // Extract form fields
    const title = formData.get("title") as string;
    const description = formData.get("description") as string | null;
    const category = formData.get("category") as ModuleCategory;
    const targetAudience = formData.get("targetAudience") as "instructor" | "student" | null;
    const trackId = formData.get("trackId") as string;
    const sessionId = formData.get("sessionId") as string | null;
    const order = formData.get("order") as string | null;
    const isPublished = formData.get("isPublished") === "true";
    const weekNumber = formData.get("weekNumber") as string | null;
    const startDate = formData.get("startDate") as string | null;

    // Validation
    if (!title || !trackId) {
      return NextResponse.json(
        { error: "Title and trackId are required" },
        { status: 400 }
      );
    }

    // Verify track exists
    const track = await db
      .select()
      .from(schema.tracks)
      .where(eq(schema.tracks.id, trackId))
      .then((r) => r[0]);

    if (!track) {
      return NextResponse.json(
        { error: "Track not found" },
        { status: 404 }
      );
    }

    // Verify session if provided
    if (sessionId) {
      const liveSession = await db
        .select()
        .from(schema.liveSessions)
        .where(eq(schema.liveSessions.id, sessionId))
        .then((r) => r[0]);

      if (!liveSession) {
        return NextResponse.json(
          { error: "Session not found" },
          { status: 404 }
        );
      }
    }

    // Create module in database
    const [moduleId] = await db
      .insert(schema.modules)
      .values({
        title,
        description: description || null,
        category: category || "UNCATEGORIZED",
        targetAudience: targetAudience || "student",
        order: order ? parseInt(order) : 0,
        isPublished,
        trackId,
        sessionId: sessionId || null,
        weekNumber: weekNumber ? parseInt(weekNumber) : null,
        startDate: startDate ? new Date(startDate) : null,
        uploadedBy: session.user.email || "",
      })
      .$returningId();

    // Fetch the created module with relations
    const [createdModule, moduleTrack, moduleSession, contentItems, tasks, assignments] = await Promise.all([
      db.select().from(schema.modules).where(eq(schema.modules.id, moduleId.id)).then((r) => r[0]),
      db
        .select({ id: schema.tracks.id, name: schema.tracks.name })
        .from(schema.tracks)
        .where(eq(schema.tracks.id, trackId))
        .then((r) => r[0] || null),
      sessionId
        ? db
            .select({ id: schema.liveSessions.id, title: schema.liveSessions.title })
            .from(schema.liveSessions)
            .where(eq(schema.liveSessions.id, sessionId))
            .then((r) => r[0] || null)
        : Promise.resolve(null),
      db.select().from(schema.contentItems).where(eq(schema.contentItems.moduleId, moduleId.id)).orderBy(asc(schema.contentItems.order)),
      db.select().from(schema.tasks).where(eq(schema.tasks.moduleId, moduleId.id)).orderBy(asc(schema.tasks.order)),
      db.select().from(schema.assignments).where(eq(schema.assignments.moduleId, moduleId.id)).orderBy(asc(schema.assignments.order)),
    ]);

    const module = {
      ...createdModule,
      track: moduleTrack,
      session: moduleSession,
      contentItems,
      tasks,
      assignments,
    };

    return NextResponse.json(
      { module, message: "Module created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating module:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/modules - Delete multiple modules (Manager only)
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only manager and CEO can delete modules
    if (!["manager", "ceo"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const ids = searchParams.get("ids")?.split(",");

    if (!ids || ids.length === 0) {
      return NextResponse.json(
        { error: "Module IDs are required" },
        { status: 400 }
      );
    }

    // Delete modules (inArray is already imported from @/lib/db at top)
    await db.delete(schema.modules).where(inArray(schema.modules.id, ids));

    return NextResponse.json({
      message: `${ids.length} module(s) deleted successfully`,
    });
  } catch (error) {
    console.error("Error deleting modules:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

