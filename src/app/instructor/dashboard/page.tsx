/**
 * Instructor Dashboard - Clean Zustand Implementation
 * Andrino Academy - External Session Coordination Platform
 *
 * Features:
 * - Zustand state management (no useState)
 * - External link validation for sessions
 * - Arabic RTL interface
 * - Session status workflow (draft → scheduled → ready → active → completed)
 * - Complete TypeScript safety
 */

"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import DashboardLayout from "@/app/components/dashboard/DashboardLayout";
import {
  WelcomeCard,
  StatCard,
  QuickActionCard,
} from "@/app/components/dashboard/DashboardComponents";
import { useSessionStore, useTrackStore, useUIStore } from "@/stores";
import SessionLinkModal from "@/app/components/instructor/SessionLinkModal";
import AttendanceModal from "@/app/components/AttendanceModal";
import {
  BookOpen,
  Calendar,
  Plus,
  Edit,
  Clock,
  TrendingUp,
  UserCheck,
  Activity,
  Link,
  ExternalLink,
  Play,
  Pause,
  AlertCircle,
} from "lucide-react";
import { canStartSession } from "@/lib/sessionValidation";

export default function InstructorDashboard() {
  const { data: session } = useSession();

  // Zustand stores - centralized state management
  const {
    sessions,
    todaySessions,
    upcomingSessions,
    loading: sessionsLoading,
    error: sessionsError,
    fetchSessions,
    fetchTodaySessions,
    fetchUpcomingSessions,
    updateSession,
  } = useSessionStore();

  const {
    tracks,
    loading: tracksLoading,
    error: tracksError,
    fetchTracks,
  } = useTrackStore();

  const {
    addNotification,
    openModal,
    setModalData,
    globalLoading,
    setGlobalLoading,
  } = useUIStore();

  // Combined loading state
  const loading = sessionsLoading || tracksLoading || globalLoading;

  // Load instructor data
  useEffect(() => {
    if (!session?.user?.id) return;

    const loadInstructorData = async () => {
      setGlobalLoading(true);
      try {
        // Load instructor's tracks and sessions in parallel
        await Promise.all([
          fetchTracks(),
          fetchSessions({ instructorId: session.user.id }),
          fetchTodaySessions(),
          fetchUpcomingSessions(),
        ]);

        addNotification({
          type: "success",
          message: "تم تحميل بيانات لوحة التحكم بنجاح",
        });
      } catch {
        addNotification({
          type: "error",
          message: "حدث خطأ في تحميل البيانات",
        });
      } finally {
        setGlobalLoading(false);
      }
    };

    loadInstructorData();
  }, [
    session?.user?.id,
    fetchTracks,
    fetchSessions,
    fetchTodaySessions,
    fetchUpcomingSessions,
    setGlobalLoading,
    addNotification,
  ]);

  // Event handlers using Zustand actions
  const handleCreateSession = () => {
    setModalData({ selectedSessionId: null });
    openModal("sessionModal");
  };

  const handleEditSession = (sessionId: string) => {
    setModalData({ selectedSessionId: sessionId });
    openModal("sessionModal");
  };

  const handleAddSessionLink = (sessionId: string) => {
    setModalData({ selectedSessionId: sessionId });
    openModal("sessionLinkModal");
  };

  const handleStartSession = async (sessionId: string) => {
    // Find the session to check external link
    const session = sessions?.find((s) => s.id === sessionId);

    // ✅ CRITICAL VALIDATION: Cannot start without valid external link
    if (!canStartSession(session?.externalLink)) {
      addNotification({
        type: "error",
        message: "⚠️ لا يمكن بدء الجلسة بدون رابط خارجي صحيح (Zoom/Meet/Teams)",
      });

      // Auto-open link modal to help instructor
      setModalData({ selectedSessionId: sessionId });
      openModal("sessionLinkModal");
      return;
    }

    // Proceed with starting the session
    const success = await updateSession(sessionId, { status: "ACTIVE" });
    if (success) {
      addNotification({
        type: "success",
        message: "✅ تم بدء الجلسة بنجاح - الطلاب يمكنهم الانضمام الآن",
      });

      // Automatically open the external meeting in new tab
      if (session?.externalLink) {
        handleJoinExternalSession(session.externalLink);
      }
    }
  };

  const handleCompleteSession = async (sessionId: string) => {
    const success = await updateSession(sessionId, { status: "COMPLETED" });
    if (success) {
      addNotification({
        type: "success",
        message: "تم إنهاء الجلسة بنجاح",
      });
    }
  };

  const handleJoinExternalSession = (externalLink: string) => {
    if (externalLink) {
      window.open(externalLink, "_blank", "noopener,noreferrer");
      addNotification({
        type: "info",
        message: "تم فتح رابط الجلسة في نافذة جديدة",
      });
    } else {
      addNotification({
        type: "error",
        message: "لم يتم تحديد رابط خارجي للجلسة",
      });
    }
  };

  // Computed values using store data with null checks
  const myTracks =
    tracks?.filter((track) => track.instructorId === session?.user?.id) || [];

  // Calculate statistics
  const totalTracks = myTracks.length;
  const totalSessions = sessions?.length || 0;
  const todaySessionsCount = todaySessions?.length || 0;
  const upcomingSessionsCount = upcomingSessions?.length || 0;

  // Session status styling
  const getSessionStatusColor = (status: string) => {
    switch (status) {
      case "DRAFT":
        return "bg-gray-100 text-gray-800";
      case "SCHEDULED":
        return "bg-blue-100 text-blue-800";
      case "READY":
        return "bg-green-100 text-green-800";
      case "ACTIVE":
        return "bg-orange-100 text-orange-800";
      case "COMPLETED":
        return "bg-purple-100 text-purple-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getSessionStatusText = (status: string) => {
    switch (status) {
      case "DRAFT":
        return "مسودة";
      case "SCHEDULED":
        return "مجدولة";
      case "READY":
        return "جاهزة";
      case "ACTIVE":
        return "نشطة";
      case "COMPLETED":
        return "مكتملة";
      case "CANCELLED":
        return "ملغية";
      default:
        return status;
    }
  };

  // Loading state
  if (loading && (sessions?.length || 0) === 0) {
    return (
      <DashboardLayout title='لوحة تحكم المدرب' role='instructor'>
        <div className='flex items-center justify-center min-h-[400px]'>
          <div className='text-center'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4'></div>
            <p className='text-gray-600'>جاري تحميل بيانات لوحة التحكم...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title='لوحة تحكم المدرب' role='instructor'>
      {/* Welcome Card */}
      <WelcomeCard
        name={session?.user?.name || "المدرب"}
        description='مرحباً بك في لوحة تحكم المدرب. يمكنك إدارة المسارات والجلسات وتتبع تقدم الطلاب.'
        icon={<BookOpen className='w-8 h-8' />}
      />

      {/* Statistics Cards */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-8'>
        <StatCard
          title='المسارات التعليمية'
          value={totalTracks}
          icon={<BookOpen className='w-6 h-6' />}
          color='bg-blue-500'
        />
        <StatCard
          title='إجمالي الجلسات'
          value={totalSessions}
          icon={<Calendar className='w-6 h-6' />}
          color='bg-green-500'
        />
        <StatCard
          title='جلسات اليوم'
          value={todaySessionsCount}
          icon={<Clock className='w-6 h-6' />}
          color='bg-orange-500'
        />
        <StatCard
          title='الجلسات القادمة'
          value={upcomingSessionsCount}
          icon={<TrendingUp className='w-6 h-6' />}
          color='bg-purple-500'
        />
      </div>

      {/* Quick Actions */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
        <QuickActionCard title='جلسة جديدة'>
          <button
            onClick={handleCreateSession}
            className='w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg flex items-center justify-center space-x-2 space-x-reverse transition-colors'>
            <Plus className='w-5 h-5' />
            <span>إنشاء جلسة جديدة</span>
          </button>
        </QuickActionCard>

        <QuickActionCard title='إدارة الحضور'>
          <button
            onClick={() => openModal("attendanceModal")}
            className='w-full bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg flex items-center justify-center space-x-2 space-x-reverse transition-colors'>
            <UserCheck className='w-5 h-5' />
            <span>مراجعة الحضور</span>
          </button>
        </QuickActionCard>

        <QuickActionCard title='تقارير الأداء'>
          <button
            onClick={() => openModal("reportsModal")}
            className='w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-lg flex items-center justify-center space-x-2 space-x-reverse transition-colors'>
            <Activity className='w-5 h-5' />
            <span>عرض التقارير</span>
          </button>
        </QuickActionCard>
      </div>

      {/* Error Messages */}
      {(sessionsError || tracksError) && (
        <div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6'>
          <strong>خطأ:</strong> {sessionsError || tracksError}
        </div>
      )}

      {/* Today's Sessions */}
      {(todaySessions?.length || 0) > 0 && (
        <div className='bg-white rounded-lg shadow-md p-6 mb-8'>
          <h2 className='text-xl font-bold text-gray-900 mb-6 flex items-center gap-2'>
            <Calendar className='w-5 h-5 text-blue-600' />
            جلسات اليوم ({todaySessions?.length || 0})
          </h2>

          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {todaySessions?.map((session) => (
              <div
                key={session.id}
                className='border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow'>
                <div className='flex justify-between items-start mb-3'>
                  <div className='flex-1'>
                    <h3 className='font-semibold text-gray-900'>
                      {session.title}
                    </h3>
                    <p className='text-sm text-gray-600'>
                      {new Date(session.startTime).toLocaleTimeString("ar-SA", {
                        hour12: true,
                      })}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getSessionStatusColor(
                      session.status
                    )}`}>
                    {getSessionStatusText(session.status)}
                  </span>
                </div>

                {/* External Link Status Indicator */}
                {!session.externalLink &&
                  session.status !== "COMPLETED" &&
                  session.status !== "CANCELLED" && (
                    <div className='flex items-center gap-1 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded px-2 py-1 mb-2'>
                      <AlertCircle className='w-3 h-3' />
                      <span>لم يتم إضافة رابط خارجي</span>
                    </div>
                  )}
                {session.externalLink && (
                  <div className='flex items-center gap-1 text-xs text-green-600 bg-green-50 border border-green-200 rounded px-2 py-1 mb-2'>
                    <Link className='w-3 h-3' />
                    <span>رابط متوفر ✓</span>
                  </div>
                )}

                <div className='flex gap-2 mt-3'>
                  {/* Add Link Button - Always show if no link or session not active/completed */}
                  {!session.externalLink &&
                    session.status !== "ACTIVE" &&
                    session.status !== "COMPLETED" && (
                      <button
                        onClick={() => handleAddSessionLink(session.id)}
                        className='bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 transition-colors flex items-center gap-1'>
                        <Link className='w-3 h-3' />
                        إضافة رابط
                      </button>
                    )}

                  {/* Start Button - Show only if has link and status allows */}
                  {session.externalLink &&
                    (session.status === "READY" ||
                      session.status === "SCHEDULED") && (
                      <button
                        onClick={() => handleStartSession(session.id)}
                        className='bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700 transition-colors flex items-center gap-1'>
                        <Play className='w-3 h-3' />
                        بدء الجلسة
                      </button>
                    )}

                  {/* Active Session Controls */}
                  {session.status === "ACTIVE" && (
                    <>
                      <button
                        onClick={() =>
                          handleJoinExternalSession(session.externalLink || "")
                        }
                        className='bg-orange-600 text-white px-3 py-1 rounded text-xs hover:bg-orange-700 transition-colors flex items-center gap-1'>
                        <ExternalLink className='w-3 h-3' />
                        انضمام
                      </button>
                      <button
                        onClick={() => handleCompleteSession(session.id)}
                        className='bg-purple-600 text-white px-3 py-1 rounded text-xs hover:bg-purple-700 transition-colors flex items-center gap-1'>
                        <Pause className='w-3 h-3' />
                        إنهاء
                      </button>
                    </>
                  )}

                  {/* Edit Button */}
                  {session.status !== "COMPLETED" && (
                    <button
                      onClick={() => handleEditSession(session.id)}
                      className='bg-gray-600 text-white px-3 py-1 rounded text-xs hover:bg-gray-700 transition-colors flex items-center gap-1'>
                      <Edit className='w-3 h-3' />
                      تعديل
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* My Tracks */}
      <div className='bg-white rounded-lg shadow-md p-6 mb-8'>
        <h2 className='text-xl font-bold text-gray-900 mb-6 flex items-center gap-2'>
          <BookOpen className='w-5 h-5 text-green-600' />
          مساراتي ({myTracks.length})
        </h2>

        {myTracks.length === 0 ? (
          <div className='text-center py-8'>
            <BookOpen className='w-12 h-12 text-gray-400 mx-auto mb-4' />
            <p className='text-gray-500'>لم يتم تعيين أي مسارات لك بعد</p>
          </div>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {myTracks.map((track) => (
              <div
                key={track.id}
                className='border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow'>
                <h3 className='font-semibold text-gray-900 mb-2'>
                  {track.name}
                </h3>
                <p className='text-sm text-gray-600 mb-3'>
                  {track.description}
                </p>
                <div className='text-xs text-gray-500'>
                  <p>المستوى: {track.grade?.name}</p>
                  <p>الجلسات: {track._count?.liveSessions || 0}</p>
                  <p>الحالة: {track.isActive ? "نشط" : "غير نشط"}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upcoming Sessions */}
      {(upcomingSessions?.length || 0) > 0 && (
        <div className='bg-white rounded-lg shadow-md p-6'>
          <h2 className='text-xl font-bold text-gray-900 mb-6 flex items-center gap-2'>
            <TrendingUp className='w-5 h-5 text-purple-600' />
            الجلسات القادمة ({upcomingSessions?.length || 0})
          </h2>

          <div className='space-y-3'>
            {upcomingSessions?.slice(0, 5).map((session) => (
              <div
                key={session.id}
                className='flex items-center justify-between p-3 border border-gray-200 rounded-lg'>
                <div>
                  <h4 className='font-semibold text-gray-900'>
                    {session.title}
                  </h4>
                  <p className='text-sm text-gray-600'>
                    {new Date(session.date).toLocaleDateString("ar-SA")} -
                    {new Date(session.startTime).toLocaleTimeString("ar-SA", {
                      hour12: true,
                    })}
                  </p>
                </div>
                <div className='flex items-center gap-3'>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getSessionStatusColor(
                      session.status
                    )}`}>
                    {getSessionStatusText(session.status)}
                  </span>
                  <button
                    onClick={() => handleEditSession(session.id)}
                    className='text-blue-600 hover:text-blue-800'>
                    <Edit className='w-4 h-4' />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      <SessionLinkModal
        isOpen={useUIStore.getState().modals.sessionLinkModal}
        onClose={() => useUIStore.getState().closeModal("sessionLinkModal")}
        sessionId={useUIStore.getState().modalData?.selectedSessionId || ""}
        sessionTitle={
          sessions?.find(
            (s) => s.id === useUIStore.getState().modalData?.selectedSessionId
          )?.title || ""
        }
        currentLink={
          sessions?.find(
            (s) => s.id === useUIStore.getState().modalData?.selectedSessionId
          )?.externalLink
        }
        onLinkUpdated={async (newLink: string) => {
          const sessionId = useUIStore.getState().modalData?.selectedSessionId;
          if (sessionId) {
            await updateSession(sessionId, { externalLink: newLink });
            await fetchSessions({ instructorId: session?.user?.id });
          }
        }}
      />

      <AttendanceModal
        sessionId={useUIStore.getState().modalData?.selectedSessionId || ""}
        isOpen={useUIStore.getState().modals.attendanceModal}
        onClose={() => useUIStore.getState().closeModal("attendanceModal")}
      />
    </DashboardLayout>
  );
}
