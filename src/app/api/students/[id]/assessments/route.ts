import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Get student with tracks and sessions
    const student = await prisma.user.findUnique({
      where: { id },
      include: {
        grade: {
          include: {
            tracks: {
              include: {
                instructor: true,
                liveSessions: true,
              },
            },
          },
        },
      },
    });

    if (!student) {
      return NextResponse.json({ error: "الطالب غير موجود" }, { status: 404 });
    }

    // Generate mock assessments based on tracks and sessions
    const tracks = student.grade?.tracks || [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const assessments: any[] = [];
    let assessmentId = 1;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    tracks.forEach((track: any) => {
      const sessions = track.liveSessions || [];

      // Generate different types of assessments
      const assessmentTypes = [
        { type: "quiz", title: "اختبار قصير", maxScore: 20 },
        { type: "assignment", title: "واجب عملي", maxScore: 50 },
        { type: "project", title: "مشروع تطبيقي", maxScore: 100 },
        { type: "exam", title: "الامتحان النهائي", maxScore: 100 },
      ];

      assessmentTypes.forEach((assessType) => {
        const randomScore =
          Math.floor(Math.random() * assessType.maxScore * 0.4) +
          assessType.maxScore * 0.6;
        const grade = ((randomScore / assessType.maxScore) * 100).toFixed(1);
        const isSubmitted = Math.random() > 0.2; // 80% chance of being submitted
        const isGraded = isSubmitted && Math.random() > 0.3; // 70% chance of being graded if submitted

        const dueDate = new Date();
        dueDate.setDate(
          dueDate.getDate() + Math.floor(Math.random() * 30) - 15
        );

        let status = "pending";
        if (isSubmitted) status = "submitted";
        if (isGraded) status = "graded";
        if (dueDate < new Date() && status === "pending") status = "overdue";

        assessments.push({
          id: assessmentId.toString(),
          title: `${assessType.title} - ${track.name}`,
          type: assessType.type,
          trackName: track.name,
          sessionTitle: sessions[0]?.title,
          maxScore: assessType.maxScore,
          earnedScore: isGraded ? randomScore : undefined,
          grade: isGraded ? grade : undefined,
          status: status,
          submittedAt: isSubmitted
            ? new Date(
                Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000
              ).toISOString()
            : undefined,
          dueDate: dueDate.toISOString(),
          feedback: isGraded
            ? `أداء ${
                grade >= "80" ? "ممتاز" : grade >= "70" ? "جيد" : "يحتاج تحسين"
              }. ${
                grade >= "80"
                  ? "استمر في هذا المستوى الرائع!"
                  : grade >= "70"
                  ? "أداء جيد، يمكنك تحسينه أكثر."
                  : "يرجى مراجعة المواد ومحاولة التحسين."
              }`
            : undefined,
          instructor: track.instructor?.name || "غير محدد",
          rubric: isGraded
            ? [
                {
                  criteria: "الفهم والاستيعاب",
                  maxPoints: Math.floor(assessType.maxScore * 0.4),
                  earnedPoints: Math.floor(randomScore * 0.4),
                  comments: "فهم جيد للمفاهيم الأساسية",
                },
                {
                  criteria: "التطبيق العملي",
                  maxPoints: Math.floor(assessType.maxScore * 0.4),
                  earnedPoints: Math.floor(randomScore * 0.4),
                  comments: "تطبيق مناسب للمهارات المكتسبة",
                },
                {
                  criteria: "الإبداع والابتكار",
                  maxPoints: Math.floor(assessType.maxScore * 0.2),
                  earnedPoints: Math.floor(randomScore * 0.2),
                  comments: "عرض مستوى مقبول من الإبداع",
                },
              ]
            : undefined,
        });

        assessmentId++;
      });
    });

    // Calculate statistics
    const completedAssessments = assessments.filter(
      (a) => a.status === "graded"
    ).length;
    const totalAssessments = assessments.length;
    const gradedAssessments = assessments.filter((a) => a.grade);
    const averageGrade =
      gradedAssessments.length > 0
        ? gradedAssessments.reduce((sum, a) => sum + parseFloat(a.grade!), 0) /
          gradedAssessments.length
        : 0;

    // Grade distribution
    const gradeDistribution = [
      {
        grade: "ممتاز (90-100)",
        count: gradedAssessments.filter((a) => parseFloat(a.grade!) >= 90)
          .length,
      },
      {
        grade: "جيد جداً (80-89)",
        count: gradedAssessments.filter(
          (a) => parseFloat(a.grade!) >= 80 && parseFloat(a.grade!) < 90
        ).length,
      },
      {
        grade: "جيد (70-79)",
        count: gradedAssessments.filter(
          (a) => parseFloat(a.grade!) >= 70 && parseFloat(a.grade!) < 80
        ).length,
      },
      {
        grade: "مقبول (60-69)",
        count: gradedAssessments.filter(
          (a) => parseFloat(a.grade!) >= 60 && parseFloat(a.grade!) < 70
        ).length,
      },
      {
        grade: "ضعيف (أقل من 60)",
        count: gradedAssessments.filter((a) => parseFloat(a.grade!) < 60)
          .length,
      },
    ].filter((g) => g.count > 0);

    // Recent trend (mock data)
    const recentTrend = [
      { period: "الشهر الحالي", averageGrade: averageGrade },
      {
        period: "الشهر الماضي",
        averageGrade: Math.max(60, averageGrade - 5 + Math.random() * 10),
      },
      {
        period: "قبل شهرين",
        averageGrade: Math.max(60, averageGrade - 10 + Math.random() * 15),
      },
    ];

    const stats = {
      totalAssessments,
      completedAssessments,
      averageGrade,
      gradeDistribution,
      recentTrend,
    };

    return NextResponse.json({
      assessments,
      stats,
    });
  } catch (error) {
    console.error("Error fetching student assessments:", error);
    return NextResponse.json(
      { error: "فشل في جلب التقييمات" },
      { status: 500 }
    );
  }
}
