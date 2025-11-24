import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { Prisma, SessionStatus } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session) {
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

    // Build where clause for filtering
    const whereClause: Prisma.LiveSessionWhereInput = {};

    // Date range filter
    if (dateFrom || dateTo) {
      whereClause.date = {};
      if (dateFrom) {
        whereClause.date.gte = new Date(dateFrom);
      }
      if (dateTo) {
        const endDate = new Date(dateTo);
        endDate.setDate(endDate.getDate() + 1); // Include the end date
        whereClause.date.lt = endDate;
      }
    }

    // Track filter
    if (trackId) {
      whereClause.trackId = trackId;
    }

    // Grade filter (through track)
    if (gradeId) {
      whereClause.track = {
        gradeId: gradeId,
      };
    }

    // Status filter
    if (status) {
      whereClause.status = status as SessionStatus;
    }

    // Fetch sessions with attendance data
    const sessions = await prisma.liveSession.findMany({
      where: whereClause,
      include: {
        track: {
          include: {
            grade: {
              select: { id: true, name: true, description: true },
            },
            instructor: {
              select: { id: true, name: true, email: true },
            },
          },
        },
        attendances: {
          include: {
            student: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
      orderBy: [{ date: "desc" }, { startTime: "desc" }],
    });

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
