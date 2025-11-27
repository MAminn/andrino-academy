import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

// GET /api/sessions/active - Check for active sessions right now
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const currentHour = now.getHours();
    const currentMinutes = now.getMinutes();
    const currentTime = `${String(currentHour).padStart(2, '0')}:${String(currentMinutes).padStart(2, '0')}`;

    let activeSessions: any[] = [];

    if (session.user.role === "instructor") {
      // Find instructor's active sessions (bookings that are happening now)
      const bookings = await prisma.sessionBooking.findMany({
        where: {
          status: "confirmed",
          availability: {
            instructorId: session.user.id,
            weekStartDate: {
              lte: now, // Week has started
            },
          },
        },
        include: {
          student: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          track: {
            select: {
              id: true,
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
              externalLink: true,
              status: true,
            },
          },
        },
      });

      // Filter for sessions happening right now
      activeSessions = bookings.filter(booking => {
        const sessionDate = new Date(booking.availability.weekStartDate);
        sessionDate.setDate(sessionDate.getDate() + booking.availability.dayOfWeek);
        const sessionDateStr = sessionDate.toISOString().split('T')[0];
        
        if (sessionDateStr !== today) return false;
        
        const isActiveNow = currentHour >= booking.availability.startHour && 
                           currentHour < booking.availability.endHour;
        return isActiveNow;
      });

    } else if (session.user.role === "student") {
      // Find student's active sessions
      const bookings = await prisma.sessionBooking.findMany({
        where: {
          studentId: session.user.id,
          status: "confirmed",
        },
        include: {
          track: {
            select: {
              id: true,
              name: true,
              instructor: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
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
              externalLink: true,
              status: true,
            },
          },
        },
      });

      // Filter for sessions happening right now
      activeSessions = bookings.filter(booking => {
        const sessionDate = new Date(booking.availability.weekStartDate);
        sessionDate.setDate(sessionDate.getDate() + booking.availability.dayOfWeek);
        const sessionDateStr = sessionDate.toISOString().split('T')[0];
        
        if (sessionDateStr !== today) return false;
        
        const isActiveNow = currentHour >= booking.availability.startHour && 
                           currentHour < booking.availability.endHour;
        return isActiveNow;
      });
    }

    return NextResponse.json({
      hasActiveSessions: activeSessions.length > 0,
      activeSessions,
      currentTime: now.toISOString(),
    });
  } catch (error) {
    console.error("Error checking active sessions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
