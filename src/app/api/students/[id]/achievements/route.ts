import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Get student with attendance and track data
    const student = await prisma.user.findUnique({
      where: { id },
      include: {
        grade: {
          include: {
            tracks: {
              include: {
                liveSessions: {
                  include: {
                    attendances: {
                      where: { studentId: id },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!student) {
      return NextResponse.json({ error: "الطالب غير موجود" }, { status: 404 });
    }

    // Calculate achievement data
    const tracks = student.grade?.tracks || [];
    let totalSessions = 0;
    let attendedSessions = 0;
    let completedTracks = 0;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    tracks.forEach((track: any) => {
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
      if (progress >= 80) completedTracks++;
    });

    const attendanceRate =
      totalSessions > 0 ? (attendedSessions / totalSessions) * 100 : 0;

    // Generate achievements based on performance
    const achievements = [
      {
        id: "1",
        title: "أول يوم",
        description: "حضرت أول جلسة لك في الأكاديمية",
        type: "milestone",
        category: "attendance",
        points: 10,
        rarity: "common",
        isUnlocked: attendedSessions > 0,
        requirements: ["حضور أول جلسة"],
        earnedAt: attendedSessions > 0 ? new Date().toISOString() : undefined,
      },
      {
        id: "2",
        title: "الطالب المنتظم",
        description: "حضرت 10 جلسات متتالية",
        type: "streak",
        category: "attendance",
        points: 50,
        rarity: "uncommon",
        isUnlocked: attendedSessions >= 10,
        progress: Math.min(attendedSessions, 10),
        maxProgress: 10,
        requirements: ["حضور 10 جلسات متتالية"],
        earnedAt: attendedSessions >= 10 ? new Date().toISOString() : undefined,
      },
      {
        id: "3",
        title: "الحضور المثالي",
        description: "حقق معدل حضور 95% أو أكثر",
        type: "attendance",
        category: "performance",
        points: 100,
        rarity: "rare",
        isUnlocked: attendanceRate >= 95,
        progress: Math.min(attendanceRate, 95),
        maxProgress: 95,
        requirements: ["الحصول على معدل حضور 95% أو أكثر"],
        earnedAt: attendanceRate >= 95 ? new Date().toISOString() : undefined,
      },
      {
        id: "4",
        title: "منجز المسار",
        description: "أكمل مسار تعليمي كامل بنجاح",
        type: "completion",
        category: "milestone",
        points: 200,
        rarity: "epic",
        isUnlocked: completedTracks > 0,
        progress: completedTracks,
        maxProgress: 1,
        requirements: ["إكمال مسار تعليمي كامل"],
        earnedAt: completedTracks > 0 ? new Date().toISOString() : undefined,
      },
      {
        id: "5",
        title: "المتفوق الأكاديمي",
        description: "أكمل 3 مسارات بمعدل ممتاز",
        type: "grade",
        category: "performance",
        points: 500,
        rarity: "legendary",
        isUnlocked: completedTracks >= 3,
        progress: completedTracks,
        maxProgress: 3,
        requirements: ["إكمال 3 مسارات بمعدل ممتاز"],
        earnedAt: completedTracks >= 3 ? new Date().toISOString() : undefined,
      },
      {
        id: "6",
        title: "المشارك النشط",
        description: "شارك في 50 جلسة تفاعلية",
        type: "engagement",
        category: "social",
        points: 75,
        rarity: "uncommon",
        isUnlocked: attendedSessions >= 50,
        progress: Math.min(attendedSessions, 50),
        maxProgress: 50,
        requirements: ["المشاركة في 50 جلسة"],
        earnedAt: attendedSessions >= 50 ? new Date().toISOString() : undefined,
      },
    ];

    // Calculate stats
    const unlockedAchievements = achievements.filter(
      (a) => a.isUnlocked
    ).length;
    const totalPoints = achievements
      .filter((a) => a.isUnlocked)
      .reduce((sum, a) => sum + a.points, 0);

    const currentLevel = Math.floor(totalPoints / 100) + 1;
    const nextLevelPoints = currentLevel * 100;
    const currentLevelProgress = ((totalPoints % 100) / 100) * 100;

    // Determine rank based on performance
    let rank = "مبتدئ";
    if (attendanceRate >= 90 && completedTracks >= 2) rank = "خبير";
    else if (attendanceRate >= 80 && completedTracks >= 1) rank = "متقدم";
    else if (attendanceRate >= 70) rank = "متوسط";

    const stats = {
      totalAchievements: achievements.length,
      unlockedAchievements,
      totalPoints,
      currentLevel,
      nextLevelPoints,
      currentLevelProgress,
      rank,
    };

    return NextResponse.json({
      achievements,
      stats,
    });
  } catch (error) {
    console.error("Error fetching student achievements:", error);
    return NextResponse.json(
      { error: "فشل في جلب الإنجازات" },
      { status: 500 }
    );
  }
}
