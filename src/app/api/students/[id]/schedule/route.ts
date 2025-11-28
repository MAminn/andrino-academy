import { NextRequest, NextResponse } from "next/server";
import { db, schema, eq, and, gte, lte } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    // Get assigned grade with tracks and sessions
    let assignedGrade = null;
    if (student.gradeId) {
      const tracksData = await db
        .select({
          id: schema.tracks.id,
          name: schema.tracks.name,
        })
        .from(schema.tracks)
        .where(eq(schema.tracks.gradeId, student.gradeId));

      const tracks = await Promise.all(
        tracksData.map(async (track) => {
          const liveSessionsData = await db
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
                eq(schema.liveSessions.trackId, track.id),
                gte(schema.liveSessions.date, new Date(startDate)),
                lte(schema.liveSessions.date, new Date(endDate))
              )
            );

          const liveSessions = await Promise.all(
            liveSessionsData.map(async (session) => {
              const [track, attendances] = await Promise.all([
                db
                  .select({
                    id: schema.tracks.id,
                    name: schema.tracks.name,
                    instructorId: schema.tracks.instructorId,
                    gradeId: schema.tracks.gradeId,
                  })
                  .from(schema.tracks)
                  .where(eq(schema.tracks.id, session.trackId))
                  .limit(1),
                db
                  .select({ status: schema.sessionAttendances.status })
                  .from(schema.sessionAttendances)
                  .where(
                    and(
                      eq(schema.sessionAttendances.sessionId, session.id),
                      eq(schema.sessionAttendances.studentId, id)
                    )
                  ),
              ]);

              const [instructor, grade] = await Promise.all([
                db
                  .select({ id: schema.users.id, name: schema.users.name })
                  .from(schema.users)
                  .where(eq(schema.users.id, track[0].instructorId))
                  .limit(1),
                db
                  .select({ name: schema.grades.name })
                  .from(schema.grades)
                  .where(eq(schema.grades.id, track[0].gradeId))
                  .limit(1),
              ]);

              return {
                ...session,
                track: {
                  ...track[0],
                  instructor: instructor[0] || null,
                  grade: { name: grade[0]?.name || "" },
                },
                attendances,
              };
            })
          );

          const sortedSessions = liveSessions.sort((a, b) => {
            const dateCompare =
              new Date(a.date).getTime() - new Date(b.date).getTime();
            if (dateCompare !== 0) return dateCompare;
            return a.startTime.localeCompare(b.startTime);
          });

          return {
            ...track,
            liveSessions: sortedSessions,
          };
        })
      );

      assignedGrade = { tracks };
    }

    // Flatten all sessions from all tracks
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const allSessions: any[] = [];
    if (assignedGrade?.tracks) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      assignedGrade.tracks.forEach((track: any) => {
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
