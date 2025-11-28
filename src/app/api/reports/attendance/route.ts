import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db, schema, eq, and, or, desc, asc, count, sql, isNull, gte, lt } from "@/lib/db";

type SessionStatus = "DRAFT" | "SCHEDULED" | "READY" | "ACTIVE" | "PAUSED" | "COMPLETED" | "CANCELLED";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only coordinators, managers, and CEOs can access attendance reports
    if (!["coordinator", "manager", "ceo"].includes(session.user?.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const trackId = searchParams.get("trackId");
    const gradeId = searchParams.get("gradeId");
    const status = searchParams.get("status");
    const format = searchParams.get("format");

    // Build where conditions for filtering
    const conditions = [];

    // Date range filter
    if (dateFrom) {
      conditions.push(gte(schema.liveSessions.date, new Date(dateFrom)));
    }
    if (dateTo) {
      const endDate = new Date(dateTo);
      endDate.setDate(endDate.getDate() + 1);
      conditions.push(lt(schema.liveSessions.date, endDate));
    }

    // Track filter
    if (trackId) {
      conditions.push(eq(schema.liveSessions.trackId, trackId));
    }

    // Status filter
    if (status) {
      conditions.push(eq(schema.liveSessions.status, status as SessionStatus));
    }

    // Fetch sessions
    let sessionsQuery = db
      .select({
        id: schema.liveSessions.id,
        title: schema.liveSessions.title,
        date: schema.liveSessions.date,
        startTime: schema.liveSessions.startTime,
        endTime: schema.liveSessions.endTime,
        status: schema.liveSessions.status,
        trackId: schema.liveSessions.trackId,
      })
      .from(schema.liveSessions);

    if (conditions.length > 0) {
      sessionsQuery = sessionsQuery.where(and(...conditions)) as any;
    }

    const sessionsData = await sessionsQuery.orderBy(
      desc(schema.liveSessions.date),
      desc(schema.liveSessions.startTime)
    );

    // Filter by grade if needed
    let filteredSessions = sessionsData;
    if (gradeId) {
      const tracksInGrade = await db
        .select({ id: schema.tracks.id })
        .from(schema.tracks)
        .where(eq(schema.tracks.gradeId, gradeId));
      const trackIds = tracksInGrade.map((t) => t.id);
      filteredSessions = sessionsData.filter((s) =>
        trackIds.includes(s.trackId)
      );
    }

    // Fetch sessions with attendance data
    const sessions = await Promise.all(
      filteredSessions.map(async (session) => {
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

        const [grade, instructor, attendances] = await Promise.all([
          db
            .select({ id: schema.grades.id, name: schema.grades.name, description: schema.grades.description })
            .from(schema.grades)
            .where(eq(schema.grades.id, track.gradeId))
            .limit(1),
          db
            .select({ id: schema.users.id, name: schema.users.name, email: schema.users.email })
            .from(schema.users)
            .where(eq(schema.users.id, track.instructorId))
            .limit(1),
          db
            .select({
              id: schema.sessionAttendances.id,
              status: schema.sessionAttendances.status,
              studentId: schema.sessionAttendances.studentId,
            })
            .from(schema.sessionAttendances)
            .where(eq(schema.sessionAttendances.sessionId, session.id)),
        ]);

        const attendancesWithStudents = await Promise.all(
          attendances.map(async (attendance) => {
            const [student] = await db
              .select({ id: schema.users.id, name: schema.users.name, email: schema.users.email })
              .from(schema.users)
              .where(eq(schema.users.id, attendance.studentId))
              .limit(1);

            return {
              ...attendance,
              student: student || null,
            };
          })
        );

        return {
          ...session,
          track: {
            ...track,
            grade: grade[0] || null,
            instructor: instructor[0] || null,
          },
          attendances: attendancesWithStudents,
        };
      })
    );

    // Process the data into reports format
    const reports = sessions.map((session) => {
      const totalStudents = session.attendances.length;
      const presentCount = session.attendances.filter(
        (a) => a.status === "present"
      ).length;
      const absentCount = session.attendances.filter(
        (a) => a.status === "absent"
      ).length;
      const lateCount = session.attendances.filter(
        (a) => a.status === "late"
      ).length;

      const attendanceRate =
        totalStudents > 0
          ? Math.round((presentCount / totalStudents) * 100)
          : 0;

      return {
        sessionId: session.id,
        sessionTitle: session.title,
        date: session.date.toISOString().split("T")[0],
        startTime: session.startTime,
        endTime: session.endTime,
        trackName: session.track.name,
        gradeName: session.track.grade.name,
        instructorName: session.track.instructor.name,
        totalStudents,
        presentCount,
        absentCount,
        lateCount,
        attendanceRate,
        status: session.status,
      };
    });

    // If CSV format is requested, generate CSV
    if (format === "csv") {
      const csvHeaders = [
        "عنوان الجلسة",
        "التاريخ",
        "وقت البداية",
        "وقت النهاية",
        "المسار",
        "المستوى",
        "المدرب",
        "إجمالي الطلاب",
        "الحاضرون",
        "الغائبون",
        "المتأخرون",
        "معدل الحضور %",
        "حالة الجلسة",
      ];

      const csvRows = reports.map((report) => [
        report.sessionTitle,
        new Date(report.date).toLocaleDateString("ar-SA"),
        new Date(`2000-01-01T${report.startTime}`).toLocaleTimeString("ar-SA", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }),
        new Date(`2000-01-01T${report.endTime}`).toLocaleTimeString("ar-SA", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }),
        report.trackName,
        report.gradeName,
        report.instructorName,
        report.totalStudents,
        report.presentCount,
        report.absentCount,
        report.lateCount,
        report.attendanceRate,
        report.status === "COMPLETED"
          ? "مكتملة"
          : report.status === "ACTIVE"
          ? "جارية"
          : report.status === "SCHEDULED"
          ? "مجدولة"
          : report.status === "CANCELLED"
          ? "ملغاة"
          : report.status,
      ]);

      const csvContent = [csvHeaders, ...csvRows]
        .map((row) => row.map((cell) => `"${cell}"`).join(","))
        .join("\n");

      return new Response(csvContent, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="attendance_report_${
            new Date().toISOString().split("T")[0]
          }.csv"`,
        },
      });
    }

    // Return JSON data
    return NextResponse.json({
      reports,
      summary: {
        totalSessions: reports.length,
        totalStudents: reports.reduce((sum, r) => sum + r.totalStudents, 0),
        totalPresent: reports.reduce((sum, r) => sum + r.presentCount, 0),
        averageAttendanceRate:
          reports.length > 0
            ? Math.round(
                reports.reduce((sum, r) => sum + r.attendanceRate, 0) /
                  reports.length
              )
            : 0,
      },
    });
  } catch (error) {
    console.error("Error fetching attendance reports:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

