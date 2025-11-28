import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db, schema, eq, asc, desc } from "@/lib/db";

// GET /api/packages - Get all packages
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Managers and CEOs see all packages, others see only active ones
    const isAdmin = ["manager", "ceo"].includes(session.user.role);

    let packages;
    if (isAdmin) {
      packages = await db.select().from(schema.packages).orderBy(asc(schema.packages.order));
    } else {
      packages = await db
        .select()
        .from(schema.packages)
        .where(eq(schema.packages.isActive, true))
        .orderBy(asc(schema.packages.order));
    }

    return NextResponse.json({ packages });
  } catch (error) {
    console.error("Error fetching packages:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/packages - Create a new package (Manager/CEO only)
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only manager and CEO can create packages
    if (!["manager", "ceo"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const {
      name,
      price,
      discountedPrice,
      minAge,
      maxAge,
      description,
      perks,
      durationMonths,
      sessionsPerLevel,
      badge,
      order,
      isActive,
    } = body;

    // Validation
    if (!name || price === undefined || !minAge || !maxAge || !description || !perks || !durationMonths || !sessionsPerLevel) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Calculate price per session
    const pricePerSession = price / sessionsPerLevel;

    // Convert perks array to JSON string for storage
    const perksJson = JSON.stringify(perks);

    await db.insert(schema.packages).values({
      name,
      price: parseFloat(price),
      discountedPrice: discountedPrice ? parseFloat(discountedPrice) : null,
      minAge: parseInt(minAge),
      maxAge: parseInt(maxAge),
      description,
      perks: perksJson,
      durationMonths: parseInt(durationMonths),
      sessionsPerLevel: parseInt(sessionsPerLevel),
      pricePerSession,
      badge: badge || null,
      order: order !== undefined ? parseInt(order) : 0,
      isActive: isActive !== undefined ? isActive : true,
    });

    const [newPackage] = await db
      .select()
      .from(schema.packages)
      .where(eq(schema.packages.name, name))
      .orderBy(desc(schema.packages.createdAt))
      .limit(1);

    return NextResponse.json({ package: newPackage }, { status: 201 });
  } catch (error) {
    console.error("Error creating package:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
