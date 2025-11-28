import { NextResponse, NextRequest } from "next/server";
import { auth } from "@/lib/auth";

import { db, schema, eq, and, or, desc, asc, count, sql, isNull, gte, lte, lt } from "@/lib/db";

// GET /api/analytics/coordinator - Get coordinator dashboard analytics
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user) {
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
    const tracksData = await db
      .select({
        id: schema.tracks.id,
        name: schema.tracks.name,
        gradeId: schema.tracks.gradeId,
        instructorId: schema.tracks.instructorId,
        coordinatorId: schema.tracks.coordinatorId,
      })
      .from(schema.tracks);

    const tracks = await Promise.all(
      tracksData.map(async (track) => {
        const [grade] = await db
          .select({ id: schema.grades.id, name: schema.grades.name, order: schema.grades.order })
          .from(schema.grades)
          .where(eq(schema.grades.id, track.gradeId))
          .limit(1);

        const [instructor] = await db
          .select({ id: schema.users.id, name: schema.users.name, email: schema.users.email })
          .from(schema.users)
          .where(eq(schema.users.id, track.instructorId))
          .limit(1);

        const [coordinator] = track.coordinatorId
          ? await db
              .select({ id: schema.users.id, name: schema.users.name, email: schema.users.email })
              .from(schema.users)
              .where(eq(schema.users.id, track.coordinatorId))
              .limit(1)
          : [null];

        const liveSessions = await db
          .select({
            id: schema.liveSessions.id,
            title: schema.liveSessions.title,
            date: schema.liveSessions.date,
            startTime: schema.liveSessions.startTime,
            endTime: schema.liveSessions.endTime,
            status: schema.liveSessions.status,
          })
          .from(schema.liveSessions)
          .where(eq(schema.liveSessions.trackId, track.id))
          .orderBy(asc(schema.liveSessions.date));

        const sessionsWithCounts = await Promise.all(
          liveSessions.map(async (session) => {
            const attendanceCount = await db
              .select({ count: count() })
              .from(schema.sessionAttendances)
              .where(eq(schema.sessionAttendances.sessionId, session.id));

            return {
              ...session,
              _count: { attendances: attendanceCount[0]?.count || 0 },
            };
          })
        );

        return {
          ...track,
          grade,
          instructor,
          coordinator,
          liveSessions: sessionsWithCounts,
          _count: { liveSessions: liveSessions.length },
        };
      })
    );

    tracks.sort((a, b) => {
      const gradeCompare = (a.grade?.order || 0) - (b.grade?.order || 0);
      if (gradeCompare !== 0) return gradeCompare;
      return (a.name || '').localeCompare(b.name || '');
    });

    // Get today's sessions with detailed info
    const todaySessionsData = await db
      .select({
        id: schema.liveSessions.id,
        title: schema.liveSessions.title,
        date: schema.liveSessions.date,
        startTime: schema.liveSessions.startTime,
        endTime: schema.liveSessions.endTime,
        status: schema.liveSessions.status,
        trackId: schema.liveSessions.trackId,
      })
      .from(schema.liveSessions)
      .where(
        and(
          gte(schema.liveSessions.date, today),
          lt(schema.liveSessions.date, tomorrow)
        )
      )
      .orderBy(asc(schema.liveSessions.startTime));

    const todaySessions = await Promise.all(
      todaySessionsData.map(async (session) => {
        const [track] = await db
          .select({
            id: schema.tracks.id,
            name: schema.tracks.name,
            gradeId: schema.tracks.gradeId,
            instructorId: schema.tracks.instructorId,
          })
          .from(schema.tracks)
          .where(eq(schema.tracks.id, session.trackId))
          .limit(1);

        const [grade] = track
          ? await db
              .select({ name: schema.grades.name })
              .from(schema.grades)
              .where(eq(schema.grades.id, track.gradeId))
              .limit(1)
          : [null];

        const [instructor] = track
          ? await db
              .select({ name: schema.users.name, email: schema.users.email })
              .from(schema.users)
              .where(eq(schema.users.id, track.instructorId))
              .limit(1)
          : [null];

        const attendanceCount = await db
          .select({ count: count() })
          .from(schema.sessionAttendances)
          .where(eq(schema.sessionAttendances.sessionId, session.id));

        return {
          ...session,
          track: track
            ? {
                ...track,
                grade,
                instructor,
              }
            : null,
          _count: { attendances: attendanceCount[0]?.count || 0 },
        };
      })
    );

    // Get upcoming sessions (next 7 days)
    const upcomingSessionsData = await db
      .select({
        id: schema.liveSessions.id,
        title: schema.liveSessions.title,
        date: schema.liveSessions.date,
        startTime: schema.liveSessions.startTime,
        endTime: schema.liveSessions.endTime,
        status: schema.liveSessions.status,
        trackId: schema.liveSessions.trackId,
      })
      .from(schema.liveSessions)
      .where(
        and(
          gte(schema.liveSessions.date, tomorrow),
          lte(schema.liveSessions.date, nextWeek)
        )
      )
      .orderBy(asc(schema.liveSessions.date), asc(schema.liveSessions.startTime));

    const upcomingSessions = await Promise.all(
      upcomingSessionsData.map(async (session) => {
        const [track] = await db
          .select({
            id: schema.tracks.id,
            name: schema.tracks.name,
            gradeId: schema.tracks.gradeId,
            instructorId: schema.tracks.instructorId,
          })
          .from(schema.tracks)
          .where(eq(schema.tracks.id, session.trackId))
          .limit(1);

        const [grade] = track
          ? await db
              .select({ name: schema.grades.name })
              .from(schema.grades)
              .where(eq(schema.grades.id, track.gradeId))
              .limit(1)
          : [null];

        const [instructor] = track
          ? await db
              .select({ name: schema.users.name, email: schema.users.email })
              .from(schema.users)
              .where(eq(schema.users.id, track.instructorId))
              .limit(1)
          : [null];

        const attendanceCount = await db
          .select({ count: count() })
          .from(schema.sessionAttendances)
          .where(eq(schema.sessionAttendances.sessionId, session.id));

        return {
          ...session,
          track: track
            ? {
                ...track,
                grade,
                instructor,
              }
            : null,
          _count: { attendances: attendanceCount[0]?.count || 0 },
        };
      })
    );

    // Get instructor workload analysis
    const instructorsData = await db
      .select({
        id: schema.users.id,
        name: schema.users.name,
        email: schema.users.email,
      })
      .from(schema.users)
      .where(eq(schema.users.role, "instructor"));

    const instructors = await Promise.all(
      instructorsData.map(async (instructor) => {
        const instructedTracks = await db
          .select({
            id: schema.tracks.id,
            name: schema.tracks.name,
          })
          .from(schema.tracks)
          .where(eq(schema.tracks.instructorId, instructor.id));

        const tracksWithCounts = await Promise.all(
          instructedTracks.map(async (track) => {
            const sessionCount = await db
              .select({ count: count() })
              .from(schema.liveSessions)
              .where(eq(schema.liveSessions.trackId, track.id));

            return {
              ...track,
              _count: { liveSessions: sessionCount[0]?.count || 0 },
            };
          })
        );

        const instructedSessions = await db
          .select({
            id: schema.liveSessions.id,
            date: schema.liveSessions.date,
            startTime: schema.liveSessions.startTime,
            endTime: schema.liveSessions.endTime,
            status: schema.liveSessions.status,
          })
          .from(schema.liveSessions)
          .where(
            and(
              eq(schema.liveSessions.instructorId, instructor.id),
              gte(schema.liveSessions.date, today)
            )
          );

        return {
          ...instructor,
          instructedTracks: tracksWithCounts,
          instructedSessions,
        };
      })
    );

    // Calculate instructor workload
    const instructorWorkload = instructors.map((instructor: any) => {
      const totalTracks = instructor.instructedTracks.length;
      const totalUpcomingSessions = instructor.instructedSessions.length;
      const activeSessions = instructor.instructedSessions.filter(
        (s: any) => s.status === "ACTIVE"
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
    const [totalCount, scheduledCount, activeCount, completedCount, cancelledCount] =
      await Promise.all([
        db.select({ count: count() }).from(schema.liveSessions),
        db
          .select({ count: count() })
          .from(schema.liveSessions)
          .where(eq(schema.liveSessions.status, "SCHEDULED")),
        db
          .select({ count: count() })
          .from(schema.liveSessions)
          .where(eq(schema.liveSessions.status, "ACTIVE")),
        db
          .select({ count: count() })
          .from(schema.liveSessions)
          .where(eq(schema.liveSessions.status, "COMPLETED")),
        db
          .select({ count: count() })
          .from(schema.liveSessions)
          .where(eq(schema.liveSessions.status, "CANCELLED")),
      ]);

    const sessionStats = {
      total: totalCount[0]?.count || 0,
      scheduled: scheduledCount[0]?.count || 0,
      active: activeCount[0]?.count || 0,
      completed: completedCount[0]?.count || 0,
      cancelled: cancelledCount[0]?.count || 0,
    };

    // Get attendance analytics
    const allAttendances = await db
      .select({
        status: schema.sessionAttendances.status,
      })
      .from(schema.sessionAttendances)
      .catch(() => []);

    const attendanceStats = allAttendances.reduce((acc: any[], attendance) => {
      const existing = acc.find((item) => item.status === attendance.status);
      if (existing) {
        existing._count.status += 1;
      } else {
        acc.push({ status: attendance.status, _count: { status: 1 } });
      }
      return acc;
    }, []);

    const attendanceData = {
      total: attendanceStats.reduce(
        (sum: number, stat: any) => sum + stat._count.status,
        0
      ),
      present:
        attendanceStats.find((s: any) => s.status === "present")?._count
          .status || 0,
      absent:
        attendanceStats.find((s: any) => s.status === "absent")?._count
          .status || 0,
      late:
        attendanceStats.find((s: any) => s.status === "late")?._count.status ||
        0,
    };

    const attendanceRate =
      attendanceData.total > 0
        ? Math.round((attendanceData.present / attendanceData.total) * 100)
        : 0;

    // Get grade distribution
    const gradeStatsData = await db
      .select({
        id: schema.grades.id,
        name: schema.grades.name,
        order: schema.grades.order,
      })
      .from(schema.grades)
      .orderBy(asc(schema.grades.order));

    const gradeStats = await Promise.all(
      gradeStatsData.map(async (grade) => {
        const gradeTracksData = await db
          .select({
            id: schema.tracks.id,
          })
          .from(schema.tracks)
          .where(eq(schema.tracks.gradeId, grade.id));

        const tracksWithCounts = await Promise.all(
          gradeTracksData.map(async (track) => {
            const sessionCount = await db
              .select({ count: count() })
              .from(schema.liveSessions)
              .where(eq(schema.liveSessions.trackId, track.id));

            return {
              ...track,
              _count: { liveSessions: sessionCount[0]?.count || 0 },
            };
          })
        );

        const [studentCount, trackCount] = await Promise.all([
          db
            .select({ count: count() })
            .from(schema.users)
            .where(
              and(
                eq(schema.users.role, "student"),
                eq(schema.users.gradeId, grade.id)
              )
            ),
          db
            .select({ count: count() })
            .from(schema.tracks)
            .where(eq(schema.tracks.gradeId, grade.id)),
        ]);

        return {
          ...grade,
          tracks: tracksWithCounts,
          _count: {
            students: studentCount[0]?.count || 0,
            tracks: trackCount[0]?.count || 0,
          },
        };
      })
    );

    // Calculate scheduling efficiency
    const totalScheduledHours = todaySessions.reduce((total: number, session: any) => {
      const start = new Date(`2000-01-01T${session.startTime}`);
      const end = new Date(`2000-01-01T${session.endTime}`);
      return total + (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    }, 0);

    const analytics = {
      trackStatistics: {
        total: tracks.length,
        active: tracks.filter((t: any) => t.isActive).length,
        inactive: tracks.filter((t: any) => !t.isActive).length,
        byGrade: gradeStats.map((grade: any) => ({
          gradeId: grade.id,
          gradeName: grade.name,
          trackCount: grade._count.tracks,
          studentCount: grade._count.students,
          totalSessions: grade.tracks.reduce(
            (sum: number, track: any) => sum + track._count.liveSessions,
            0
          ),
        })),
      },
      sessionStatistics: {
        today: {
          total: todaySessions.length,
          scheduled: todaySessions.filter((s: any) => s.status === "SCHEDULED")
            .length,
          active: todaySessions.filter((s: any) => s.status === "ACTIVE").length,
          completed: todaySessions.filter((s: any) => s.status === "COMPLETED")
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
                  (sum: number, i: any) => sum + i.workloadScore,
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

