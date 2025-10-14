"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import DashboardLayout from "@/app/components/dashboard/DashboardLayout";
import {
  WelcomeCard,
  StatCard,
  QuickActionCard,
} from "@/app/components/dashboard/DashboardComponents";
import AttendanceModal from "@/app/components/AttendanceModal";
import SessionControlPanel from "@/app/components/SessionControlPanel";
import {
  BookOpen,
  Users,
  Calendar,
  Plus,
  Eye,
  Edit,
  MessageSquare,
  Clock,
  CheckCircle,
  CheckSquare,
  TrendingUp,
  UserCheck,
  BarChart3,
  Award,
  Target,
  Activity
} from "lucide-react";

interface Track {
  id: string;
  name: string;
  description?: string;
  grade: {
    id: string;
    name: string;
  };
  liveSessions: {
    id: string;
    title: string;
    date: string;
    startTime: string;
    endTime: string;
    status: string;
    _count: {
      attendance: number;
    };
  }[];
  _count: {
    liveSessions: number;
    students: number;
  };
}

interface LiveSession {
  id: string;
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  track: {
    id: string;
    name: string;
    grade: {
      name: string;
    };
  };
  _count: {
    attendance: number;
  };
}

interface InstructorAnalytics {
  overview: {
    totalTracks: number;
    totalStudents: number;
    totalSessions: number;
    completedSessions: number;
    sessionCompletionRate: number;
    attendanceRate: number;
    effectivenessScore: number;
  };
  studentPerformance: {
    totalStudents: number;
    averageAttendance: number;
    topStudents: Array<{
      studentId: string;
      studentName: string;
      attendancePercentage: number;
      totalSessions: number;
    }>;
    studentsNeedingAttention: Array<{
      studentId: string;
      studentName: string;
      attendancePercentage: number;
      totalSessions: number;
    }>;
  };
}

