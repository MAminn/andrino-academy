import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

// PUT /api/bookings/[id]/notes - Add/update notes on a booking
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: bookingId } = await params;

    // Fetch the booking
    const booking = await prisma.sessionBooking.findUnique({
      where: { id: bookingId },
      include: {
        availability: {
          include: {
            instructor: true,
          },
        },
        student: true,
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { studentNotes, instructorNotes } = body;

    // Permission check - student can only update studentNotes, instructor can only update instructorNotes
    const isStudent = session.user.role === "student" && session.user.id === booking.studentId;
    const isInstructor = session.user.role === "instructor" && session.user.id === booking.availability.instructorId;
    const isAdmin = ["manager", "ceo"].includes(session.user.role);

    if (!isStudent && !isInstructor && !isAdmin) {
      return NextResponse.json(
        { error: "Forbidden. You are not part of this booking." },
        { status: 403 }
      );
    }

    // Build update data based on role
    const updateData: any = {};

    if (isStudent) {
      // Students can only update their own notes
      if (studentNotes !== undefined) {
        updateData.studentNotes = studentNotes;
      }

      if (instructorNotes !== undefined) {
        return NextResponse.json(
          { error: "Students cannot update instructor notes" },
          { status: 403 }
        );
      }
    } else if (isInstructor) {
      // Instructors can only update their own notes
      if (instructorNotes !== undefined) {
        updateData.instructorNotes = instructorNotes;
      }

      if (studentNotes !== undefined) {
        return NextResponse.json(
          { error: "Instructors cannot update student notes" },
          { status: 403 }
        );
      }
    } else if (isAdmin) {
      // Admins can update both
      if (studentNotes !== undefined) updateData.studentNotes = studentNotes;
      if (instructorNotes !== undefined) updateData.instructorNotes = instructorNotes;
    }

    // Update booking
    const updatedBooking = await prisma.sessionBooking.update({
      where: { id: bookingId },
      data: updateData,
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        availability: {
          include: {
            instructor: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        track: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: "Notes updated successfully",
      booking: updatedBooking,
    });
  } catch (error) {
    console.error("Error updating booking notes:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
