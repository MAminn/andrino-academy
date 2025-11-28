import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

import { db, schema, eq, and, or, desc, asc, count, sql, isNull, gte, lt } from "@/lib/db";

// GET /api/analytics/ceo - Get CEO dashboard analytics
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user) {
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
      totalUsersResult,
      totalStudentsResult,
      totalInstructorsResult,
      totalCoordinatorsResult,
      totalManagersResult,
      studentsThisMonthResult,
      studentsLastMonthResult,
      instructorsThisMonthResult,
    ] = await Promise.all([
      db.select({ count: count() }).from(schema.users),
      db
        .select({ count: count() })
        .from(schema.users)
        .where(eq(schema.users.role, "student")),
      db
        .select({ count: count() })
        .from(schema.users)
        .where(eq(schema.users.role, "instructor")),
      db
        .select({ count: count() })
        .from(schema.users)
        .where(eq(schema.users.role, "coordinator")),
      db
        .select({ count: count() })
        .from(schema.users)
        .where(eq(schema.users.role, "manager")),
      db
        .select({ count: count() })
        .from(schema.users)
        .where(
          and(
            eq(schema.users.role, "student"),
            gte(schema.users.createdAt, startOfMonth)
          )
        ),
      db
        .select({ count: count() })
        .from(schema.users)
        .where(
          and(
            eq(schema.users.role, "student"),
            gte(schema.users.createdAt, lastMonth),
            lt(schema.users.createdAt, startOfMonth)
          )
        ),
      db
        .select({ count: count() })
        .from(schema.users)
        .where(
          and(
            eq(schema.users.role, "instructor"),
            gte(schema.users.createdAt, startOfMonth)
          )
        ),
    ]);

    const totalUsers = totalUsersResult[0]?.count || 0;
    const totalStudents = totalStudentsResult[0]?.count || 0;
    const totalInstructors = totalInstructorsResult[0]?.count || 0;
    const totalCoordinators = totalCoordinatorsResult[0]?.count || 0;
    const totalManagers = totalManagersResult[0]?.count || 0;
    const studentsThisMonth = studentsThisMonthResult[0]?.count || 0;
    const studentsLastMonth = studentsLastMonthResult[0]?.count || 0;
    const instructorsThisMonth = instructorsThisMonthResult[0]?.count || 0;

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
    const [
      totalGradesResult,
      activeGradesResult,
      totalTracksResult,
      activeTracksResult,
    ] = await Promise.all([
      db.select({ count: count() }).from(schema.grades),
      db
        .select({ count: count() })
        .from(schema.grades)
        .where(eq(schema.grades.isActive, true)),
      db.select({ count: count() }).from(schema.tracks),
      db
        .select({ count: count() })
        .from(schema.tracks)
        .where(eq(schema.tracks.isActive, true)),
    ]);

    const totalGrades = totalGradesResult[0]?.count || 0;
    const activeGrades = activeGradesResult[0]?.count || 0;
    const totalTracks = totalTracksResult[0]?.count || 0;
    const activeTracks = activeTracksResult[0]?.count || 0;

    // Get session statistics
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1
    );

    const [
      totalSessionsResult,
      upcomingSessionsResult,
      todaySessionsResult,
      completedSessionsResult,
    ] = await Promise.all([
      db.select({ count: count() }).from(schema.liveSessions),
      db
        .select({ count: count() })
        .from(schema.liveSessions)
        .where(gte(schema.liveSessions.date, now)),
      db
        .select({ count: count() })
        .from(schema.liveSessions)
        .where(
          and(
            gte(schema.liveSessions.date, today),
            lt(schema.liveSessions.date, tomorrow)
          )
        ),
      db
        .select({ count: count() })
        .from(schema.liveSessions)
        .where(lt(schema.liveSessions.date, now)),
    ]);

    const totalSessions = totalSessionsResult[0]?.count || 0;
    const upcomingSessions = upcomingSessionsResult[0]?.count || 0;
    const todaySessions = todaySessionsResult[0]?.count || 0;
    const completedSessions = completedSessionsResult[0]?.count || 0;

    // Get attendance statistics
    const totalAttendanceResult = await db
      .select({ count: count() })
      .from(schema.sessionAttendances)
      .catch(() => [{ count: 0 }]);
    const presentAttendanceResult = await db
      .select({ count: count() })
      .from(schema.sessionAttendances)
      .where(eq(schema.sessionAttendances.status, "present"))
      .catch(() => [{ count: 0 }]);

    const totalAttendance = totalAttendanceResult[0]?.count || 0;
    const presentAttendance = presentAttendanceResult[0]?.count || 0;

    const attendanceRate =
      totalAttendance > 0
        ? Math.round((presentAttendance / totalAttendance) * 100)
        : 0;

    // Get students by grade for distribution analysis
    const studentsByGradeData = await db
      .select({
        id: schema.grades.id,
        name: schema.grades.name,
        order: schema.grades.order,
        isActive: schema.grades.isActive,
      })
      .from(schema.grades)
      .orderBy(asc(schema.grades.order));

    const studentsByGrade = await Promise.all(
      studentsByGradeData.map(async (grade) => {
        const studentCount = await db
          .select({ count: count() })
          .from(schema.users)
          .where(
            and(
              eq(schema.users.role, "student"),
              eq(schema.users.gradeId, grade.id)
            )
          );

        return {
          ...grade,
          _count: { students: studentCount[0]?.count || 0 },
        };
      })
    );

    // Get tracks with student count
    const trackStatsData = await db
      .select({
        id: schema.tracks.id,
        name: schema.tracks.name,
        isActive: schema.tracks.isActive,
        createdAt: schema.tracks.createdAt,
        gradeId: schema.tracks.gradeId,
        instructorId: schema.tracks.instructorId,
      })
      .from(schema.tracks)
      .orderBy(desc(schema.tracks.createdAt))
      .limit(8);

    const trackStats = await Promise.all(
      trackStatsData.map(async (track) => {
        const [sessionCount, grade, instructor] = await Promise.all([
          db
            .select({ count: count() })
            .from(schema.liveSessions)
            .where(eq(schema.liveSessions.trackId, track.id)),
          db
            .select({ name: schema.grades.name })
            .from(schema.grades)
            .where(eq(schema.grades.id, track.gradeId))
            .limit(1),
          db
            .select({ name: schema.users.name })
            .from(schema.users)
            .where(eq(schema.users.id, track.instructorId))
            .limit(1),
        ]);

        return {
          ...track,
          _count: { liveSessions: sessionCount[0]?.count || 0 },
          grade: { name: grade[0]?.name || "" },
          instructor: { name: instructor[0]?.name || "" },
        };
      })
    );

    // System health indicators
    const unassignedStudentsResult = await db
      .select({ count: count() })
      .from(schema.users)
      .where(
        and(eq(schema.users.role, "student"), isNull(schema.users.gradeId))
      );

    const unassignedStudents = unassignedStudentsResult[0]?.count || 0;

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
        studentsByGrade: studentsByGrade.map((grade: any) => ({
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
      trackPerformance: trackStats.map((track: any) => ({
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

