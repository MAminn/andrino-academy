"use client";

import { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  BookOpen,
  UserCheck,
  Users,
  Link as LinkIcon,
  X,
} from "lucide-react";

interface SessionDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: string | null;
}

interface Session {
  id: string;
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  externalLink?: string;
  track: {
    id: string;
    name: string;
    grade: {
      id: string;
      name: string;
    };
  };
  instructor: {
    id: string;
    name: string;
    email: string;
  };
  attendance: {
    id: string;
    status: string;
    student: {
      id: string;
      name: string;
      email: string;
    };
  }[];
}

export default function SessionDetailsModal({
  isOpen,
  onClose,
  sessionId,
}: SessionDetailsModalProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSessionDetails = async () => {
    if (!sessionId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/sessions/${sessionId}`);
      if (!response.ok) {
        throw new Error("فشل في تحميل تفاصيل الجلسة");
      }

      const result = await response.json();
      // API returns { success, data, message, timestamp }
      const sessionData = result.data || result.session;

      // Map attendances to attendance for compatibility
      if (sessionData.attendances && !sessionData.attendance) {
        sessionData.attendance = sessionData.attendances;
      }

      setSession(sessionData);
    } catch (error) {
      console.error("Error fetching session:", error);
      setError(
        error instanceof Error ? error.message : "فشل في تحميل التفاصيل"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && sessionId) {
      fetchSessionDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, sessionId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ar-SA", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString("ar-SA", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      ACTIVE: { label: "جارية", className: "bg-green-100 text-green-800" },
      SCHEDULED: { label: "مجدولة", className: "bg-blue-100 text-blue-800" },
      COMPLETED: { label: "مكتملة", className: "bg-gray-100 text-gray-800" },
      CANCELLED: { label: "ملغاة", className: "bg-red-100 text-red-800" },
      DRAFT: { label: "مسودة", className: "bg-yellow-100 text-yellow-800" },
      READY: { label: "جاهزة", className: "bg-indigo-100 text-indigo-800" },
    };

    const statusInfo = statusMap[status] || statusMap.DRAFT;
    return (
      <span
        className={`px-3 py-1 rounded-full text-sm font-medium ${statusInfo.className}`}>
        {statusInfo.label}
      </span>
    );
  };

  const getAttendanceStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      PRESENT: { label: "حاضر", className: "bg-green-100 text-green-800" },
      ABSENT: { label: "غائب", className: "bg-red-100 text-red-800" },
      LATE: { label: "متأخر", className: "bg-yellow-100 text-yellow-800" },
      EXCUSED: { label: "معذور", className: "bg-blue-100 text-blue-800" },
    };

    const statusInfo = statusMap[status] || statusMap.ABSENT;
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.className}`}>
        {statusInfo.label}
      </span>
    );
  };

  const presentCount =
    session?.attendance.filter((a) => a.status === "PRESENT").length || 0;
  const totalStudents = session?.attendance.length || 0;

  return (
    <>
      {isOpen && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
          <div
            className='bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto'
            dir='rtl'>
            {/* Header */}
            <div className='sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between'>
              <h2 className='text-xl font-bold text-gray-800'>تفاصيل الجلسة</h2>
              <button
                onClick={onClose}
                className='text-gray-500 hover:text-gray-700 transition-colors'>
                <X className='w-6 h-6' />
              </button>
            </div>

            {/* Content */}
            <div className='p-6'>
              <div className='space-y-6'>
                {loading && (
                  <div className='text-center py-8'>
                    <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto'></div>
                    <p className='mt-4 text-gray-600'>جارٍ تحميل التفاصيل...</p>
                  </div>
                )}

                {error && (
                  <div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg'>
                    {error}
                  </div>
                )}

                {!loading && !error && session && (
                  <>
                    {/* Header */}
                    <div className='bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg'>
                      <div className='flex items-start justify-between mb-4'>
                        <div>
                          <h2 className='text-2xl font-bold text-gray-800 mb-2'>
                            {session.title}
                          </h2>
                          {session.description && (
                            <p className='text-gray-600'>
                              {session.description}
                            </p>
                          )}
                        </div>
                        {getStatusBadge(session.status)}
                      </div>

                      <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mt-4'>
                        <div className='flex items-center text-gray-700'>
                          <Calendar className='w-5 h-5 ml-2 text-blue-600' />
                          <span>{formatDate(session.date)}</span>
                        </div>
                        <div className='flex items-center text-gray-700'>
                          <Clock className='w-5 h-5 ml-2 text-blue-600' />
                          <span>
                            {formatTime(session.startTime)} -{" "}
                            {formatTime(session.endTime)}
                          </span>
                        </div>
                        <div className='flex items-center text-gray-700'>
                          <BookOpen className='w-5 h-5 ml-2 text-blue-600' />
                          <span>
                            {session.track.name} - {session.track.grade.name}
                          </span>
                        </div>
                        <div className='flex items-center text-gray-700'>
                          <UserCheck className='w-5 h-5 ml-2 text-blue-600' />
                          <span>{session.instructor.name}</span>
                        </div>
                      </div>

                      {session.externalLink && (
                        <div className='mt-4 p-3 bg-white rounded-lg'>
                          <div className='flex items-center justify-between'>
                            <div className='flex items-center text-sm text-gray-600'>
                              <LinkIcon className='w-4 h-4 ml-2' />
                              <span>رابط الجلسة الخارجي</span>
                            </div>
                            <a
                              href={session.externalLink}
                              target='_blank'
                              rel='noopener noreferrer'
                              className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm'>
                              فتح الجلسة
                            </a>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Attendance Summary */}
                    <div className='bg-gray-50 p-4 rounded-lg'>
                      <div className='flex items-center justify-between mb-4'>
                        <h3 className='text-lg font-semibold text-gray-800'>
                          ملخص الحضور
                        </h3>
                        <div className='flex items-center gap-2'>
                          <Users className='w-5 h-5 text-gray-600' />
                          <span className='text-gray-700'>
                            {presentCount} / {totalStudents} طالب
                          </span>
                        </div>
                      </div>

                      <div className='grid grid-cols-4 gap-2 text-center'>
                        <div className='bg-white p-3 rounded'>
                          <div className='text-2xl font-bold text-green-600'>
                            {session.attendance.filter(
                              (a) => a.status === "PRESENT"
                            ).length || 0}
                          </div>
                          <div className='text-xs text-gray-600'>حاضر</div>
                        </div>
                        <div className='bg-white p-3 rounded'>
                          <div className='text-2xl font-bold text-red-600'>
                            {session.attendance.filter(
                              (a) => a.status === "ABSENT"
                            ).length || 0}
                          </div>
                          <div className='text-xs text-gray-600'>غائب</div>
                        </div>
                        <div className='bg-white p-3 rounded'>
                          <div className='text-2xl font-bold text-yellow-600'>
                            {session.attendance.filter(
                              (a) => a.status === "LATE"
                            ).length || 0}
                          </div>
                          <div className='text-xs text-gray-600'>متأخر</div>
                        </div>
                        <div className='bg-white p-3 rounded'>
                          <div className='text-2xl font-bold text-blue-600'>
                            {session.attendance.filter(
                              (a) => a.status === "EXCUSED"
                            ).length || 0}
                          </div>
                          <div className='text-xs text-gray-600'>معذور</div>
                        </div>
                      </div>
                    </div>

                    {/* Attendance List */}
                    <div>
                      <h3 className='text-lg font-semibold text-gray-800 mb-4'>
                        قائمة الحضور ({totalStudents} طالب)
                      </h3>
                      <div className='max-h-96 overflow-y-auto space-y-2'>
                        {session.attendance.map((record) => (
                          <div
                            key={record.id}
                            className='flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors'>
                            <div className='flex items-center gap-3'>
                              <div className='w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center'>
                                <span className='text-blue-600 font-semibold'>
                                  {record.student.name.charAt(0)}
                                </span>
                              </div>
                              <div>
                                <div className='font-medium text-gray-800'>
                                  {record.student.name}
                                </div>
                                <div className='text-sm text-gray-500'>
                                  {record.student.email}
                                </div>
                              </div>
                            </div>
                            {getAttendanceStatusBadge(record.status)}
                          </div>
                        ))}

                        {session.attendance.length === 0 && (
                          <div className='text-center py-8 text-gray-500'>
                            لا يوجد طلاب مسجلين في هذه الجلسة
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className='flex gap-3 pt-4 border-t'>
                      <button
                        onClick={onClose}
                        className='flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors'>
                        إغلاق
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
