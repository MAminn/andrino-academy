"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import DashboardLayout from "@/app/components/dashboard/DashboardLayout";
import { WelcomeCard, StatCard, QuickActionCard } from "@/app/components/dashboard/DashboardComponents";
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
  Play,
  Pause,
  CheckSquare,
  TrendingUp,
  UserCheck,
  BarChart3
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

export default function InstructorDashboard() {
  const { data: session } = useSession();
  const [myTracks, setMyTracks] = useState<Track[]>([]);
  const [todaySessions, setTodaySessions] = useState<LiveSession[]>([]);
  const [upcomingSessions, setUpcomingSessions] = useState<LiveSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch instructor's tracks
        const tracksResponse = await fetch(`/api/tracks?instructorId=${session?.user?.id}`);
        if (tracksResponse.ok) {
          const tracksData = await tracksResponse.json();
          setMyTracks(tracksData);
        }

        // Fetch today's sessions for this instructor
        const today = new Date().toISOString().split('T')[0];
        const todaySessionsResponse = await fetch(`/api/sessions?date=${today}&instructorId=${session?.user?.id}`);
        if (todaySessionsResponse.ok) {
          const todaySessionsData = await todaySessionsResponse.json();
          setTodaySessions(todaySessionsData);
        }

        // Fetch upcoming sessions (next 7 days) for this instructor
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);
        const upcomingResponse = await fetch(`/api/sessions?startDate=${today}&endDate=${nextWeek.toISOString().split('T')[0]}&instructorId=${session?.user?.id}`);
        if (upcomingResponse.ok) {
          const upcomingData = await upcomingResponse.json();
          setUpcomingSessions(upcomingData.filter((session: LiveSession) => session.date !== today));
        }

      } catch (error) {
        console.error('Error fetching instructor data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user?.id) {
      fetchData();
    }
  }, [session?.user?.id]);

  const totalStudents = myTracks.reduce((sum, track) => sum + track._count.students, 0);
  const totalSessions = myTracks.reduce((sum, track) => sum + track._count.liveSessions, 0);

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('ar-SA', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return (
      <DashboardLayout title="لوحة تحكم المعلم" role="instructor">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">جارٍ تحميل لوحة التحكم...</p>
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
          title='إجمالي الجلسات'
          value={totalSessions}
          icon={<TrendingUp className='w-8 h-8' />}
          color='indigo'
        />
      </div>

      {/* Today's Sessions */}
      <QuickActionCard title='جلسات اليوم'>
        {todaySessions.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">لا توجد جلسات مجدولة لليوم</p>
          </div>
        ) : (
          <div className="space-y-4">
            {todaySessions.map((session) => (
              <div key={session.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-lg">{session.title}</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    session.status === 'active' ? 'bg-green-100 text-green-800' :
                    session.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {session.status === 'active' ? 'جارية' :
                     session.status === 'scheduled' ? 'مجدولة' : 'مكتملة'}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 ml-2" />
                    {formatTime(session.startTime)} - {formatTime(session.endTime)}
                  </div>
                  <div className="flex items-center">
                    <BookOpen className="w-4 h-4 ml-2" />
                    {session.track.name} - {session.track.grade.name}
                  </div>
                  <div className="flex items-center">
                    <Users className="w-4 h-4 ml-1" />
                    {session._count.attendance} طالب مسجل
                  </div>
                </div>

                <div className="flex gap-2">
                  {session.status === 'scheduled' && (
                    <button className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors">
                      <Play className="w-4 h-4" />
                      بدء الجلسة
                    </button>
                  )}
                  {session.status === 'active' && (
                    <button className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors">
                      <Pause className="w-4 h-4" />
                      إنهاء الجلسة
                    </button>
                  )}
                  <button className="flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors">
                    <CheckSquare className="w-4 h-4" />
                    الحضور
                  </button>
                  <button className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors">
                    <Edit className="w-4 h-4" />
                    تعديل
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </QuickActionCard>

      {/* My Tracks */}
      <QuickActionCard title='مساراتي التعليمية'>
        <div className="space-y-4">
          {myTracks.map((track) => (
            <div key={track.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-lg">{track.name}</h3>
                <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {track.grade.name}
                </span>
              </div>
              
              {track.description && (
                <p className="text-gray-600 text-sm mb-3">{track.description}</p>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                <div className="flex items-center">
                  <Users className="w-4 h-4 ml-2" />
                  {track._count.students} طالب
                </div>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 ml-2" />
                  {track._count.liveSessions} جلسة
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 ml-2" />
                  {track.liveSessions.filter(s => s.status === 'completed').length} مكتملة
                </div>
              </div>

              <div className="flex gap-2">
                <button className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors">
                  <Eye className="w-4 h-4" />
                  عرض التفاصيل
                </button>
                <button className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors">
                  <Plus className="w-4 h-4" />
                  جلسة جديدة
                </button>
                <button className="flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors">
                  <BarChart3 className="w-4 h-4" />
                  تقارير الأداء
                </button>
              </div>
            </div>
          ))}
          
          {myTracks.length === 0 && (
            <div className="text-center py-8">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">لم يتم تعيين أي مسارات لك بعد</p>
              <p className="text-sm text-gray-400 mt-2">تواصل مع المنسق لتعيين المسارات</p>
            </div>
          )}
        </div>
      </QuickActionCard>

      {/* Upcoming Sessions */}
      <QuickActionCard title='الجلسات القادمة'>
        {upcomingSessions.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">لا توجد جلسات قادمة خلال الأسبوع القادم</p>
          </div>
        ) : (
          <div className="space-y-4">
            {upcomingSessions.slice(0, 5).map((session) => (
              <div key={session.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">{session.title}</h3>
                  <span className="text-sm text-gray-500">
                    {new Date(session.date).toLocaleDateString('ar-SA')}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 ml-2" />
                    {formatTime(session.startTime)} - {formatTime(session.endTime)}
                  </div>
                  <div className="flex items-center">
                    <BookOpen className="w-4 h-4 ml-2" />
                    {session.track.name}
                  </div>
                  <div className="flex items-center">
                    <Users className="w-4 h-4 ml-1" />
                    {session._count.attendance} طالب
                  </div>
                </div>

                <div className="flex justify-between items-center mt-3">
                  <span className="text-sm text-gray-500">{session.track.grade.name}</span>
                  <div className="flex gap-2">
                    <button className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors">
                      <Edit className="w-4 h-4" />
                      تعديل
                    </button>
                    <button className="flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors">
                      <Calendar className="w-4 h-4" />
                      تفاصيل
                    </button>
                  </div>
                </div>
              </div>
            ))}
            
            {upcomingSessions.length > 5 && (
              <div className="text-center py-4">
                <button className="text-blue-600 hover:text-blue-800 font-medium">
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
    </DashboardLayout>
  );
}