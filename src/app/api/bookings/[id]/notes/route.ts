import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db, schema, eq } from "@/lib/db";

// PUT /api/bookings/[id]/notes - Add/update notes on a booking
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: bookingId } = await params;

    // Fetch the booking
    const [bookingData] = await db
      .select({
        id: schema.sessionBookings.id,
        studentId: schema.sessionBookings.studentId,
        availabilityId: schema.sessionBookings.availabilityId,
        studentNotes: schema.sessionBookings.studentNotes,
        instructorNotes: schema.sessionBookings.instructorNotes,
      })
      .from(schema.sessionBookings)
      .where(eq(schema.sessionBookings.id, bookingId))
      .limit(1);

    if (!bookingData) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    const availabilityData = await db
      .select({
        id: schema.instructorAvailabilities.id,
        instructorId: schema.instructorAvailabilities.instructorId,
      })
      .from(schema.instructorAvailabilities)
      .where(eq(schema.instructorAvailabilities.id, bookingData.availabilityId))
      .limit(1);

    const availability = availabilityData[0];

    const [instructor] = await db
      .select({ id: schema.users.id, name: schema.users.name })
      .from(schema.users)
      .where(eq(schema.users.id, availability.instructorId))
      .limit(1);

    const [student] = await db
      .select({ id: schema.users.id, name: schema.users.name, email: schema.users.email })
      .from(schema.users)
      .where(eq(schema.users.id, bookingData.studentId))
      .limit(1);

    const booking = {
      ...bookingData,
      availability: { ...availability, instructor },
      student,
    };

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
    await db
      .update(schema.sessionBookings)
      .set(updateData)
      .where(eq(schema.sessionBookings.id, bookingId));

    const [updatedBookingData] = await db
      .select()
      .from(schema.sessionBookings)
      .where(eq(schema.sessionBookings.id, bookingId))
      .limit(1);

    const [updatedStudent] = await db
      .select({ id: schema.users.id, name: schema.users.name, email: schema.users.email })
      .from(schema.users)
      .where(eq(schema.users.id, updatedBookingData.studentId))
      .limit(1);

    const [updatedAvailability] = await db
      .select()
      .from(schema.instructorAvailabilities)
      .where(eq(schema.instructorAvailabilities.id, updatedBookingData.availabilityId))
      .limit(1);

    const [updatedInstructor] = await db
      .select({ id: schema.users.id, name: schema.users.name, email: schema.users.email })
      .from(schema.users)
      .where(eq(schema.users.id, updatedAvailability.instructorId))
      .limit(1);

    const [updatedTrack] = await db
      .select({ id: schema.tracks.id, name: schema.tracks.name })
      .from(schema.tracks)
      .where(eq(schema.tracks.id, updatedAvailability.trackId))
      .limit(1);

    const updatedBooking = {
      ...updatedBookingData,
      student: updatedStudent,
      availability: {
        ...updatedAvailability,
        instructor: updatedInstructor,
        track: updatedTrack,
      },
    };

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
