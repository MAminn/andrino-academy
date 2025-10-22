"use client";

import { useState, useEffect, useCallback } from "react";
import {
  X,
  Clock,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Users,
  AlertCircle,
} from "lucide-react";

interface WeeklyScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: string;
}

interface ScheduleSession {
  id: string;
  title: string;
  trackName: string;
  date: string;
  startTime: string;
  endTime: string;
  location?: string;
  instructor: string;
  status: string;
  attendanceStatus?: string;
  externalLink?: string;
}

interface WeeklySchedule {
  weekStart: string;
  weekEnd: string;
  sessions: ScheduleSession[];
}

const DAYS_OF_WEEK = [
  "الأحد",
  "الاثنين",
  "الثلاثاء",
  "الأربعاء",
  "الخميس",
  "الجمعة",
  "السبت",
];

export default function WeeklyScheduleModal({
  isOpen,
  onClose,
  studentId,
}: WeeklyScheduleModalProps) {
  const [scheduleData, setScheduleData] = useState<WeeklySchedule | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentWeek, setCurrentWeek] = useState(new Date());

  const fetchWeeklySchedule = useCallback(
    async (weekDate: Date) => {
      setLoading(true);
      setError(null);

      try {
        const weekStart = getWeekStart(weekDate);
        const weekEnd = getWeekEnd(weekDate);

        const response = await fetch(
          `/api/students/${studentId}/schedule?start=${weekStart.toISOString()}&end=${weekEnd.toISOString()}`
        );

        if (!response.ok) {
          throw new Error("فشل في تحميل الجدول الأسبوعي");
        }

        const data = await response.json();
        setScheduleData(data);
      } catch (error) {
        console.error("Error fetching weekly schedule:", error);
        setError(
          error instanceof Error
            ? error.message
            : "فشل في تحميل الجدول الأسبوعي"
        );
      } finally {
        setLoading(false);
      }
    },
    [studentId]
  );

  useEffect(() => {
    if (isOpen && studentId) {
      fetchWeeklySchedule(currentWeek);
    }
  }, [isOpen, studentId, currentWeek, fetchWeeklySchedule]);

  const getWeekStart = (date: Date) => {
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay());
    weekStart.setHours(0, 0, 0, 0);
    return weekStart;
  };

  const getWeekEnd = (date: Date) => {
    const weekEnd = new Date(date);
    weekEnd.setDate(date.getDate() - date.getDay() + 6);
    weekEnd.setHours(23, 59, 59, 999);
    return weekEnd;
  };

  const navigateWeek = (direction: "prev" | "next") => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(currentWeek.getDate() + (direction === "next" ? 7 : -7));
    setCurrentWeek(newWeek);
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString("ar-SA", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ar-SA", {
      month: "numeric",
      day: "numeric",
    });
  };

  const getSessionsByDay = () => {
    if (!scheduleData) return {};

    const sessionsByDay: { [key: string]: ScheduleSession[] } = {};

    scheduleData.sessions.forEach((session) => {
      const sessionDate = new Date(session.date);
      const dayIndex = sessionDate.getDay();
      const dayName = DAYS_OF_WEEK[dayIndex];

      if (!sessionsByDay[dayName]) {
        sessionsByDay[dayName] = [];
      }

      sessionsByDay[dayName].push(session);
    });

    // Sort sessions by start time for each day
    Object.keys(sessionsByDay).forEach((day) => {
      sessionsByDay[day].sort((a, b) => a.startTime.localeCompare(b.startTime));
    });

    return sessionsByDay;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "scheduled":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "completed":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getAttendanceColor = (status?: string) => {
    switch (status) {
      case "present":
        return "text-green-600";
      case "absent":
        return "text-red-600";
      case "late":
        return "text-yellow-600";
      default:
        return "text-gray-600";
    }
  };

  const getAttendanceLabel = (status?: string) => {
    switch (status) {
      case "present":
        return "حاضر";
      case "absent":
        return "غائب";
      case "late":
        return "متأخر";
      default:
        return "لم يتم التسجيل";
    }
  };

  const handleJoinSession = (externalLink: string) => {
    if (externalLink) {
      window.open(externalLink, "_blank", "noopener,noreferrer");
    }
  };

  const isCurrentWeek = () => {
    const now = new Date();
    const weekStart = getWeekStart(currentWeek);
    const weekEnd = getWeekEnd(currentWeek);
    return now >= weekStart && now <= weekEnd;
  };

  if (!isOpen) return null;

  const sessionsByDay = getSessionsByDay();
  const weekStart = scheduleData
    ? new Date(scheduleData.weekStart)
    : getWeekStart(currentWeek);
  const weekEnd = scheduleData
    ? new Date(scheduleData.weekEnd)
    : getWeekEnd(currentWeek);

  return (
    <div
      className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'
      style={{ overflow: "hidden" }}>
      <div className='bg-white rounded-lg shadow-xl max-w-7xl w-full max-h-[90vh] flex flex-col'>
        {/* Header */}
        <div className='flex items-center justify-between p-6 border-b flex-shrink-0'>
          <div>
            <h2 className='text-xl font-semibold text-gray-900'>
              الجدول الأسبوعي
            </h2>
            <p className='text-sm text-gray-600 mt-1'>
              {weekStart.toLocaleDateString("ar-SA")} -{" "}
              {weekEnd.toLocaleDateString("ar-SA")}
              {isCurrentWeek() && (
                <span className='text-blue-600 font-medium'>
                  {" "}
                  (الأسبوع الحالي)
                </span>
              )}
            </p>
          </div>
          <button
            onClick={onClose}
            className='text-gray-400 hover:text-gray-600 transition-colors'>
            <X className='w-6 h-6' />
          </button>
        </div>

        {/* Week Navigation */}
        <div className='flex items-center justify-between p-4 border-b bg-gray-50 flex-shrink-0'>
          <button
            onClick={() => navigateWeek("prev")}
            className='flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors'>
            <ChevronRight className='w-4 h-4' />
            الأسبوع السابق
          </button>

          <button
            onClick={() => setCurrentWeek(new Date())}
            className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'>
            الأسبوع الحالي
          </button>

          <button
            onClick={() => navigateWeek("next")}
            className='flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors'>
            الأسبوع التالي
            <ChevronLeft className='w-4 h-4' />
          </button>
        </div>

        {/* Content */}
        <div
          className='flex-1 overflow-y-auto p-6'
          style={{ minHeight: "200px" }}>
          {loading ? (
            <div className='flex items-center justify-center py-12'>
              <div className='text-center'>
                <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4'></div>
                <p className='text-gray-600'>جارٍ تحميل الجدول...</p>
              </div>
            </div>
          ) : error ? (
            <div className='flex items-center justify-center py-12'>
              <div className='text-center'>
                <AlertCircle className='w-12 h-12 text-red-500 mx-auto mb-4' />
                <p className='text-red-600 mb-4'>{error}</p>
                <button
                  onClick={() => fetchWeeklySchedule(currentWeek)}
                  className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'>
                  إعادة المحاولة
                </button>
              </div>
            </div>
          ) : (
            <div className='grid grid-cols-1 lg:grid-cols-7 gap-4'>
              {DAYS_OF_WEEK.map((day, index) => {
                const dayDate = new Date(weekStart);
                dayDate.setDate(weekStart.getDate() + index);
                const isToday =
                  dayDate.toDateString() === new Date().toDateString();
                const daySessions = sessionsByDay[day] || [];

                return (
                  <div key={day} className='border rounded-lg overflow-hidden'>
                    <div
                      className={`p-4 text-center border-b ${
                        isToday ? "bg-blue-100 border-blue-200" : "bg-gray-50"
                      }`}>
                      <h3
                        className={`font-semibold ${
                          isToday ? "text-blue-900" : "text-gray-900"
                        }`}>
                        {day}
                      </h3>
                      <p
                        className={`text-sm ${
                          isToday ? "text-blue-700" : "text-gray-600"
                        }`}>
                        {formatDate(dayDate.toISOString())}
                      </p>
                      {isToday && (
                        <span className='text-xs bg-blue-600 text-white px-2 py-1 rounded-full'>
                          اليوم
                        </span>
                      )}
                    </div>

                    <div className='p-2 min-h-[200px]'>
                      {daySessions.length === 0 ? (
                        <div className='text-center py-8 text-gray-500 text-sm'>
                          لا توجد جلسات
                        </div>
                      ) : (
                        <div className='space-y-2'>
                          {daySessions.map((session) => (
                            <div
                              key={session.id}
                              className={`p-3 rounded-lg border text-sm ${getStatusColor(
                                session.status
                              )}`}>
                              <div className='font-medium mb-1 text-xs'>
                                {session.trackName}
                              </div>
                              <div className='font-semibold mb-2'>
                                {session.title}
                              </div>

                              <div className='space-y-1 text-xs'>
                                <div className='flex items-center gap-1'>
                                  <Clock className='w-3 h-3' />
                                  {formatTime(session.startTime)} -{" "}
                                  {formatTime(session.endTime)}
                                </div>

                                <div className='flex items-center gap-1'>
                                  <Users className='w-3 h-3' />
                                  {session.instructor}
                                </div>

                                {session.location && (
                                  <div className='flex items-center gap-1'>
                                    <MapPin className='w-3 h-3' />
                                    {session.location}
                                  </div>
                                )}

                                {session.attendanceStatus && (
                                  <div
                                    className={`font-medium ${getAttendanceColor(
                                      session.attendanceStatus
                                    )}`}>
                                    {getAttendanceLabel(
                                      session.attendanceStatus
                                    )}
                                  </div>
                                )}
                              </div>

                              {session.status === "active" &&
                                session.externalLink && (
                                  <button
                                    onClick={() =>
                                      handleJoinSession(session.externalLink!)
                                    }
                                    className='w-full mt-2 px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 transition-colors'>
                                    انضم الآن
                                  </button>
                                )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className='border-t p-6 bg-gray-50'>
          <div className='flex justify-between items-center'>
            <div className='text-sm text-gray-600'>
              {scheduleData
                ? `${scheduleData.sessions.length} جلسة مجدولة هذا الأسبوع`
                : ""}
            </div>
            <button
              onClick={onClose}
              className='px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors'>
              إغلاق
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
