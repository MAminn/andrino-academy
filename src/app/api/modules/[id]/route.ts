import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db, schema, eq, and, count, asc } from "@/lib/db";
import { unlink } from "fs/promises";
import fs from "fs";
import path from "path";

type ModuleCategory = "LECTURE" | "TUTORIAL" | "EXERCISE" | "REFERENCE" | "SLIDES" | "HANDOUT" | "ASSIGNMENT" | "SOLUTION" | "SUPPLEMENTARY" | "PROJECT" | "UNCATEGORIZED";

// Route segment config for large file uploads
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes

// GET /api/modules/[id] - Get a single module by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const [moduleData] = await db
      .select()
      .from(schema.modules)
      .where(eq(schema.modules.id, id))
      .limit(1);

    if (!moduleData) {
      return NextResponse.json(
        { error: "Module not found" },
        { status: 404 }
      );
    }

    // Students can only see published modules
    if (session.user.role === "student" && !moduleData.isPublished) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Fetch related data
    const [track] = await db
      .select({ id: schema.tracks.id, name: schema.tracks.name, gradeId: schema.tracks.gradeId })
      .from(schema.tracks)
      .where(eq(schema.tracks.id, moduleData.trackId))
      .limit(1);

    let session_data = null;
    if (moduleData.sessionId) {
      const [sess] = await db
        .select({ id: schema.liveSessions.id, title: schema.liveSessions.title, date: schema.liveSessions.date })
        .from(schema.liveSessions)
        .where(eq(schema.liveSessions.id, moduleData.sessionId))
        .limit(1);
      session_data = sess;
    }

    const contentItems = await db
      .select()
      .from(schema.contentItems)
      .where(eq(schema.contentItems.moduleId, id))
      .orderBy(asc(schema.contentItems.order));

    const tasks = await db
      .select()
      .from(schema.tasks)
      .where(eq(schema.tasks.moduleId, id))
      .orderBy(asc(schema.tasks.order));

    const assignments = await db
      .select()
      .from(schema.assignments)
      .where(eq(schema.assignments.moduleId, id))
      .orderBy(asc(schema.assignments.order));

    const module: any = {
      ...moduleData,
      track,
      session: session_data,
      contentItems,
      tasks,
      assignments,
    };

    return NextResponse.json({ module });
  } catch (error) {
    console.error("Error fetching module:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/modules/[id] - Update a module (Manager only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only manager and CEO can update modules
    if (!["manager", "ceo"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    // Check if module exists
    const [existingModule] = await db
      .select()
      .from(schema.modules)
      .where(eq(schema.modules.id, id))
      .limit(1);

    if (!existingModule) {
      return NextResponse.json(
        { error: "Module not found" },
        { status: 404 }
      );
    }

    // Check content type to handle both JSON and FormData
    const contentType = request.headers.get("content-type") || "";
    let title, description, category, targetAudience, trackId, order, isPublished, sessionId, weekNumber, startDate;

    if (contentType.includes("multipart/form-data")) {
      // Handle FormData (from multi-week upload)
      const formData = await request.formData();
      title = formData.get("title") as string | null;
      description = formData.get("description") as string | null;
      category = formData.get("category") as string | null;
      targetAudience = formData.get("targetAudience") as string | null;
      trackId = formData.get("trackId") as string | null;
      order = formData.get("order") as string | null;
      isPublished = formData.get("isPublished") as string | null;
      sessionId = formData.get("sessionId") as string | null;
      weekNumber = formData.get("weekNumber") as string | null;
      startDate = formData.get("startDate") as string | null;
    } else {
      // Handle JSON (from simple update)
      const body = await request.json();
      title = body.title;
      description = body.description;
      category = body.category;
      targetAudience = body.targetAudience;
      trackId = body.trackId;
      order = body.order;
      isPublished = body.isPublished;
      sessionId = body.sessionId;
      weekNumber = body.weekNumber;
      startDate = body.startDate;
    }

    // Build update data
    const updateData: any = {};

    if (title !== undefined && title !== null) updateData.title = title;
    if (description !== undefined && description !== null) updateData.description = description;
    if (category !== undefined && category !== null) updateData.category = category as ModuleCategory;
    if (targetAudience !== undefined && targetAudience !== null) updateData.targetAudience = targetAudience;
    if (trackId !== undefined && trackId !== null) updateData.trackId = trackId;
    if (order !== undefined && order !== null) updateData.order = parseInt(order as string);
    if (isPublished !== undefined && isPublished !== null) updateData.isPublished = isPublished === "true" || isPublished === true;
    if (sessionId !== undefined && sessionId !== null) updateData.sessionId = sessionId;
    if (weekNumber !== undefined && weekNumber !== null) updateData.weekNumber = parseInt(weekNumber as string);
    if (startDate !== undefined && startDate !== null) updateData.startDate = new Date(startDate as string);

    // Update module
    await db
      .update(schema.modules)
      .set(updateData)
      .where(eq(schema.modules.id, id));

    // Fetch updated module with relations
    const [updatedModule] = await db
      .select()
      .from(schema.modules)
      .where(eq(schema.modules.id, id))
      .limit(1);

    const [track] = await db
      .select({ id: schema.tracks.id, name: schema.tracks.name })
      .from(schema.tracks)
      .where(eq(schema.tracks.id, updatedModule.trackId))
      .limit(1);

    let session_data = null;
    if (updatedModule.sessionId) {
      const [sess] = await db
        .select({ id: schema.liveSessions.id, title: schema.liveSessions.title })
        .from(schema.liveSessions)
        .where(eq(schema.liveSessions.id, updatedModule.sessionId))
        .limit(1);
      session_data = sess;
    }

    const contentItems = await db
      .select()
      .from(schema.contentItems)
      .where(eq(schema.contentItems.moduleId, id))
      .orderBy(asc(schema.contentItems.order));

    const tasks = await db
      .select()
      .from(schema.tasks)
      .where(eq(schema.tasks.moduleId, id))
      .orderBy(asc(schema.tasks.order));

    const assignments = await db
      .select()
      .from(schema.assignments)
      .where(eq(schema.assignments.moduleId, id))
      .orderBy(asc(schema.assignments.order));

    const module: any = {
      ...updatedModule,
      track,
      session: session_data,
      contentItems,
      tasks,
      assignments,
    };

    return NextResponse.json({ module, message: "Module updated successfully" });
  } catch (error) {
    console.error("Error updating module:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/modules/[id] - Delete a module (Manager only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only manager and CEO can delete modules
    if (!["manager", "ceo"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    // Check if module exists
    const [existingModule] = await db
      .select()
      .from(schema.modules)
      .where(eq(schema.modules.id, id))
      .limit(1);

    if (!existingModule) {
      return NextResponse.json(
        { error: "Module not found" },
        { status: 404 }
      );
    }

    // Get content items for file deletion
    const contentItems = await db
      .select()
      .from(schema.contentItems)
      .where(eq(schema.contentItems.moduleId, id));

    // Delete all content item files from filesystem
    for (const contentItem of contentItems) {
      try {
        const filePath = path.join(
          process.cwd(),
          "public",
          contentItem.fileUrl
        );
        await unlink(filePath);
      } catch (fileError) {
        console.error("Error deleting file:", fileError);
        // Continue with next file even if one fails
      }
    }

    // Delete module (contentItems, tasks, assignments will cascade delete)
    await db
      .delete(schema.modules)
      .where(eq(schema.modules.id, id));

    return NextResponse.json({ message: "Module deleted successfully" });
  } catch (error) {
    console.error("Error deleting module:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
