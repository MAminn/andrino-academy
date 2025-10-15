import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

// GET /api/analytics/instructor - Get instructor-specific analytics
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only instructors can access their own analytics
    if (session.user.role !== "instructor") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const instructorId = session.user.id;
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get("timeRange") || "month"; // week, month, quarter

    // Calculate date range
    const now = new Date();
    const startDate = new Date();

    switch (timeRange) {
      case "week":
        startDate.setDate(now.getDate() - 7);
        break;
      case "quarter":
        startDate.setMonth(now.getMonth() - 3);
        break;
      default: // month
        startDate.setMonth(now.getMonth() - 1);
        break;
    }

    // Get instructor's tracks and related data
    const instructorTracks = await prisma.track.findMany({
      where: { instructorId },
      include: {
        grade: {
          select: { id: true, name: true },
        },
        liveSessions: {
          where: {
            date: {
              gte: startDate,
            },
          },
          include: {
            attendances: {
              include: {
                student: {
                  select: { id: true, name: true },
                },
              },
            },
          },
        },
        _count: {
          select: {
            liveSessions: true,
          },
        },
      },
    });

    // Get students in instructor's tracks (via grade assignments)
    const trackGradeIds = instructorTracks.map((track) => track.gradeId);
    const students = await prisma.user.findMany({
      where: {
        role: "student",
        gradeId: {
          in: trackGradeIds,
        },
      },
      select: {
        id: true,
        name: true,
        gradeId: true,
        sessionAttendances: {
          where: {
            session: {
              trackId: {
                in: instructorTracks.map((t) => t.id),
              },
              date: {
                gte: startDate,
              },
            },
          },
          include: {
            session: {
              select: {
                id: true,
                title: true,
                date: true,
                trackId: true,
              },
            },
          },
        },
      },
    });

    // Calculate teaching effectiveness metrics
    const totalSessions = instructorTracks.reduce(
      (sum, track) => sum + track.liveSessions.length,
      0
    );

    const totalScheduledSessions = instructorTracks.reduce(
      (sum, track) => sum + track._count.liveSessions,
      0
    );

    const completedSessions = instructorTracks.reduce(
      (sum, track) =>
        sum + track.liveSessions.filter((s) => s.status === "completed").length,
      0
    );

    const totalAttendances = instructorTracks.reduce(
      (sum, track) =>
        sum +
        track.liveSessions.reduce(
          (sessionSum, session) => sessionSum + session.attendances.length,
          0
        ),
      0
    );

    const totalPossibleAttendances = instructorTracks.reduce(
      (sum, track) =>
        sum +
        track.liveSessions.reduce(
          (sessionSum, session) => sessionSum + session.attendances.length,
          0
        ),
      0
    );

    // Calculate attendance rate
    const attendanceRate =
      totalPossibleAttendances > 0
        ? (totalAttendances / totalPossibleAttendances) * 100
        : 0;

    // Calculate session completion rate
    const sessionCompletionRate =
      totalScheduledSessions > 0
        ? (completedSessions / totalScheduledSessions) * 100
        : 0;

    // Student performance analysis
    const studentPerformance = students.map((student) => {
      const attendanceRecords = student.sessionAttendances;
      const presentCount = attendanceRecords.filter(
        (a) => a.status === "present"
      ).length;
      const totalSessions = attendanceRecords.length;
      const attendancePercentage =
        totalSessions > 0 ? (presentCount / totalSessions) * 100 : 0;

      return {
        studentId: student.id,
        studentName: student.name,
        gradeId: student.gradeId,
        totalSessions,
        presentCount,
        attendancePercentage,
        recentAttendance: attendanceRecords.slice(-5).map((a) => ({
          sessionId: a.session.id,
          sessionTitle: a.session.title,
          date: a.session.date,
          status: a.status,
        })),
      };
    });

    // Session analytics by track
    const trackAnalytics = instructorTracks.map((track) => {
      const sessions = track.liveSessions;
      const totalTrackSessions = sessions.length;
      const completedTrackSessions = sessions.filter(
        (s) => s.status === "completed"
      ).length;
      const avgAttendancePerSession =
        sessions.length > 0
          ? sessions.reduce((sum, s) => sum + s.attendances.length, 0) /
            sessions.length
          : 0;

      // Get students assigned to this track's grade
      const trackStudents = students.filter((s) => s.gradeId === track.gradeId);

      return {
        trackId: track.id,
        trackName: track.name,
        gradeName: track.grade.name,
        totalSessions: totalTrackSessions,
        completedSessions: completedTrackSessions,
        completionRate:
          totalTrackSessions > 0
            ? (completedTrackSessions / totalTrackSessions) * 100
            : 0,
        avgAttendancePerSession: Math.round(avgAttendancePerSession),
        enrolledStudents: trackStudents.length,
        recentSessions: sessions.slice(-3).map((s) => ({
          id: s.id,
          title: s.title,
          date: s.date,
          status: s.status,
          attendanceCount: s.attendances.length,
        })),
      };
    });

    // Weekly session distribution
    const sessionsByWeek: { [key: string]: number } = {};
    instructorTracks.forEach((track) => {
      track.liveSessions.forEach((session) => {
        const week = new Date(session.date).toISOString().substr(0, 10);
        if (!sessionsByWeek[week]) {
          sessionsByWeek[week] = 0;
        }
        sessionsByWeek[week]++;
      });
    });

    // Attendance trends
    const attendanceTrends = Object.keys(sessionsByWeek)
      .map((date) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const sessionsOnDate = instructorTracks.reduce((acc: any[], track) => {
          const dateSessions = track.liveSessions.filter(
            (s) => s.date.toISOString().substr(0, 10) === date
          );
          return acc.concat(dateSessions);
        }, []);

        const totalAttendanceOnDate = sessionsOnDate.reduce(
          (sum, session) =>
            sum +
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            session.attendances.filter((a: any) => a.status === "present")
              .length,
          0
        );

        const totalPossibleOnDate = sessionsOnDate.reduce(
          (sum, session) => sum + session.attendances.length,
          0
        );

        return {
          date,
          sessionsCount: sessionsOnDate.length,
          totalAttendance: totalAttendanceOnDate,
          attendanceRate:
            totalPossibleOnDate > 0
              ? (totalAttendanceOnDate / totalPossibleOnDate) * 100
              : 0,
        };
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Top performing students
    const topStudents = studentPerformance
      .filter((s) => s.totalSessions >= 3) // At least 3 sessions
      .sort((a, b) => b.attendancePercentage - a.attendancePercentage)
      .slice(0, 5);

    // Students needing attention (low attendance)
    const studentsNeedingAttention = studentPerformance
      .filter((s) => s.totalSessions >= 3 && s.attendancePercentage < 70)
      .sort((a, b) => a.attendancePercentage - b.attendancePercentage)
      .slice(0, 5);

    // Overall instructor effectiveness score
    const effectivenessFactors = [
      sessionCompletionRate,
      attendanceRate,
      Math.min(100, (totalSessions / 30) * 100), // Activity score (max 30 sessions per month)
    ];

    const effectivenessScore =
      effectivenessFactors.reduce((sum, factor) => sum + factor, 0) /
      effectivenessFactors.length;

    const analytics = {
      overview: {
        totalTracks: instructorTracks.length,
        totalStudents: students.length,
        totalSessions,
        completedSessions,
        sessionCompletionRate: Math.round(sessionCompletionRate),
        attendanceRate: Math.round(attendanceRate),
        effectivenessScore: Math.round(effectivenessScore),
      },
      trackAnalytics,
      studentPerformance: {
        totalStudents: students.length,
        averageAttendance: Math.round(
          studentPerformance.reduce(
            (sum, s) => sum + s.attendancePercentage,
            0
          ) / Math.max(students.length, 1)
        ),
        topStudents,
        studentsNeedingAttention,
      },
      trends: {
        sessionsByWeek: Object.entries(sessionsByWeek).map(([date, count]) => ({
          date,
          sessions: count,
        })),
        attendanceTrends,
      },
      timeRange,
      lastUpdated: new Date().toISOString(),
    };

    return NextResponse.json(analytics);
  } catch (error) {
    console.error("Error fetching instructor analytics:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
