import { NextRequest, NextResponse } from "next/server";
import { db, schema, eq } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get student with tracks and attendance
    const studentData = await db
      .select({
        id: schema.users.id,
        name: schema.users.name,
        gradeId: schema.users.gradeId,
      })
      .from(schema.users)
      .where(eq(schema.users.id, id))
      .limit(1);

    if (studentData.length === 0) {
      return NextResponse.json({ error: "الطالب غير موجود" }, { status: 404 });
    }

    const student = studentData[0];

    // Get assigned grade with tracks
    let assignedGrade = null;
    if (student.gradeId) {
      const gradeData = await db
        .select({
          id: schema.grades.id,
          name: schema.grades.name,
        })
        .from(schema.grades)
        .where(eq(schema.grades.id, student.gradeId))
        .limit(1);

      if (gradeData.length > 0) {
        const tracksData = await db
          .select({
            id: schema.tracks.id,
            name: schema.tracks.name,
          })
          .from(schema.tracks)
          .where(eq(schema.tracks.gradeId, gradeData[0].id));

        const tracks = await Promise.all(
          tracksData.map(async (track) => {
            const liveSessionsData = await db
              .select({
                id: schema.liveSessions.id,
                title: schema.liveSessions.title,
              })
              .from(schema.liveSessions)
              .where(eq(schema.liveSessions.trackId, track.id));

            const liveSessions = await Promise.all(
              liveSessionsData.map(async (session) => {
                const attendances = await db
                  .select({
                    status: schema.sessionAttendances.status,
                  })
                  .from(schema.sessionAttendances)
                  .where(eq(schema.sessionAttendances.sessionId, session.id));

                return {
                  ...session,
                  attendances: attendances.filter((a) => a.status !== null),
                };
              })
            );

            return {
              ...track,
              liveSessions,
            };
          })
        );

        assignedGrade = {
          ...gradeData[0],
          tracks,
        };
      }
    }

    // Calculate overall stats
    const tracks = assignedGrade?.tracks || [];
    let totalSessions = 0;
    let attendedSessions = 0;
    let completedTracks = 0;
    let activeTracks = 0;
    let totalGrades = 0;
    let gradeCount = 0;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const trackProgress = tracks.map((track: any) => {
      const sessions = track.liveSessions;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const attended = sessions.filter((session: any) =>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        session.attendances.some(
          (att: any) => att.status === "present" || att.status === "late"
        )
      ).length;

      totalSessions += sessions.length;
      attendedSessions += attended;

      const progress =
        sessions.length > 0 ? (attended / sessions.length) * 100 : 0;
      const isCompleted = progress >= 80; // Consider 80% completion as finished

      if (isCompleted) completedTracks++;
      else activeTracks++;

      // Mock grade calculation (in real app, this would come from assessments)
      const mockGrade = Math.min(90, 60 + progress * 0.3);
      totalGrades += mockGrade;
      gradeCount++;

      return {
        id: track.id,
        name: track.name,
        progress: progress,
        grade: mockGrade.toFixed(1),
        totalSessions: sessions.length,
        attendedSessions: attended,
        status: isCompleted ? "completed" : "active",
        completionDate: isCompleted ? new Date().toISOString() : undefined,
      };
    });

    const attendanceRate =
      totalSessions > 0 ? (attendedSessions / totalSessions) * 100 : 0;
    const completionRate =
      tracks.length > 0 ? (completedTracks / tracks.length) * 100 : 0;
    const averageGrade = gradeCount > 0 ? totalGrades / gradeCount : 0;

    // Generate mock achievements
    const recentAchievements = [];
    if (attendanceRate >= 90) {
      recentAchievements.push({
        id: "1",
        title: "الحضور المثالي",
        description: "حضرت أكثر من 90% من الجلسات",
        earnedAt: new Date().toISOString(),
        type: "attendance",
      });
    }
    if (completedTracks > 0) {
      recentAchievements.push({
        id: "2",
        title: "إنجاز المسار",
        description: `أكملت ${completedTracks} مسار بنجاح`,
        earnedAt: new Date().toISOString(),
        type: "completion",
      });
    }

    // Generate weekly progress (mock data)
    const weeklyProgress = [];
    for (let i = 3; i >= 0; i--) {
      const weekDate = new Date();
      weekDate.setDate(weekDate.getDate() - i * 7);
      const weekAttendance = Math.max(50, attendanceRate - Math.random() * 20);

      weeklyProgress.push({
        week: `الأسبوع ${4 - i}`,
        attendanceRate: weekAttendance,
        sessionsCount: Math.floor(totalSessions / 4),
      });
    }

    const progressData = {
      overall: {
        completionRate,
        attendanceRate,
        averageGrade,
        totalSessions,
        attendedSessions,
        completedTracks,
        activeTracks,
      },
      tracks: trackProgress,
      recentAchievements,
      weeklyProgress,
    };

    return NextResponse.json(progressData);
  } catch (error) {
    console.error("Error fetching student progress:", error);
    return NextResponse.json(
      { error: "فشل في جلب بيانات التقدم" },
      { status: 500 }
    );
  }
}
