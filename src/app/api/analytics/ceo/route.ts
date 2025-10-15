import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

// GET /api/analytics/ceo - Get CEO dashboard analytics
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only CEO can access these analytics
    if (session.user.role !== "ceo") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get current date ranges
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    // Get user statistics
    const [
      totalUsers,
      totalStudents,
      totalInstructors,
      totalCoordinators,
      totalManagers,
      studentsThisMonth,
      studentsLastMonth,
      instructorsThisMonth,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: "student" } }),
      prisma.user.count({ where: { role: "instructor" } }),
      prisma.user.count({ where: { role: "coordinator" } }),
      prisma.user.count({ where: { role: "manager" } }),
      prisma.user.count({
        where: {
          role: "student",
          createdAt: { gte: startOfMonth },
        },
      }),
      prisma.user.count({
        where: {
          role: "student",
          createdAt: { gte: lastMonth, lt: startOfMonth },
        },
      }),
      prisma.user.count({
        where: {
          role: "instructor",
          createdAt: { gte: startOfMonth },
        },
      }),
    ]);

    // Calculate growth percentages
    const studentGrowth =
      studentsLastMonth > 0
        ? Math.round(
            ((studentsThisMonth - studentsLastMonth) / studentsLastMonth) * 100
          )
        : studentsThisMonth > 0
        ? 100
        : 0;

    // Get grade and track statistics
    const [totalGrades, activeGrades, totalTracks, activeTracks] =
      await Promise.all([
        prisma.grade.count(),
        prisma.grade.count({ where: { isActive: true } }),
        prisma.track.count(),
        prisma.track.count({ where: { isActive: true } }),
      ]);

    // Get session statistics
    const [totalSessions, upcomingSessions, todaySessions, completedSessions] =
      await Promise.all([
        prisma.liveSession.count(),
        prisma.liveSession.count({
          where: { date: { gte: now } },
        }),
        prisma.liveSession.count({
          where: {
            date: {
              gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
              lt: new Date(
                now.getFullYear(),
                now.getMonth(),
                now.getDate() + 1
              ),
            },
          },
        }),
        prisma.liveSession.count({
          where: { date: { lt: now } },
        }),
      ]);

    // Get attendance statistics
    const totalAttendance = await prisma.sessionAttendance
      .count()
      .catch(() => 0);
    const presentAttendance = await prisma.sessionAttendance
      .count({
        where: { status: "present" },
      })
      .catch(() => 0);

    const attendanceRate =
      totalAttendance > 0
        ? Math.round((presentAttendance / totalAttendance) * 100)
        : 0;

    // Get students by grade for distribution analysis
    const studentsByGrade = await prisma.grade.findMany({
      include: {
        _count: {
          select: { students: true },
        },
      },
      orderBy: { order: "asc" },
    });

    // Get tracks with student count
    const trackStats = await prisma.track.findMany({
      include: {
        _count: {
          select: { liveSessions: true },
        },
        grade: {
          select: { name: true },
        },
        instructor: {
          select: { name: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 8, // Top 8 tracks
    });

    // System health indicators
    const unassignedStudents = await prisma.user.count({
      where: {
        role: "student",
        gradeId: null,
      },
    });

    const inactiveTracks = totalTracks - activeTracks;
    const inactiveGrades = totalGrades - activeGrades;

    // Calculate system health score
    const healthScore = Math.round(
      ((activeGrades / Math.max(totalGrades, 1)) * 0.3 +
        (activeTracks / Math.max(totalTracks, 1)) * 0.3 +
        ((totalStudents - unassignedStudents) / Math.max(totalStudents, 1)) *
          0.4) *
        100
    );

    const analytics = {
      userStatistics: {
        totalUsers,
        totalStudents,
        totalInstructors,
        totalCoordinators,
        totalManagers,
        studentsThisMonth,
        studentGrowth,
        instructorsThisMonth,
        unassignedStudents,
      },
      academicStatistics: {
        totalGrades,
        activeGrades,
        inactiveGrades,
        totalTracks,
        activeTracks,
        inactiveTracks,
        studentsByGrade: studentsByGrade.map((grade) => ({
          name: grade.name,
          studentCount: grade._count.students,
          isActive: grade.isActive,
        })),
      },
      sessionStatistics: {
        totalSessions,
        upcomingSessions,
        todaySessions,
        completedSessions,
        attendanceRate,
        totalAttendance,
        presentAttendance,
      },
      trackPerformance: trackStats.map((track) => ({
        id: track.id,
        name: track.name,
        gradeName: track.grade.name,
        instructorName: track.instructor.name,
        sessionCount: track._count.liveSessions,
        isActive: track.isActive,
      })),
      systemHealth: {
        score: healthScore,
        indicators: {
          activeGrades: Math.round(
            (activeGrades / Math.max(totalGrades, 1)) * 100
          ),
          activeTracks: Math.round(
            (activeTracks / Math.max(totalTracks, 1)) * 100
          ),
          assignedStudents: Math.round(
            ((totalStudents - unassignedStudents) /
              Math.max(totalStudents, 1)) *
              100
          ),
          attendanceRate,
        },
      },
      realtimeMetrics: {
        lastUpdated: now.toISOString(),
        serverStatus: "operational",
        databaseConnections: 1, // Simplified
        activeUsers: totalUsers, // Simplified - in real app, track active sessions
      },
    };

    return NextResponse.json({ analytics });
  } catch (error) {
    console.error("Error fetching CEO analytics:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
