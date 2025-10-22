"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import DashboardLayout from "@/app/components/dashboard/DashboardLayout";
import {
  WelcomeCard,
  StatCard,
  QuickActionCard,
} from "@/app/components/dashboard/DashboardComponents";
import TrackModal from "@/app/components/coordinator/TrackModal";
import SessionSchedulingModal from "@/app/components/coordinator/SessionSchedulingModal";
import InstructorManagementModal from "@/app/components/coordinator/InstructorManagementModal";
import AttendanceReportsModal from "@/app/components/coordinator/AttendanceReportsModal";
import SessionDetailsModal from "@/app/components/coordinator/SessionDetailsModal";
import AttendanceManagementModal from "@/app/components/coordinator/AttendanceManagementModal";
import TrackDetailsModal from "@/app/components/coordinator/TrackDetailsModal";
import {
  UserCheck,
  BookOpen,
  Users,
  BarChart3,
  Calendar,
  Clock,
  Play,
  CheckSquare,
  Eye,
  Edit,
  Plus,
} from "lucide-react";

interface Track {
  id: string;
  name: string;
  grade: {
    id: string;
    name: string;
  };
  instructor: {
    id: string;
    name: string;
    email: string;
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
  _count: {
    attendance: number;
  };
}

export default function CoordinatorDashboard() {
  const { data: session } = useSession();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [todaySessions, setTodaySessions] = useState<LiveSession[]>([]);
  const [upcomingSessions, setUpcomingSessions] = useState<LiveSession[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [modals, setModals] = useState({
    trackModal: false,
    sessionModal: false,
    instructorModal: false,
    reportsModal: false,
  });

  // Selected IDs for modals
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
    null
  );
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);
  const [showSessionDetails, setShowSessionDetails] = useState(false);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [showTrackDetails, setShowTrackDetails] = useState(false);

  // Edit session state for SessionSchedulingModal
  const [editSession, setEditSession] = useState<{
    id: string;
    title: string;
    description?: string;
    date: string;
    startTime: string;
    endTime: string;
    trackId: string;
  } | null>(null);

  const openModal = (modalName: keyof typeof modals) => {
    setModals((prev) => ({ ...prev, [modalName]: true }));
  };

  const closeModal = (modalName: keyof typeof modals) => {
    setModals((prev) => ({ ...prev, [modalName]: false }));
    // Clear edit session when closing session modal
    if (modalName === "sessionModal") {
      setEditSession(null);
    }
  };

