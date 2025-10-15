import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

// GET /api/analytics/coordinator - Get coordinator dashboard analytics
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only coordinators, managers, and CEOs can access these analytics
    if (!["coordinator", "manager", "ceo"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    // Get comprehensive track statistics
    const tracks = await prisma.track.findMany({
      include: {
        grade: {
          select: { id: true, name: true, order: true },
        },
        instructor: {
          select: { id: true, name: true, email: true },
        },
        coordinator: {
          select: { id: true, name: true, email: true },
        },
        liveSessions: {
          select: {
            id: true,
            title: true,
            date: true,
            startTime: true,
            endTime: true,
            status: true,
            _count: {
              select: { attendances: true },
            },
          },
          orderBy: { date: "asc" },
        },
        _count: {
          select: {
            liveSessions: true,
          },
        },
      },
      orderBy: [{ grade: { order: "asc" } }, { name: "asc" }],
    });

    // Get today's sessions with detailed info
    const todaySessions = await prisma.liveSession.findMany({
      where: {
        date: {
          gte: today,
          lt: tomorrow,
        },
      },
      include: {
        track: {
          include: {
            grade: { select: { name: true } },
            instructor: { select: { name: true, email: true } },
          },
        },
        _count: {
          select: { attendances: true },
        },
      },
      orderBy: { startTime: "asc" },
    });

    // Get upcoming sessions (next 7 days)
    const upcomingSessions = await prisma.liveSession.findMany({
      where: {
        date: {
          gte: tomorrow,
          lte: nextWeek,
        },
      },
      include: {
        track: {
          include: {
            grade: { select: { name: true } },
            instructor: { select: { name: true, email: true } },
          },
        },
        _count: {
          select: { attendances: true },
        },
      },
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
    });

    // Get instructor workload analysis
    const instructors = await prisma.user.findMany({
      where: { role: "instructor" },
      include: {
        instructedTracks: {
          include: {
            _count: {
              select: { liveSessions: true },
            },
          },
        },
        instructedSessions: {
          where: {
            date: { gte: today },
          },
          select: {
            id: true,
            date: true,
            startTime: true,
            endTime: true,
            status: true,
          },
        },
      },
    });

    // Calculate instructor workload
    const instructorWorkload = instructors.map((instructor) => {
      const totalTracks = instructor.instructedTracks.length;
      const totalUpcomingSessions = instructor.instructedSessions.length;
      const activeSessions = instructor.instructedSessions.filter(
        (s) => s.status === "active"
      ).length;

      return {
        id: instructor.id,
        name: instructor.name,
        email: instructor.email,
        totalTracks,
        totalUpcomingSessions,
        activeSessions,
        workloadScore: Math.min(
          100,
          totalUpcomingSessions * 10 + totalTracks * 5
        ),
      };
    });

    // Get session status distribution
    const sessionStats = {
      total: await prisma.liveSession.count(),
      scheduled: await prisma.liveSession.count({
        where: { status: "scheduled" },
      }),
      active: await prisma.liveSession.count({ where: { status: "active" } }),
      completed: await prisma.liveSession.count({
        where: { status: "completed" },
      }),
      cancelled: await prisma.liveSession.count({
        where: { status: "cancelled" },
      }),
    };

    // Get attendance analytics
    const attendanceStats = await prisma.sessionAttendance
      .groupBy({
        by: ["status"],
        _count: {
          status: true,
        },
      })
      .catch(() => []);

    const attendanceData = {
      total: attendanceStats.reduce((sum, stat) => sum + stat._count.status, 0),
      present:
        attendanceStats.find((s) => s.status === "present")?._count.status || 0,
      absent:
        attendanceStats.find((s) => s.status === "absent")?._count.status || 0,
      late:
        attendanceStats.find((s) => s.status === "late")?._count.status || 0,
    };

    const attendanceRate =
      attendanceData.total > 0
        ? Math.round((attendanceData.present / attendanceData.total) * 100)
        : 0;

    // Get grade distribution
    const gradeStats = await prisma.grade.findMany({
      include: {
        tracks: {
          include: {
            _count: {
              select: { liveSessions: true },
            },
          },
        },
        _count: {
          select: {
            students: true,
            tracks: true,
          },
        },
      },
      orderBy: { order: "asc" },
    });

    // Calculate scheduling efficiency
    const totalScheduledHours = todaySessions.reduce((total, session) => {
      const start = new Date(`2000-01-01T${session.startTime}`);
      const end = new Date(`2000-01-01T${session.endTime}`);
      return total + (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    }, 0);

    const analytics = {
      trackStatistics: {
        total: tracks.length,
        active: tracks.filter((t) => t.isActive).length,
        inactive: tracks.filter((t) => !t.isActive).length,
        byGrade: gradeStats.map((grade) => ({
          gradeId: grade.id,
          gradeName: grade.name,
          trackCount: grade._count.tracks,
          studentCount: grade._count.students,
          totalSessions: grade.tracks.reduce(
            (sum, track) => sum + track._count.liveSessions,
            0
          ),
        })),
      },
      sessionStatistics: {
        today: {
          total: todaySessions.length,
          scheduled: todaySessions.filter((s) => s.status === "scheduled")
            .length,
          active: todaySessions.filter((s) => s.status === "active").length,
          completed: todaySessions.filter((s) => s.status === "completed")
            .length,
          totalHours: totalScheduledHours,
        },
        upcoming: {
          total: upcomingSessions.length,
          thisWeek: upcomingSessions.length,
        },
        overall: sessionStats,
      },
      instructorAnalytics: {
        total: instructors.length,
        workload: instructorWorkload,
        averageWorkload:
          instructorWorkload.length > 0
            ? Math.round(
                instructorWorkload.reduce(
                  (sum, i) => sum + i.workloadScore,
                  0
                ) / instructorWorkload.length
              )
            : 0,
      },
      attendanceAnalytics: {
        ...attendanceData,
        rate: attendanceRate,
      },
      realtimeMetrics: {
        lastUpdated: now.toISOString(),
        activeSessions: sessionStats.active,
        schedulingEfficiency: Math.min(
          100,
          Math.round(
            (todaySessions.length / Math.max(instructors.length, 1)) * 100
          )
        ),
      },
    };

    return NextResponse.json({ analytics });
  } catch (error) {
    console.error("Error fetching coordinator analytics:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
