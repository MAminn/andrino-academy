import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db, schema, eq } from "@/lib/db";

// GET /api/packages/[id] - Get single package
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const [packageData] = await db
      .select()
      .from(schema.packages)
      .where(eq(schema.packages.id, id));

    if (!packageData) {
      return NextResponse.json({ error: "Package not found" }, { status: 404 });
    }

    // Non-managers can only see active packages
    if (!["manager", "ceo"].includes(session.user.role) && !packageData.isActive) {
      return NextResponse.json({ error: "Package not found" }, { status: 404 });
    }

    return NextResponse.json({ package: packageData });
  } catch (error) {
    console.error("Error fetching package:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/packages/[id] - Update package (Manager/CEO only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only manager and CEO can update packages
    if (!["manager", "ceo"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();

    // Check if package exists
    const [existingPackage] = await db
      .select()
      .from(schema.packages)
      .where(eq(schema.packages.id, id));

    if (!existingPackage) {
      return NextResponse.json({ error: "Package not found" }, { status: 404 });
    }

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

    // Recalculate price per session if price or sessions changed
    const finalPrice = price !== undefined ? parseFloat(price) : existingPackage.price;
    const finalSessions = sessionsPerLevel !== undefined ? parseInt(sessionsPerLevel) : existingPackage.sessionsPerLevel;
    const pricePerSession = finalPrice / finalSessions;

    // Convert perks array to JSON if provided
    const perksJson = perks ? JSON.stringify(perks) : existingPackage.perks;

    await db
      .update(schema.packages)
      .set({
        name: name || existingPackage.name,
        price: finalPrice,
        discountedPrice: discountedPrice !== undefined ? (discountedPrice ? parseFloat(discountedPrice) : null) : existingPackage.discountedPrice,
        minAge: minAge !== undefined ? parseInt(minAge) : existingPackage.minAge,
        maxAge: maxAge !== undefined ? parseInt(maxAge) : existingPackage.maxAge,
        description: description || existingPackage.description,
        perks: perksJson,
        durationMonths: durationMonths !== undefined ? parseInt(durationMonths) : existingPackage.durationMonths,
        sessionsPerLevel: finalSessions,
        pricePerSession,
        badge: badge !== undefined ? (badge || null) : existingPackage.badge,
        order: order !== undefined ? parseInt(order) : existingPackage.order,
        isActive: isActive !== undefined ? isActive : existingPackage.isActive,
      })
      .where(eq(schema.packages.id, id));

    const [updatedPackage] = await db
      .select()
      .from(schema.packages)
      .where(eq(schema.packages.id, id));

    return NextResponse.json({ package: updatedPackage });
  } catch (error) {
    console.error("Error updating package:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/packages/[id] - Delete package (Manager/CEO only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only manager and CEO can delete packages
    if (!["manager", "ceo"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    // Check if package exists
    const [existingPackage] = await db
      .select()
      .from(schema.packages)
      .where(eq(schema.packages.id, id));

    if (!existingPackage) {
      return NextResponse.json({ error: "Package not found" }, { status: 404 });
    }

    await db.delete(schema.packages).where(eq(schema.packages.id, id));

    return NextResponse.json({ message: "Package deleted successfully" });
  } catch (error) {
    console.error("Error deleting package:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