  const handleModalSuccess = async () => {
    // Refresh data when modal operations succeed
    await fetchData();
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch tracks
      const tracksResponse = await fetch("/api/tracks");
      if (tracksResponse.ok) {
        const result = await tracksResponse.json();
        // API returns { success, data, message, timestamp }
        setTracks(Array.isArray(result.data) ? result.data : result.data || []);
      }

      // Fetch today's sessions
      const today = new Date().toISOString().split("T")[0];
      const todaySessionsResponse = await fetch(`/api/sessions?date=${today}`);
      if (todaySessionsResponse.ok) {
        const result = await todaySessionsResponse.json();
        // API returns { sessions }
        setTodaySessions(Array.isArray(result.sessions) ? result.sessions : []);
      }

      // Fetch upcoming sessions (next 7 days)
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      const upcomingResponse = await fetch(
        `/api/sessions?startDate=${today}&endDate=${
          nextWeek.toISOString().split("T")[0]
        }`
      );
      if (upcomingResponse.ok) {
        const result = await upcomingResponse.json();
        // API returns { sessions }
        const sessions = Array.isArray(result.sessions) ? result.sessions : [];
        setUpcomingSessions(
          sessions.filter((session: LiveSession) => session.date !== today)
        );
      }
    } catch (error) {
      console.error("Error fetching coordinator data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Defensive programming: ensure tracks is an array before using reduce
  const totalSessions = Array.isArray(tracks)
    ? tracks.reduce((sum, track) => sum + (track._count?.liveSessions || 0), 0)
    : 0;

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString("ar-SA", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Handler functions for session actions
  const handleViewSession = (sessionId: string) => {
    setSelectedSessionId(sessionId);
    setShowSessionDetails(true);
  };

  const handleAttendance = (sessionId: string) => {
    setSelectedSessionId(sessionId);
    setShowAttendanceModal(true);
  };

  const handleViewTrack = (trackId: string) => {
    setSelectedTrackId(trackId);
    setShowTrackDetails(true);
  };

  const handleNewSession = (trackId: string) => {
    // Open session creation modal with track pre-selected
    console.log("Create new session for track:", trackId);
    openModal("sessionModal");
    // TODO: Pass trackId to SessionSchedulingModal
  };

  const handleEditSession = (session: LiveSession) => {
    // Prepare session data for editing
    setEditSession({
      id: session.id,
      title: session.title,
      description: session.description || "",
      date: session.date,
      startTime: session.startTime,
      endTime: session.endTime,
      trackId: session.track.id,
    });
    openModal("sessionModal");
  };

  const handleScheduleSession = (session: LiveSession) => {
    // Open scheduling modal in edit mode for session timing
    setEditSession({
      id: session.id,
      title: session.title,
      description: session.description || "",
      date: session.date,
      startTime: session.startTime,
      endTime: session.endTime,
      trackId: session.track.id,
    });
    openModal("sessionModal");
  };

  if (loading) {
    return (
      <DashboardLayout title='لوحة تحكم المنسق' role='coordinator'>
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
    <DashboardLayout title='لوحة تحكم المنسق' role='coordinator'>
      <WelcomeCard
        name={session?.user?.name || undefined}
        description='إدارة وتنسيق المسارات والجلسات التعليمية'
        icon={<Calendar className='w-16 h-16 text-blue-200' />}
      />

      {/* Key Statistics */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-6 mt-8'>
        <StatCard
          title='إجمالي المسارات'
          value={tracks.length}
          icon={<BookOpen className='w-8 h-8' />}
          color='blue'
        />
        <StatCard
          title='جلسات اليوم'
          value={todaySessions.length}
          icon={<Calendar className='w-8 h-8' />}
          color='green'
        />
        <StatCard
          title='إجمالي الجلسات'
          value={totalSessions}
          icon={<Play className='w-8 h-8' />}
          color='purple'
        />
        <StatCard
          title='الجلسات القادمة'
          value={upcomingSessions.length}
          icon={<Clock className='w-8 h-8' />}
          color='indigo'
        />
      </div>

      {/* Today's Sessions */}
      <QuickActionCard title='جلسات اليوم'>
        {todaySessions.length === 0 ? (
          <div className='text-center py-8'>
            <Calendar className='w-16 h-16 text-gray-400 mx-auto mb-4' />
            <p className='text-gray-500'>لا توجد جلسات مجدولة لليوم</p>
          </div>
        ) : (
          <div className='space-y-4'>
            {todaySessions.map((session) => (
              <div
                key={session.id}
                className='border rounded-lg p-4 hover:shadow-md transition-shadow'>
                <div className='flex items-center justify-between mb-2'>
                  <h3 className='font-semibold text-lg'>{session.title}</h3>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
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
                </div>

                <div className='grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600'>
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
                    <UserCheck className='w-4 h-4 ml-2' />
                    {session.track.instructor.name}
                  </div>
                </div>

                <div className='flex items-center justify-between mt-4'>
                  <div className='flex items-center text-sm text-gray-500'>
                    <Users className='w-4 h-4 ml-1' />
                    <span>{session._count.attendance} طالب مسجل</span>
                  </div>
                  <div className='flex gap-2'>
                    <button
                      onClick={() => handleViewSession(session.id)}
                      className='flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors'>
                      <Eye className='w-4 h-4' />
                      عرض
                    </button>
                    <button
                      onClick={() => handleAttendance(session.id)}
                      className='flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors'>
                      <CheckSquare className='w-4 h-4' />
                      الحضور
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </QuickActionCard>

      {/* Track Management */}
      <QuickActionCard title='إدارة المسارات'>
        <div className='space-y-4'>
          {tracks.slice(0, 5).map((track) => (
            <div
              key={track.id}
              className='border rounded-lg p-4 hover:shadow-md transition-shadow'>
              <div className='flex items-center justify-between mb-2'>
                <h3 className='font-semibold'>{track.name}</h3>
                <span className='text-sm text-gray-500'>
                  {track.grade.name}
                </span>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mb-3'>
                <div className='flex items-center'>
                  <UserCheck className='w-4 h-4 ml-2' />
                  {track.instructor.name}
                </div>
                <div className='flex items-center'>
                  <Calendar className='w-4 h-4 ml-2' />
                  {track._count.liveSessions} جلسة
                </div>
              </div>

              <div className='flex justify-between items-center'>
                <div className='flex items-center gap-2'>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      track.liveSessions.some((s) => s.status === "active")
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}>
                    {track.liveSessions.some((s) => s.status === "active")
                      ? "نشط"
                      : "غير نشط"}
                  </span>
                </div>

                <div className='flex gap-2'>
                  <button
                    onClick={() => handleViewTrack(track.id)}
                    className='flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors'>
                    <Eye className='w-4 h-4' />
                    عرض
                  </button>
                  <button
                    onClick={() => handleNewSession(track.id)}
                    className='flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors'>
                    <Plus className='w-4 h-4' />
                    جلسة جديدة
                  </button>
                </div>
              </div>
            </div>
          ))}

          {tracks.length > 5 && (
            <div className='text-center py-4'>
              <button className='text-blue-600 hover:text-blue-800 font-medium'>
                عرض جميع المسارات ({tracks.length})
              </button>
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
                    <UserCheck className='w-4 h-4 ml-2' />
                    {session.track.instructor.name}
                  </div>
                </div>

                <div className='flex justify-between items-center mt-3'>
                  <span className='text-sm text-gray-500'>
                    {session.track.grade.name}
                  </span>
                  <div className='flex gap-2'>
                    <button
                      onClick={() => handleEditSession(session)}
                      className='flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors cursor-pointer'>
                      <Edit className='w-4 h-4' />
                      تعديل
                    </button>
                    <button
                      onClick={() => handleScheduleSession(session)}
                      className='flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors cursor-pointer'>
                      <Calendar className='w-4 h-4' />
                      جدولة
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
        <button
          onClick={() => openModal("trackModal")}
          className='flex items-center justify-center p-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl'>
          <Plus className='w-6 h-6 ml-2' />
          إنشاء مسار جديد
        </button>
        <button
          onClick={() => openModal("sessionModal")}
          className='flex items-center justify-center p-6 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-lg hover:shadow-xl'>
          <Calendar className='w-6 h-6 ml-2' />
          جدولة جلسة
        </button>
        <button
          onClick={() => openModal("reportsModal")}
          className='flex items-center justify-center p-6 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-lg hover:shadow-xl'>
          <BarChart3 className='w-6 h-6 ml-2' />
          تقارير الحضور
        </button>
        <button
          onClick={() => openModal("instructorModal")}
          className='flex items-center justify-center p-6 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-xl'>
          <UserCheck className='w-6 h-6 ml-2' />
          إدارة المعلمين
        </button>
      </div>

      {/* Modals */}
      <TrackModal
        isOpen={modals.trackModal}
        onClose={() => closeModal("trackModal")}
        onSuccess={handleModalSuccess}
      />

      <SessionSchedulingModal
        isOpen={modals.sessionModal}
        onClose={() => closeModal("sessionModal")}
        onSuccess={handleModalSuccess}
        editSession={editSession}
      />

      <InstructorManagementModal
        isOpen={modals.instructorModal}
        onClose={() => closeModal("instructorModal")}
      />

      <AttendanceReportsModal
        isOpen={modals.reportsModal}
        onClose={() => closeModal("reportsModal")}
      />

      {/* Detail Modals */}
      <SessionDetailsModal
        isOpen={showSessionDetails}
        onClose={() => {
          setShowSessionDetails(false);
          setSelectedSessionId(null);
        }}
        sessionId={selectedSessionId}
      />

      <AttendanceManagementModal
        isOpen={showAttendanceModal}
        onClose={() => {
          setShowAttendanceModal(false);
          setSelectedSessionId(null);
          fetchData(); // Refresh data after attendance changes
        }}
        sessionId={selectedSessionId}
      />

      <TrackDetailsModal
        isOpen={showTrackDetails}
        onClose={() => {
          setShowTrackDetails(false);
          setSelectedTrackId(null);
        }}
        trackId={selectedTrackId}
      />

      <AttendanceReportsModal
        isOpen={modals.reportsModal}
        onClose={() => closeModal("reportsModal")}
      />
    </DashboardLayout>
  );
}
