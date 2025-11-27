import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

// POST /api/sessions/feedback - Submit feedback after session
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { bookingId, feedback, type } = body; // type: 'student' or 'instructor'

    if (!bookingId || !feedback) {
      return NextResponse.json(
        { error: "bookingId and feedback are required" },
        { status: 400 }
      );
    }

    // Get the booking
    const booking = await prisma.sessionBooking.findUnique({
      where: { id: bookingId },
      include: {
        availability: {
          select: {
            instructorId: true,
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    // Verify user has permission to leave feedback
    if (type === "student" && booking.studentId !== session.user.id) {
      return NextResponse.json(
        { error: "You can only leave feedback for your own sessions" },
        { status: 403 }
      );
    }

    if (type === "instructor" && booking.availability.instructorId !== session.user.id) {
      return NextResponse.json(
        { error: "You can only leave feedback for your own sessions" },
        { status: 403 }
      );
    }

    // Update booking with feedback
    const updatedBooking = await prisma.sessionBooking.update({
      where: { id: bookingId },
      data: {
        ...(type === "student" && {
          studentNotes: feedback,
          feedbackGivenAt: new Date(),
        }),
        ...(type === "instructor" && {
          instructorNotes: feedback,
        }),
        status: "completed",
      },
      include: {
        student: {
          select: {
            name: true,
          },
        },
        availability: {
          select: {
            instructor: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      message: "Feedback submitted successfully",
      booking: updatedBooking,
    });
  } catch (error) {
    console.error("Error submitting feedback:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET /api/sessions/feedback - Get pending feedback requests
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    
    let pendingFeedback: any[] = [];

    if (session.user.role === "instructor") {
      // Find completed sessions without instructor feedback
      const bookings = await prisma.sessionBooking.findMany({
        where: {
          status: "confirmed",
          instructorNotes: null, // No feedback yet
          availability: {
            instructorId: session.user.id,
          },
          session: {
            status: "COMPLETED",
          },
        },
        include: {
          student: {
            select: {
              id: true,
              name: true,
            },
          },
          track: {
            select: {
              name: true,
            },
          },
          availability: {
            select: {
              weekStartDate: true,
              dayOfWeek: true,
              startHour: true,
              endHour: true,
            },
          },
          session: {
            select: {
              id: true,
              title: true,
              date: true,
            },
          },
        },
      });

      pendingFeedback = bookings;

    } else if (session.user.role === "student") {
      // Find completed sessions without student feedback
      const bookings = await prisma.sessionBooking.findMany({
        where: {
          studentId: session.user.id,
          status: "confirmed",
          feedbackGivenAt: null, // No feedback yet
          session: {
            status: "COMPLETED",
          },
        },
        include: {
          track: {
            select: {
              name: true,
            },
          },
          availability: {
            select: {
              weekStartDate: true,
              dayOfWeek: true,
              startHour: true,
              endHour: true,
              instructor: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          session: {
            select: {
              id: true,
              title: true,
              date: true,
            },
          },
        },
      });

      pendingFeedback = bookings;
    }

    return NextResponse.json({
      pendingFeedback,
      count: pendingFeedback.length,
    });
  } catch (error) {
    console.error("Error fetching pending feedback:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
