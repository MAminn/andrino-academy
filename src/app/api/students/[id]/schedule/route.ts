import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("start");
    const endDate = searchParams.get("end");

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: "تواريخ البداية والنهاية مطلوبة" },
        { status: 400 }
      );
    }

    // Get student with their sessions for the specified week
    const student = await prisma.user.findUnique({
      where: { id },
      include: {
        grade: {
          include: {
            tracks: {
              include: {
                liveSessions: {
                  where: {
                    date: {
                      gte: new Date(startDate),
                      lte: new Date(endDate),
                    },
                  },
                  include: {
                    track: {
                      include: {
                        instructor: true,
                        grade: true,
                      },
                    },
                    attendances: {
                      where: { studentId: id },
                    },
                  },
                  orderBy: [{ date: "asc" }, { startTime: "asc" }],
                },
              },
            },
          },
        },
      },
    });

    if (!student) {
      return NextResponse.json({ error: "الطالب غير موجود" }, { status: 404 });
    }

    // Flatten all sessions from all tracks
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const allSessions: any[] = [];
    if (student.grade?.tracks) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      student.grade.tracks.forEach((track: any) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        track.liveSessions.forEach((session: any) => {
          allSessions.push({
            id: session.id,
            title: session.title,
            trackName: track.name,
            date: session.date,
            startTime: session.startTime,
            endTime: session.endTime,
            location: session.location || "عبر الإنترنت",
            instructor: track.instructor?.name || "غير محدد",
            status: session.status,
            attendanceStatus: session.attendances[0]?.status,
            meetLink: session.meetLink,
          });
        });
      });
    }

    const scheduleData = {
      weekStart: startDate,
      weekEnd: endDate,
      sessions: allSessions,
    };

    return NextResponse.json(scheduleData);
  } catch (error) {
    console.error("Error fetching student schedule:", error);
    return NextResponse.json(
      { error: "فشل في جلب الجدول الأسبوعي" },
      { status: 500 }
    );
  }
}
