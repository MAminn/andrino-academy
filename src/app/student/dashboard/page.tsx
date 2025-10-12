"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import DashboardLayout from "@/app/components/dashboard/DashboardLayout";
import {
  WelcomeCard,
  StatCard,
  QuickActionCard,
} from "@/app/components/dashboard/DashboardComponents";
import {
  BookOpen,
  Users,
  Calendar,
  Clock,
  CheckCircle,
  Play,
  Trophy,
  Star,
  Eye,
  UserCheck,
  BarChart3,
  AlertCircle,
  TrendingUp,
} from "lucide-react";

interface Student {
  id: string;
  name: string;
  email: string;
  grade?: {
    id: string;
    name: string;
    tracks: {
      id: string;
      name: string;
      instructor: {
        name: string;
      };
      liveSessions: {
        id: string;
        title: string;
        date: string;
        startTime: string;
        endTime: string;
        status: string;
      }[];
      _count: {
        liveSessions: number;
      };
    }[];
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
    instructor: {
      name: string;
      email: string;
    };
  };
}

interface AttendanceRecord {
  id: string;
  status: string;
  session: {
    id: string;
    title: string;
    date: string;
    startTime: string;
    endTime: string;
    track: {
      name: string;
    };
  };
}

export default function StudentDashboard() {
  const { data: session } = useSession();
  const [studentData, setStudentData] = useState<Student | null>(null);
  const [upcomingSessions, setUpcomingSessions] = useState<LiveSession[]>([]);
  const [attendanceHistory, setAttendanceHistory] = useState<
    AttendanceRecord[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch student data with grade and tracks
        const studentResponse = await fetch(
          `/api/students/${session?.user?.id}`
        );
        if (studentResponse.ok) {
          const studentInfo = await studentResponse.json();
          setStudentData(studentInfo);
        }

        // Fetch upcoming sessions
        const today = new Date().toISOString().split("T")[0];
        const nextMonth = new Date();
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        const upcomingResponse = await fetch(
          `/api/sessions?startDate=${today}&endDate=${
            nextMonth.toISOString().split("T")[0]
          }&studentId=${session?.user?.id}`
        );
        if (upcomingResponse.ok) {
          const upcomingData = await upcomingResponse.json();
          setUpcomingSessions(upcomingData);
        }

        // Fetch attendance history
        const attendanceResponse = await fetch(
          `/api/attendance?studentId=${session?.user?.id}`
        );
        if (attendanceResponse.ok) {
          const attendanceData = await attendanceResponse.json();
          setAttendanceHistory(attendanceData);
        }
      } catch (error) {
        console.error("Error fetching student data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user?.id) {
      fetchData();
    }
  }, [session?.user?.id]);

  const totalTracks = studentData?.grade?.tracks?.length || 0;
  const totalSessions =
    studentData?.grade?.tracks?.reduce(
      (sum, track) => sum + track._count.liveSessions,
      0
    ) || 0;
  const attendedSessions = attendanceHistory.filter(
    (record) => record.status === "present"
  ).length;
  const attendanceRate =
    totalSessions > 0
      ? Math.round((attendedSessions / totalSessions) * 100)
      : 0;

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString("ar-SA", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  if (loading) {
    return (
      <DashboardLayout title='لوحة تحكم الطالب' role='student'>
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
    <DashboardLayout title='لوحة تحكم الطالب' role='student'>
      {/* Welcome Card */}
      <WelcomeCard
        name={session?.user?.name || undefined}
        description={
          studentData?.grade
            ? `أهلاً بك في ${studentData.grade.name} - تابع تقدمك في المسارات التعليمية`
            : "مرحباً بك في منصة أندرينو الأكاديمية - يرجى انتظار تعيين المستوى الدراسي"
        }
        icon={<BookOpen className='w-16 h-16 text-blue-200' />}
      />

      {/* Grade Assignment Check */}
      {!studentData?.grade && (
        <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6'>
          <div className='flex items-center'>
            <AlertCircle className='w-5 h-5 text-yellow-600 ml-2' />
            <div>
              <h3 className='text-yellow-800 font-medium'>
                في انتظار تعيين المستوى الدراسي
              </h3>
              <p className='text-yellow-700 text-sm mt-1'>
                يرجى التواصل مع الإدارة لتعيينك في المستوى الدراسي المناسب
                للوصول إلى المسارات والجلسات.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
        <StatCard
          title='المستوى الدراسي'
          value={studentData?.grade?.name || "غير محدد"}
          icon={<BookOpen className='w-8 h-8' />}
          color='blue'
        />
        <StatCard
          title='المسارات المتاحة'
          value={totalTracks}
          icon={<Users className='w-8 h-8' />}
          color='green'
        />
        <StatCard
          title='الجلسات القادمة'
          value={upcomingSessions.length}
          icon={<Calendar className='w-8 h-8' />}
          color='purple'
        />
        <StatCard
          title='معدل الحضور'
          value={`${attendanceRate}%`}
          icon={<TrendingUp className='w-8 h-8' />}
          color='indigo'
        />
      </div>

      {/* Available Tracks */}
      {studentData?.grade && (
        <QuickActionCard title='المسارات المتاحة'>
          <div className='space-y-4'>
            {studentData.grade.tracks.map((track) => (
              <div
                key={track.id}
                className='border rounded-lg p-4 hover:shadow-md transition-shadow'>
                <div className='flex items-center justify-between mb-2'>
                  <h3 className='font-semibold text-lg'>{track.name}</h3>
                  <span className='text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded'>
                    {track.instructor.name}
                  </span>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mb-4'>
                  <div className='flex items-center'>
                    <Calendar className='w-4 h-4 ml-2' />
                    {track._count.liveSessions} جلسة مجدولة
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
                    عرض الجلسات
                  </button>
                  <button className='flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors'>
                    <BarChart3 className='w-4 h-4' />
                    تقدمي
                  </button>
                </div>
              </div>
            ))}

            {studentData.grade.tracks.length === 0 && (
              <div className='text-center py-8'>
                <BookOpen className='w-16 h-16 text-gray-400 mx-auto mb-4' />
                <p className='text-gray-500'>
                  لا توجد مسارات متاحة في مستواك حالياً
                </p>
                <p className='text-sm text-gray-400 mt-2'>
                  سيتم إضافة المسارات قريباً
                </p>
              </div>
            )}
          </div>
        </QuickActionCard>
      )}

      {/* Upcoming Sessions */}
      <QuickActionCard title='الجلسات القادمة'>
        {upcomingSessions.length === 0 ? (
          <div className='text-center py-8'>
            <Calendar className='w-16 h-16 text-gray-400 mx-auto mb-4' />
            <p className='text-gray-500'>لا توجد جلسات قادمة</p>
            {!studentData?.grade && (
              <p className='text-sm text-gray-400 mt-2'>
                سيتم عرض الجلسات بعد تعيين المستوى الدراسي
              </p>
            )}
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

                <div className='grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3'>
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
                    <UserCheck className='w-4 h-4 ml-2' />
                    {session.track.instructor.name}
                  </div>
                </div>

                <div className='flex justify-between items-center'>
                  <span className='text-sm text-gray-500'>
                    {session.track.grade.name}
                  </span>
                  <div className='flex gap-2'>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        session.status === "active"
                          ? "bg-green-100 text-green-800"
                          : session.status === "scheduled"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                      }`}>
                      {session.status === "active"
                        ? "جارية"
                        : session.status === "scheduled"
                        ? "مجدولة"
                        : "مكتملة"}
                    </span>
                    {session.status === "active" && (
                      <button className='flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors'>
                        <Play className='w-4 h-4' />
                        انضمام
                      </button>
                    )}
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

      {/* Attendance History */}
      <QuickActionCard title='سجل الحضور'>
        {attendanceHistory.length === 0 ? (
          <div className='text-center py-8'>
            <CheckCircle className='w-16 h-16 text-gray-400 mx-auto mb-4' />
            <p className='text-gray-500'>لا يوجد سجل حضور بعد</p>
            <p className='text-sm text-gray-400 mt-2'>
              سيظهر سجل حضورك بعد حضور الجلسات
            </p>
          </div>
        ) : (
          <div className='space-y-4'>
            {attendanceHistory.slice(0, 5).map((record) => (
              <div
                key={record.id}
                className='border rounded-lg p-4 hover:shadow-md transition-shadow'>
                <div className='flex items-center justify-between mb-2'>
                  <h3 className='font-semibold'>{record.session.title}</h3>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      record.status === "present"
                        ? "bg-green-100 text-green-800"
                        : record.status === "absent"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}>
                    {record.status === "present"
                      ? "حاضر"
                      : record.status === "absent"
                      ? "غائب"
                      : "متأخر"}
                  </span>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600'>
                  <div className='flex items-center'>
                    <Calendar className='w-4 h-4 ml-2' />
                    {new Date(record.session.date).toLocaleDateString("ar-SA")}
                  </div>
                  <div className='flex items-center'>
                    <Clock className='w-4 h-4 ml-2' />
                    {formatTime(record.session.startTime)} -{" "}
                    {formatTime(record.session.endTime)}
                  </div>
                  <div className='flex items-center'>
                    <BookOpen className='w-4 h-4 ml-2' />
                    {record.session.track.name}
                  </div>
                </div>
              </div>
            ))}

            {attendanceHistory.length > 5 && (
              <div className='text-center py-4'>
                <button className='text-blue-600 hover:text-blue-800 font-medium'>
                  عرض سجل الحضور الكامل ({attendanceHistory.length})
                </button>
              </div>
            )}
          </div>
        )}
      </QuickActionCard>

      {/* Quick Actions */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-6 mt-8'>
        <button className='flex items-center justify-center p-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl'>
          <Calendar className='w-6 h-6 ml-2' />
          جدولي الأسبوعي
        </button>
        <button className='flex items-center justify-center p-6 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-lg hover:shadow-xl'>
          <Trophy className='w-6 h-6 ml-2' />
          إنجازاتي
        </button>
        <button className='flex items-center justify-center p-6 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-lg hover:shadow-xl'>
          <BarChart3 className='w-6 h-6 ml-2' />
          تقدمي
        </button>
        <button className='flex items-center justify-center p-6 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-xl'>
          <Star className='w-6 h-6 ml-2' />
          التقييمات
        </button>
      </div>
    </DashboardLayout>
  );
}
