"use client";

import { useSession } from "@/lib/auth-client";
import { useState, useEffect } from "react";
import DashboardLayout from "@/app/components/dashboard/DashboardLayout";
import {
  WelcomeCard,
  QuickActionCard,
} from "@/app/components/dashboard/DashboardComponents";
import {
  Crown,
  Target,
  BarChart3,
  Globe,
  Settings,
  ArrowUp,
  Users,
  BookOpen,
  Calendar,
  CheckCircle,
  AlertTriangle,
  Activity,
  Database,
} from "lucide-react";

interface CEOAnalytics {
  userStatistics: {
    totalUsers: number;
    totalStudents: number;
    totalInstructors: number;
    totalCoordinators: number;
    totalManagers: number;
    studentsThisMonth: number;
    studentGrowth: number;
    instructorsThisMonth: number;
    unassignedStudents: number;
  };
  academicStatistics: {
    totalGrades: number;
    activeGrades: number;
    inactiveGrades: number;
    totalTracks: number;
    activeTracks: number;
    inactiveTracks: number;
    studentsByGrade: Array<{
      name: string;
      studentCount: number;
      isActive: boolean;
    }>;
  };
  sessionStatistics: {
    totalSessions: number;
    upcomingSessions: number;
    todaySessions: number;
    completedSessions: number;
    attendanceRate: number;
    totalAttendance: number;
    presentAttendance: number;
  };
  trackPerformance: Array<{
    id: string;
    name: string;
    gradeName: string;
    instructorName: string;
    sessionCount: number;
    isActive: boolean;
  }>;
  systemHealth: {
    score: number;
    indicators: {
      activeGrades: number;
      activeTracks: number;
      assignedStudents: number;
      attendanceRate: number;
    };
  };
  realtimeMetrics: {
    lastUpdated: string;
    serverStatus: string;
    databaseConnections: number;
    activeUsers: number;
  };
}

