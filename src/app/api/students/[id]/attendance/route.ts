import { NextRequest, NextResponse } from "next/server";
import { db, schema, eq } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get all SessionAttendance records for the student (LiveSessions)
    const sessionAttendanceRecords = await db
      .select({
        id: schema.sessionAttendances.id,
        status: schema.sessionAttendances.status,
        markedAt: schema.sessionAttendances.markedAt,
        notes: schema.sessionAttendances.notes,
        sessionId: schema.sessionAttendances.sessionId,
      })
      .from(schema.sessionAttendances)
      .where(eq(schema.sessionAttendances.studentId, id));

    const recordsWithDetails = await Promise.all(
      sessionAttendanceRecords.map(async (record) => {
        const [session] = await db
          .select({
            id: schema.liveSessions.id,
            title: schema.liveSessions.title,
            date: schema.liveSessions.date,
            startTime: schema.liveSessions.startTime,
            endTime: schema.liveSessions.endTime,
            trackId: schema.liveSessions.trackId,
          })
          .from(schema.liveSessions)
          .where(eq(schema.liveSessions.id, record.sessionId))
          .limit(1);

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

        const [grade, instructor] = await Promise.all([
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
          ...record,
          session: {
            ...session,
            track: {
              ...track,
              grade: { name: grade[0]?.name || "" },
              instructor: instructor[0] || null,
            },
          },
        };
      })
    );

    const sorted = recordsWithDetails.sort((a, b) => {
      const dateCompare =
        new Date(b.session.date).getTime() -
        new Date(a.session.date).getTime();
      if (dateCompare !== 0) return dateCompare;
      return b.session.startTime.localeCompare(a.session.startTime);
    });

    // Transform the data for the frontend
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const records = sorted.map((record: any) => ({
      id: record.id,
      sessionId: record.session.id,
      sessionTitle: record.session.title,
      trackName: record.session.track.name,
      gradeName: record.session.track.grade.name,
      date: record.session.date,
      startTime: record.session.startTime,
      endTime: record.session.endTime,
      status: record.status,
      markedAt: record.markedAt,
      notes: record.notes,
      instructor: record.session.track.instructor?.name || "غير محدد",
    }));

    // Calculate statistics
    const totalSessions = records.length;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const attendedSessions = records.filter(
      (r: any) => r.status === "present" || r.status === "late"
    ).length;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const absentSessions = records.filter(
      (r: any) => r.status === "absent"
    ).length;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const lateSessions = records.filter((r: any) => r.status === "late").length;
    const attendanceRate =
      totalSessions > 0 ? (attendedSessions / totalSessions) * 100 : 0;

    // Calculate current streak (consecutive attended sessions)
    let currentStreak = 0;
    for (let i = 0; i < records.length; i++) {
      if (records[i].status === "present" || records[i].status === "late") {
        currentStreak++;
      } else {
        break;
      }
    }

    // Calculate longest streak
    let longestStreak = 0;
    let tempStreak = 0;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    records.forEach((record: any) => {
      if (record.status === "present" || record.status === "late") {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
    });

    // Generate monthly statistics
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const monthlyStats: any[] = [];
    const months = new Set();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    records.forEach((record: any) => {
      const date = new Date(record.date);
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
      months.add(monthKey);
    });

    Array.from(months).forEach((monthKey) => {
      const [year, month] = (monthKey as string).split("-");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const monthRecords = records.filter((record: any) => {
        const date = new Date(record.date);
        return (
          date.getFullYear() === parseInt(year) &&
          date.getMonth() === parseInt(month)
        );
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const monthAttended = monthRecords.filter(
        (r: any) => r.status === "present" || r.status === "late"
      ).length;
      const monthTotal = monthRecords.length;
      const monthRate = monthTotal > 0 ? (monthAttended / monthTotal) * 100 : 0;

      const monthName = new Date(
        parseInt(year),
        parseInt(month)
      ).toLocaleDateString("ar-SA", {
        year: "numeric",
        month: "long",
      });

      monthlyStats.push({
        month: monthName,
        attendanceRate: monthRate,
        sessionsCount: monthTotal,
      });
    });

    // Sort monthly stats by date (most recent first)
    monthlyStats.sort((a, b) => b.month.localeCompare(a.month));

    const stats = {
      totalSessions,
      attendedSessions,
      absentSessions,
      lateSessions,
      attendanceRate,
      currentStreak,
      longestStreak,
      monthlyStats: monthlyStats.slice(0, 6), // Last 6 months
    };

    return NextResponse.json({
      records,
      stats,
    });
  } catch (error) {
    console.error("Error fetching student attendance:", error);
    return NextResponse.json(
      { error: "فشل في جلب بيانات الحضور" },
      { status: 500 }
    );
  }
}
