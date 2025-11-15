import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

// POST /api/modules/[id]/attach - Attach a module to another module (Manager only)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only manager and CEO can attach modules
    if (!["manager", "ceo"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { attachedModuleId, order } = body;

    // Validation
    if (!attachedModuleId) {
      return NextResponse.json(
        { error: "attachedModuleId is required" },
        { status: 400 }
      );
    }

    // Check if parent module exists
    const parentModule = await prisma.module.findUnique({
      where: { id },
    });

    if (!parentModule) {
      return NextResponse.json(
        { error: "Parent module not found" },
        { status: 404 }
      );
    }

    // Check if attached module exists
    const attachedModule = await prisma.module.findUnique({
      where: { id: attachedModuleId },
    });

    if (!attachedModule) {
      return NextResponse.json(
        { error: "Attached module not found" },
        { status: 404 }
      );
    }

    // Prevent self-attachment
    if (id === attachedModuleId) {
      return NextResponse.json(
        { error: "Cannot attach a module to itself" },
        { status: 400 }
      );
    }

    // Check if attachment already exists
    const existingAttachment = await prisma.moduleAttachment.findUnique({
      where: {
        parentModuleId_attachedModuleId: {
          parentModuleId: id,
          attachedModuleId,
        },
      },
    });

    if (existingAttachment) {
      return NextResponse.json(
        { error: "This module is already attached" },
        { status: 400 }
      );
    }

    // Create attachment
    const attachment = await prisma.moduleAttachment.create({
      data: {
        parentModuleId: id,
        attachedModuleId,
        order: order || 0,
      },
      include: {
        parentModule: {
          select: {
            id: true,
            title: true,
            type: true,
          },
        },
        attachedModule: {
          select: {
            id: true,
            title: true,
            type: true,
            fileUrl: true,
            fileName: true,
            category: true,
          },
        },
      },
    });

    return NextResponse.json(
      { attachment, message: "Module attached successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error attaching module:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET /api/modules/[id]/attach - Get all attachments for a module
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Check if module exists
    const module = await prisma.module.findUnique({
      where: { id },
    });

    if (!module) {
      return NextResponse.json(
        { error: "Module not found" },
        { status: 404 }
      );
    }

    // Get all attachments
    const attachments = await prisma.moduleAttachment.findMany({
      where: { parentModuleId: id },
      include: {
        attachedModule: true,
      },
      orderBy: { order: "asc" },
    });

    return NextResponse.json({ attachments });
  } catch (error) {
    console.error("Error fetching attachments:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/modules/[id]/attach - Remove an attachment
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only manager and CEO can remove attachments
    if (!["manager", "ceo"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const attachedModuleId = searchParams.get("attachedModuleId");

    if (!attachedModuleId) {
      return NextResponse.json(
        { error: "attachedModuleId is required" },
        { status: 400 }
      );
    }

    // Check if attachment exists
    const existingAttachment = await prisma.moduleAttachment.findUnique({
      where: {
        parentModuleId_attachedModuleId: {
          parentModuleId: id,
          attachedModuleId,
        },
      },
    });

    if (!existingAttachment) {
      return NextResponse.json(
        { error: "Attachment not found" },
        { status: 404 }
      );
    }

    // Delete attachment
    await prisma.moduleAttachment.delete({
      where: {
        parentModuleId_attachedModuleId: {
          parentModuleId: id,
          attachedModuleId,
        },
      },
    });

    return NextResponse.json({ message: "Attachment removed successfully" });
  } catch (error) {
    console.error("Error removing attachment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
