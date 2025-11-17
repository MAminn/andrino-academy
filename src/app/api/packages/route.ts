import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

// GET /api/packages - Get all packages
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Managers and CEOs see all packages, others see only active ones
    const where = ["manager", "ceo"].includes(session.user.role)
      ? {}
      : { isActive: true };

    const packages = await prisma.package.findMany({
      where,
      orderBy: { order: "asc" },
    });

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
    const session = await getServerSession(authOptions);

    if (!session) {
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

    const newPackage = await prisma.package.create({
      data: {
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
      },
    });

    return NextResponse.json({ package: newPackage }, { status: 201 });
  } catch (error) {
    console.error("Error creating package:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