export default function InstructorDashboard() {
  const { data: session } = useSession();
  const [myTracks, setMyTracks] = useState<Track[]>([]);
  const [todaySessions, setTodaySessions] = useState<LiveSession[]>([]);
  const [upcomingSessions, setUpcomingSessions] = useState<LiveSession[]>([]);
  const [analytics, setAnalytics] = useState<InstructorAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSessionId, setSelectedSessionId] = useState<string>("");
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [selectedControlSessionId, setSelectedControlSessionId] = useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch instructor analytics
        const analyticsResponse = await fetch("/api/analytics/instructor");
        if (analyticsResponse.ok) {
          const analyticsData = await analyticsResponse.json();
          setAnalytics(analyticsData);
        }

        // Fetch instructor's tracks
        const tracksResponse = await fetch(
          `/api/tracks?instructorId=${session?.user?.id}`
        );
        if (tracksResponse.ok) {
          const tracksData = await tracksResponse.json();
          setMyTracks(tracksData);
        }

        // Fetch today's sessions for this instructor
        const today = new Date().toISOString().split("T")[0];
        const todaySessionsResponse = await fetch(
          `/api/sessions?date=${today}&instructorId=${session?.user?.id}`
        );
        if (todaySessionsResponse.ok) {
          const todaySessionsData = await todaySessionsResponse.json();
          setTodaySessions(todaySessionsData);
        }

        // Fetch upcoming sessions (next 7 days) for this instructor
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);
        const upcomingResponse = await fetch(
          `/api/sessions?startDate=${today}&endDate=${
            nextWeek.toISOString().split("T")[0]
          }&instructorId=${session?.user?.id}`
        );
        if (upcomingResponse.ok) {
          const upcomingData = await upcomingResponse.json();
          setUpcomingSessions(
            upcomingData.filter(
              (session: LiveSession) => session.date !== today
            )
          );
        }
      } catch (error) {
        console.error("Error fetching instructor data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user?.id) {
      fetchData();
    }
  }, [session?.user?.id]);

  const totalStudents = analytics?.overview.totalStudents || myTracks.reduce(
    (sum, track) => sum + track._count.students,
    0
  );
  const totalSessions = analytics?.overview.totalSessions || myTracks.reduce(
    (sum, track) => sum + track._count.liveSessions,
    0
  );

  const handleAttendanceClick = (sessionId: string) => {
    setSelectedSessionId(sessionId);
    setShowAttendanceModal(true);
  };

  const handleSessionControlClick = (sessionId: string) => {
    setSelectedControlSessionId(sessionId);
  };

  const refreshData = () => {
    // Refresh all data when needed
    if (session?.user?.id) {
      window.location.reload(); // Simple refresh for now
    }
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString("ar-SA", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  if (loading) {
    return (
      <DashboardLayout title='لوحة تحكم المعلم' role='instructor'>
        <div className='flex items-center justify-center min-h-screen'>
          <div className='text-center'>
            <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto'></div>
            <p className='mt-4 text-gray-600'>جارٍ تحميل لوحة التحكم...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title='لوحة تحكم المعلم' role='instructor'>
      {/* Welcome Card */}
      <WelcomeCard
        name={session?.user?.name || undefined}
        description='إدارة مساراتك وجلساتك المباشرة وتتبع تقدم طلابك في النظام الأكاديمي'
        icon={<BookOpen className='w-16 h-16 text-blue-200' />}
      />

      {/* Stats Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
        <StatCard
          title='مساراتي'
          value={myTracks.length}
          icon={<BookOpen className='w-8 h-8' />}
          color='blue'
        />
        <StatCard
          title='إجمالي الطلاب'
          value={totalStudents}
          icon={<Users className='w-8 h-8' />}
          color='green'
        />
        <StatCard
          title='جلسات اليوم'
          value={todaySessions.length}
          icon={<Calendar className='w-8 h-8' />}
          color='purple'
        />
        <StatCard
          title='معدل الحضور'
          value={analytics?.overview.attendanceRate ? `${analytics.overview.attendanceRate}%` : `${Math.round((totalSessions > 0 ? (todaySessions.length / totalSessions) * 100 : 0))}%`}
          icon={<TrendingUp className='w-8 h-8' />}
          color='indigo'
        />
      </div>

      {/* Analytics Section */}
      {analytics && (
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
          <div className='bg-white rounded-lg border shadow-sm p-6'>
            <div className='flex items-center justify-between mb-4'>
              <h3 className='text-lg font-semibold text-gray-900'>نظرة عامة على الأداء</h3>
              <BarChart3 className='w-6 h-6 text-blue-600' />
            </div>
            <div className='space-y-3'>
              <div className='flex justify-between items-center'>
                <span className='text-sm text-gray-600'>الجلسات المكتملة</span>
                <span className='font-medium'>{analytics.overview.completedSessions} من {analytics.overview.totalSessions}</span>
              </div>
              <div className='flex justify-between items-center'>
                <span className='text-sm text-gray-600'>معدل إنجاز الجلسات</span>
                <span className='font-medium text-green-600'>{analytics.overview.sessionCompletionRate}%</span>
              </div>
              <div className='flex justify-between items-center'>
                <span className='text-sm text-gray-600'>نقاط الفعالية</span>
                <span className='font-medium text-blue-600'>{analytics.overview.effectivenessScore}/100</span>
              </div>
            </div>
          </div>

          <div className='bg-white rounded-lg border shadow-sm p-6'>
            <div className='flex items-center justify-between mb-4'>
              <h3 className='text-lg font-semibold text-gray-900'>أفضل الطلاب</h3>
              <Award className='w-6 h-6 text-yellow-600' />
            </div>
            <div className='space-y-3'>
              {analytics.studentPerformance.topStudents.slice(0, 3).map((student, index) => (
                <div key={student.studentId} className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      index === 0 ? 'bg-yellow-100 text-yellow-800' :
                      index === 1 ? 'bg-gray-100 text-gray-800' :
                      'bg-orange-100 text-orange-800'
                    }`}>
                      {index + 1}
                    </div>
                    <span className='text-sm font-medium'>{student.studentName}</span>
                  </div>
                  <span className='text-sm text-green-600 font-medium'>{Math.round(student.attendancePercentage)}%</span>
                </div>
              ))}
              {analytics.studentPerformance.topStudents.length === 0 && (
                <p className='text-sm text-gray-500'>لا توجد بيانات كافية</p>
              )}
            </div>
          </div>

          <div className='bg-white rounded-lg border shadow-sm p-6'>
            <div className='flex items-center justify-between mb-4'>
              <h3 className='text-lg font-semibold text-gray-900'>طلاب يحتاجون اهتمام</h3>
              <Target className='w-6 h-6 text-red-600' />
            </div>
            <div className='space-y-3'>
              {analytics.studentPerformance.studentsNeedingAttention.slice(0, 3).map((student) => (
                <div key={student.studentId} className='flex items-center justify-between'>
                  <span className='text-sm font-medium'>{student.studentName}</span>
                  <span className='text-sm text-red-600 font-medium'>{Math.round(student.attendancePercentage)}%</span>
                </div>
              ))}
              {analytics.studentPerformance.studentsNeedingAttention.length === 0 && (
                <p className='text-sm text-green-600'>جميع الطلاب يحضرون بانتظام</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Today's Sessions */}
      <QuickActionCard title='جلسات اليوم'>
        {todaySessions.length === 0 ? (
          <div className='text-center py-8'>
            <Calendar className='w-16 h-16 text-gray-400 mx-auto mb-4' />
            <p className='text-gray-500'>لا توجد جلسات مجدولة لليوم</p>
          </div>
        ) : (
          <div className='space-y-6'>
            {todaySessions.map((session) => (
              <div key={session.id}>
                {/* Session Control Panel */}
                <SessionControlPanel 
                  sessionId={session.id}
                  onSessionUpdate={refreshData}
                />
                
                {/* Session Details */}
                <div className='mt-4 border rounded-lg p-4 bg-gray-50'>
                  <div className='flex items-center justify-between mb-2'>
                    <h3 className='font-semibold text-lg'>{session.title}</h3>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        session.status === "in_progress"
                          ? "bg-green-100 text-green-800"
                          : session.status === "scheduled"
                          ? "bg-blue-100 text-blue-800"
                          : session.status === "completed"
                          ? "bg-gray-100 text-gray-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}>
                      {session.status === "in_progress"
                        ? "جارية"
                        : session.status === "scheduled"
                        ? "مجدولة"
                        : session.status === "completed"
                        ? "مكتملة"
                        : "متوقفة"}
                    </span>
                  </div>

                  <div className='grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3'>
                    <div className='flex items-center'>
                      <Clock className='w-4 h-4 ml-2' />
                      {formatTime(session.startTime)} -{" "}
                      {formatTime(session.endTime)}
                    </div>
                    <div className='flex items-center'>
                      <BookOpen className='w-4 h-4 ml-2' />
                      {session.track.name} - {session.track.grade.name}
                    </div>
                    <div className='flex items-center'>
                      <Users className='w-4 h-4 ml-1' />
                      {session._count.attendance} طالب مسجل
                    </div>
                  </div>

                  <div className='flex gap-2'>
                    <button 
                      onClick={() => handleAttendanceClick(session.id)}
                      className='flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors'>
                      <CheckSquare className='w-4 h-4' />
                      إدارة الحضور
                    </button>
                    <button className='flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors'>
                      <Edit className='w-4 h-4' />
                      تعديل الجلسة
                    </button>
                    <button className='flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors'>
                      <Activity className='w-4 h-4' />
                      تقرير الجلسة
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </QuickActionCard>

      {/* My Tracks */}
      <QuickActionCard title='مساراتي التعليمية'>
        <div className='space-y-4'>
          {myTracks.map((track) => (
            <div
              key={track.id}
              className='border rounded-lg p-4 hover:shadow-md transition-shadow'>
              <div className='flex items-center justify-between mb-2'>
                <h3 className='font-semibold text-lg'>{track.name}</h3>
                <span className='text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded'>
                  {track.grade.name}
                </span>
              </div>

              {track.description && (
                <p className='text-gray-600 text-sm mb-3'>
                  {track.description}
                </p>
              )}

              <div className='grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-4'>
                <div className='flex items-center'>
                  <Users className='w-4 h-4 ml-2' />
                  {track._count.students} طالب
                </div>
                <div className='flex items-center'>
                  <Calendar className='w-4 h-4 ml-2' />
                  {track._count.liveSessions} جلسة
                </div>
                <div className='flex items-center'>
                  <CheckCircle className='w-4 h-4 ml-2' />
                  {
                    track.liveSessions.filter((s) => s.status === "completed")
                      .length
                  }{" "}
                  مكتملة
                </div>
              </div>

              <div className='flex gap-2'>
                <button className='flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors'>
                  <Eye className='w-4 h-4' />
                  عرض التفاصيل
                </button>
                <button className='flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors'>
                  <Plus className='w-4 h-4' />
                  جلسة جديدة
                </button>
                <button className='flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors'>
                  <BarChart3 className='w-4 h-4' />
                  تقارير الأداء
                </button>
              </div>
            </div>
          ))}

          {myTracks.length === 0 && (
            <div className='text-center py-8'>
              <BookOpen className='w-16 h-16 text-gray-400 mx-auto mb-4' />
              <p className='text-gray-500'>لم يتم تعيين أي مسارات لك بعد</p>
              <p className='text-sm text-gray-400 mt-2'>
                تواصل مع المنسق لتعيين المسارات
              </p>
            </div>
          )}
        </div>
      </QuickActionCard>

      {/* Upcoming Sessions */}
      <QuickActionCard title='الجلسات القادمة'>
        {upcomingSessions.length === 0 ? (
          <div className='text-center py-8'>
            <Clock className='w-16 h-16 text-gray-400 mx-auto mb-4' />
            <p className='text-gray-500'>
              لا توجد جلسات قادمة خلال الأسبوع القادم
            </p>
          </div>
        ) : (
          <div className='space-y-4'>
            {upcomingSessions.slice(0, 5).map((session) => (
              <div
                key={session.id}
                className='border rounded-lg p-4 hover:shadow-md transition-shadow'>
                <div className='flex items-center justify-between mb-2'>
                  <h3 className='font-semibold'>{session.title}</h3>
                  <span className='text-sm text-gray-500'>
                    {new Date(session.date).toLocaleDateString("ar-SA")}
                  </span>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600'>
                  <div className='flex items-center'>
                    <Clock className='w-4 h-4 ml-2' />
                    {formatTime(session.startTime)} -{" "}
                    {formatTime(session.endTime)}
                  </div>
                  <div className='flex items-center'>
                    <BookOpen className='w-4 h-4 ml-2' />
                    {session.track.name}
                  </div>
                  <div className='flex items-center'>
                    <Users className='w-4 h-4 ml-1' />
                    {session._count.attendance} طالب
                  </div>
                </div>

                <div className='flex justify-between items-center mt-3'>
                  <span className='text-sm text-gray-500'>
                    {session.track.grade.name}
                  </span>
                  <div className='flex gap-2'>
                    <button className='flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors'>
                      <Edit className='w-4 h-4' />
                      تعديل
                    </button>
                    <button className='flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors'>
                      <Calendar className='w-4 h-4' />
                      تفاصيل
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {upcomingSessions.length > 5 && (
              <div className='text-center py-4'>
                <button className='text-blue-600 hover:text-blue-800 font-medium'>
                  عرض جميع الجلسات القادمة ({upcomingSessions.length})
                </button>
              </div>
            )}
          </div>
        )}
      </QuickActionCard>

      {/* Quick Actions */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-6 mt-8'>
        <button className='flex items-center justify-center p-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl'>
          <Plus className='w-6 h-6 ml-2' />
          إنشاء جلسة جديدة
        </button>
        <button className='flex items-center justify-center p-6 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-lg hover:shadow-xl'>
          <UserCheck className='w-6 h-6 ml-2' />
          إدارة الحضور
        </button>
        <button className='flex items-center justify-center p-6 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-lg hover:shadow-xl'>
          <BarChart3 className='w-6 h-6 ml-2' />
          تقارير الطلاب
        </button>
        <button className='flex items-center justify-center p-6 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-xl'>
          <MessageSquare className='w-6 h-6 ml-2' />
          التواصل مع الطلاب
        </button>
      </div>

      {/* Attendance Modal */}
      <AttendanceModal
        sessionId={selectedSessionId}
        isOpen={showAttendanceModal}
        onClose={() => setShowAttendanceModal(false)}
        onSave={refreshData}
      />
    </DashboardLayout>
  );
}