export default function CEODashboard() {
  const { data: session } = useSession();
  const [analytics, setAnalytics] = useState<CEOAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch("/api/analytics/ceo");
        if (!response.ok) {
          throw new Error("Failed to fetch analytics");
        }
        const data = await response.json();
        setAnalytics(data.analytics);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
        console.error("Error fetching CEO analytics:", err);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user?.role === "ceo") {
      fetchAnalytics();

      // Set up auto-refresh every 5 minutes
      const interval = setInterval(fetchAnalytics, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [session?.user?.role]);

  if (loading) {
    return (
      <DashboardLayout title='لوحة تحكم الرئيس التنفيذي' role='ceo'>
        <div className='flex items-center justify-center min-h-screen'>
          <div className='text-center'>
            <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto'></div>
            <p className='mt-4 text-gray-600'>جارٍ تحميل التحليلات...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !analytics) {
    return (
      <DashboardLayout title='لوحة تحكم الرئيس التنفيذي' role='ceo'>
        <div className='flex items-center justify-center min-h-screen'>
          <div className='text-center'>
            <AlertTriangle className='w-16 h-16 text-red-500 mx-auto mb-4' />
            <p className='text-red-600'>خطأ في تحميل البيانات: {error}</p>
            <button
              onClick={() => window.location.reload()}
              className='mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700'>
              إعادة تحميل
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const kpiData = [
    {
      title: "إجمالي المستخدمين",
      value: analytics.userStatistics.totalUsers.toString(),
      change: `+${analytics.userStatistics.studentGrowth}%`,
      trend: analytics.userStatistics.studentGrowth >= 0 ? "up" : "down",
      period: "هذا الشهر",
      icon: <Users className='w-8 h-8' />,
      color: "blue" as const,
    },
    {
      title: "إجمالي الطلاب",
      value: analytics.userStatistics.totalStudents.toString(),
      change: `+${analytics.userStatistics.studentsThisMonth}`,
      trend: "up" as const,
      period: "جديد هذا الشهر",
      icon: <BookOpen className='w-8 h-8' />,
      color: "green" as const,
    },
    {
      title: "المسارات النشطة",
      value: analytics.academicStatistics.activeTracks.toString(),
      change: `${analytics.academicStatistics.totalTracks} إجمالي`,
      trend: "up" as const,
      period: "متاح حالياً",
      icon: <Target className='w-8 h-8' />,
      color: "purple" as const,
    },
    {
      title: "معدل الحضور",
      value: `${analytics.sessionStatistics.attendanceRate}%`,
      change: `${analytics.sessionStatistics.presentAttendance}/${analytics.sessionStatistics.totalAttendance}`,
      trend: analytics.sessionStatistics.attendanceRate >= 80 ? "up" : "down",
      period: "إجمالي",
      icon: <CheckCircle className='w-8 h-8' />,
      color: "indigo" as const,
    },
  ];

  return (
    <DashboardLayout title='لوحة تحكم الرئيس التنفيذي' role='ceo'>
      {/* Welcome Card */}
      <WelcomeCard
        name={session?.user?.name || undefined}
        description='نظرة شاملة على الأداء الاستراتيجي والمالي والتشغيلي للأكاديمية'
        icon={<Crown className='w-16 h-16 text-blue-200' />}
      />

      {/* Real-time Status Bar */}
      <div className='bg-white rounded-lg shadow p-4 mb-6'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-4 space-x-reverse'>
            <div className='flex items-center'>
              <div className='w-3 h-3 bg-green-500 rounded-full ml-2 animate-pulse'></div>
              <span className='text-sm text-gray-600'>
                النظام يعمل بشكل طبيعي
              </span>
            </div>
            <div className='flex items-center'>
              <Activity className='w-4 h-4 text-blue-500 ml-2' />
              <span className='text-sm text-gray-600'>
                صحة النظام: {analytics.systemHealth.score}%
              </span>
            </div>
            <div className='flex items-center'>
              <Database className='w-4 h-4 text-green-500 ml-2' />
              <span className='text-sm text-gray-600'>
                قاعدة البيانات متصلة
              </span>
            </div>
          </div>
          <div className='text-xs text-gray-500'>
            آخر تحديث:{" "}
            {new Date(analytics.realtimeMetrics.lastUpdated).toLocaleTimeString(
              "ar-SA"
            )}
          </div>
        </div>
      </div>

      {/* Executive KPIs */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
        {kpiData.map((kpi, index) => (
          <div key={index} className='bg-white rounded-lg shadow p-6'>
            <div className='flex items-center justify-between mb-2'>
              <p className='text-sm font-medium text-gray-600'>{kpi.title}</p>
              <div
                className={`flex items-center text-sm ${
                  kpi.trend === "up" ? "text-green-600" : "text-red-600"
                }`}>
                {kpi.trend === "up" ? (
                  <ArrowUp className='w-4 h-4' />
                ) : (
                  <ArrowUp className='w-4 h-4 rotate-180' />
                )}
                {kpi.change}
              </div>
            </div>
            <div className='flex items-center'>
              <div className='flex-1'>
                <p className='text-2xl font-bold text-gray-900 mb-1'>
                  {kpi.value}
                </p>
                <p className='text-xs text-gray-500'>{kpi.period}</p>
              </div>
              <div className={`text-${kpi.color}-600`}>{kpi.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* System Health Dashboard */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8'>
        {/* System Health Indicators */}
        <QuickActionCard title='مؤشرات صحة النظام'>
          <div className='space-y-4'>
            <div className='flex items-center justify-between p-4 bg-gray-50 rounded-lg'>
              <div className='flex items-center'>
                <div
                  className={`w-3 h-3 rounded-full ml-3 ${
                    analytics.systemHealth.indicators.activeGrades >= 80
                      ? "bg-green-500"
                      : analytics.systemHealth.indicators.activeGrades >= 60
                      ? "bg-yellow-500"
                      : "bg-red-500"
                  }`}></div>
                <span className='font-medium'>المستويات النشطة</span>
              </div>
              <span className='text-lg font-bold'>
                {analytics.systemHealth.indicators.activeGrades}%
              </span>
            </div>

            <div className='flex items-center justify-between p-4 bg-gray-50 rounded-lg'>
              <div className='flex items-center'>
                <div
                  className={`w-3 h-3 rounded-full ml-3 ${
                    analytics.systemHealth.indicators.activeTracks >= 80
                      ? "bg-green-500"
                      : analytics.systemHealth.indicators.activeTracks >= 60
                      ? "bg-yellow-500"
                      : "bg-red-500"
                  }`}></div>
                <span className='font-medium'>المسارات النشطة</span>
              </div>
              <span className='text-lg font-bold'>
                {analytics.systemHealth.indicators.activeTracks}%
              </span>
            </div>

            <div className='flex items-center justify-between p-4 bg-gray-50 rounded-lg'>
              <div className='flex items-center'>
                <div
                  className={`w-3 h-3 rounded-full ml-3 ${
                    analytics.systemHealth.indicators.assignedStudents >= 80
                      ? "bg-green-500"
                      : analytics.systemHealth.indicators.assignedStudents >= 60
                      ? "bg-yellow-500"
                      : "bg-red-500"
                  }`}></div>
                <span className='font-medium'>الطلاب المعينين</span>
              </div>
              <span className='text-lg font-bold'>
                {analytics.systemHealth.indicators.assignedStudents}%
              </span>
            </div>

            <div className='flex items-center justify-between p-4 bg-gray-50 rounded-lg'>
              <div className='flex items-center'>
                <div
                  className={`w-3 h-3 rounded-full ml-3 ${
                    analytics.systemHealth.indicators.attendanceRate >= 80
                      ? "bg-green-500"
                      : analytics.systemHealth.indicators.attendanceRate >= 60
                      ? "bg-yellow-500"
                      : "bg-red-500"
                  }`}></div>
                <span className='font-medium'>معدل الحضور</span>
              </div>
              <span className='text-lg font-bold'>
                {analytics.systemHealth.indicators.attendanceRate}%
              </span>
            </div>
          </div>
        </QuickActionCard>

        {/* Academic Distribution */}
        <QuickActionCard title='توزيع الطلاب حسب المستوى'>
          <div className='space-y-4'>
            {analytics.academicStatistics.studentsByGrade.map(
              (grade, index) => (
                <div
                  key={index}
                  className='flex items-center justify-between p-4 border border-gray-200 rounded-lg'>
                  <div className='flex items-center'>
                    <div
                      className={`w-3 h-3 rounded-full ml-3 ${
                        grade.isActive ? "bg-green-500" : "bg-gray-400"
                      }`}></div>
                    <span className='font-medium'>{grade.name}</span>
                  </div>
                  <div className='text-left'>
                    <span className='text-lg font-bold text-gray-900'>
                      {grade.studentCount}
                    </span>
                    <span className='text-sm text-gray-500 mr-2'>طالب</span>
                  </div>
                </div>
              )
            )}

            {analytics.userStatistics.unassignedStudents > 0 && (
              <div className='flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg'>
                <div className='flex items-center'>
                  <AlertTriangle className='w-4 h-4 text-yellow-600 ml-2' />
                  <span className='font-medium text-yellow-800'>
                    غير معينين
                  </span>
                </div>
                <span className='text-lg font-bold text-yellow-800'>
                  {analytics.userStatistics.unassignedStudents}
                </span>
              </div>
            )}
          </div>
        </QuickActionCard>
      </div>

      {/* Track Performance */}
      <QuickActionCard title='أداء المسارات'>
        <div className='space-y-4'>
          {analytics.trackPerformance.slice(0, 6).map((track) => (
            <div
              key={track.id}
              className='p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow'>
              <div className='flex items-center justify-between mb-3'>
                <h4 className='font-medium text-gray-900'>{track.name}</h4>
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    track.isActive
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}>
                  {track.isActive ? "نشط" : "غير نشط"}
                </span>
              </div>
              <div className='grid grid-cols-3 gap-4 text-sm'>
                <div>
                  <p className='text-gray-600'>المستوى</p>
                  <p className='font-medium'>{track.gradeName}</p>
                </div>
                <div>
                  <p className='text-gray-600'>المدرب</p>
                  <p className='font-medium'>{track.instructorName}</p>
                </div>
                <div>
                  <p className='text-gray-600'>الجلسات</p>
                  <p className='font-medium'>{track.sessionCount}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </QuickActionCard>

      {/* Session Analytics */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
        <div className='bg-white rounded-lg shadow p-6'>
          <div className='flex items-center justify-between mb-2'>
            <p className='text-sm font-medium text-gray-600'>جلسات اليوم</p>
            <Calendar className='w-5 h-5 text-blue-600' />
          </div>
          <p className='text-2xl font-bold text-gray-900 mb-1'>
            {analytics.sessionStatistics.todaySessions}
          </p>
          <p className='text-xs text-gray-500'>جلسة مجدولة</p>
        </div>

        <div className='bg-white rounded-lg shadow p-6'>
          <div className='flex items-center justify-between mb-2'>
            <p className='text-sm font-medium text-gray-600'>الجلسات القادمة</p>
            <ArrowUp className='w-5 h-5 text-green-600' />
          </div>
          <p className='text-2xl font-bold text-gray-900 mb-1'>
            {analytics.sessionStatistics.upcomingSessions}
          </p>
          <p className='text-xs text-gray-500'>في المستقبل</p>
        </div>

        <div className='bg-white rounded-lg shadow p-6'>
          <div className='flex items-center justify-between mb-2'>
            <p className='text-sm font-medium text-gray-600'>
              الجلسات المكتملة
            </p>
            <CheckCircle className='w-5 h-5 text-purple-600' />
          </div>
          <p className='text-2xl font-bold text-gray-900 mb-1'>
            {analytics.sessionStatistics.completedSessions}
          </p>
          <p className='text-xs text-gray-500'>تم إنجازها</p>
        </div>

        <div className='bg-white rounded-lg shadow p-6'>
          <div className='flex items-center justify-between mb-2'>
            <p className='text-sm font-medium text-gray-600'>إجمالي الجلسات</p>
            <BarChart3 className='w-5 h-5 text-indigo-600' />
          </div>
          <p className='text-2xl font-bold text-gray-900 mb-1'>
            {analytics.sessionStatistics.totalSessions}
          </p>
          <p className='text-xs text-gray-500'>في النظام</p>
        </div>
      </div>

      {/* Executive Actions */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        <button className='flex items-center justify-center p-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl'>
          <BarChart3 className='w-6 h-6 ml-2' />
          التقارير التنفيذية
        </button>
        <button className='flex items-center justify-center p-6 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-lg hover:shadow-xl'>
          <Target className='w-6 h-6 ml-2' />
          الخطة الاستراتيجية
        </button>
        <button className='flex items-center justify-center p-6 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-lg hover:shadow-xl'>
          <Globe className='w-6 h-6 ml-2' />
          تحليل السوق
        </button>
        <button className='flex items-center justify-center p-6 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-xl'>
          <Settings className='w-6 h-6 ml-2' />
          إعدادات النظام
        </button>
      </div>
    </DashboardLayout>
  );
}
