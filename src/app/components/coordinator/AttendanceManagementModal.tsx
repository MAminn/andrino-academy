"use client";

import { useState, useEffect, useCallback } from "react";
import { Users, Save, Calendar, Clock, BookOpen, X } from "lucide-react";

interface AttendanceManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: string | null;
}

interface AttendanceRecord {
  id: string;
  status: string;
  student: {
    id: string;
    name: string;
    email: string;
  };
}

interface Session {
  id: string;
  title: string;
  date: string;
  startTime: string;
  track: {
    name: string;
    grade: {
      name: string;
    };
  };
  attendance: AttendanceRecord[];
}

export default function AttendanceManagementModal({
  isOpen,
  onClose,
  sessionId,
}: AttendanceManagementModalProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [attendance, setAttendance] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchSessionDetails = useCallback(async () => {
    if (!sessionId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/sessions/${sessionId}`);
      if (!response.ok) {
        throw new Error("فشل في تحميل بيانات الجلسة");
      }

      const result = await response.json();
      // API returns { success, data, message, timestamp }
      const sessionData = result.data || result.session;

      // Map attendances to attendance for compatibility
      if (sessionData.attendances && !sessionData.attendance) {
        sessionData.attendance = sessionData.attendances;
      }

      setSession(sessionData);

      // Initialize attendance map from existing records
      const attendanceMap = new Map<string, string>();
      (sessionData.attendance || []).forEach((record: AttendanceRecord) => {
        attendanceMap.set(record.student.id, record.status);
      });
      setAttendance(attendanceMap);
    } catch (error) {
      console.error("Error fetching session:", error);
      setError(
        error instanceof Error ? error.message : "فشل في تحميل البيانات"
      );
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    if (isOpen && sessionId) {
      fetchSessionDetails();
    }
  }, [isOpen, sessionId, fetchSessionDetails]);

  const handleStatusChange = (studentId: string, status: string) => {
    setAttendance((prev) => {
      const newMap = new Map(prev);
      newMap.set(studentId, status);
      return newMap;
    });
  };

  const handleSave = async () => {
    if (!sessionId) return;

    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Convert Map to array of updates
      const updates = Array.from(attendance.entries()).map(
        ([studentId, status]) => ({
          studentId,
          status,
        })
      );

      const response = await fetch(`/api/sessions/${sessionId}/attendance`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ attendance: updates }),
      });

      if (!response.ok) {
        throw new Error("فشل في حفظ الحضور");
      }

      setSuccessMessage("تم حفظ الحضور بنجاح");
      setTimeout(() => {
        setSuccessMessage(null);
        onClose();
      }, 2000);
    } catch (error) {
      console.error("Error saving attendance:", error);
      setError(error instanceof Error ? error.message : "فشل في حفظ الحضور");
    } finally {
      setSaving(false);
    }
  };

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

  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      present: "bg-green-500 hover:bg-green-600",
      absent: "bg-red-500 hover:bg-red-600",
      late: "bg-yellow-500 hover:bg-yellow-600",
      excused: "bg-blue-500 hover:bg-blue-600",
    };
    return colorMap[status] || "bg-gray-500 hover:bg-gray-600";
  };

  const statusOptions = [
    { value: "present", label: "حاضر", color: "green" },
    { value: "absent", label: "غائب", color: "red" },
    { value: "late", label: "متأخر", color: "yellow" },
    { value: "excused", label: "معذور", color: "blue" },
  ];

  return (
    <>
      {isOpen && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
          <div
            className='bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto'
            dir='rtl'>
            {/* Header */}
            <div className='sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between'>
              <h2 className='text-xl font-bold text-gray-800'>إدارة الحضور</h2>
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
                    <p className='mt-4 text-gray-600'>جارٍ تحميل البيانات...</p>
                  </div>
                )}

                {error && (
                  <div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg'>
                    {error}
                  </div>
                )}

                {successMessage && (
                  <div className='bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg'>
                    {successMessage}
                  </div>
                )}

                {!loading && session && (
                  <>
                    {/* Session Info */}
                    <div className='bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg'>
                      <h3 className='text-lg font-semibold text-gray-800 mb-3'>
                        {session.title}
                      </h3>
                      <div className='grid grid-cols-1 md:grid-cols-3 gap-3 text-sm'>
                        <div className='flex items-center text-gray-700'>
                          <Calendar className='w-4 h-4 ml-2 text-blue-600' />
                          <span>{formatDate(session.date)}</span>
                        </div>
                        <div className='flex items-center text-gray-700'>
                          <Clock className='w-4 h-4 ml-2 text-blue-600' />
                          <span>{formatTime(session.startTime)}</span>
                        </div>
                        <div className='flex items-center text-gray-700'>
                          <BookOpen className='w-4 h-4 ml-2 text-blue-600' />
                          <span>
                            {session.track.name} - {session.track.grade.name}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Attendance Stats */}
                    <div className='grid grid-cols-4 gap-2 text-center'>
                      {statusOptions.map((option) => {
                        const count = Array.from(attendance.values()).filter(
                          (status) => status === option.value
                        ).length;
                        return (
                          <div
                            key={option.value}
                            className='bg-gray-50 p-3 rounded-lg'>
                            <div
                              className={`text-2xl font-bold text-${option.color}-600`}>
                              {count}
                            </div>
                            <div className='text-xs text-gray-600'>
                              {option.label}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Students List */}
                    <div>
                      <div className='flex items-center justify-between mb-4'>
                        <h3 className='text-lg font-semibold text-gray-800'>
                          قائمة الطلاب
                        </h3>
                        <div className='flex items-center gap-2 text-sm text-gray-600'>
                          <Users className='w-4 h-4' />
                          <span>{session.attendance.length} طالب</span>
                        </div>
                      </div>

                      <div className='max-h-96 overflow-y-auto space-y-3'>
                        {session.attendance.map((record) => (
                          <div
                            key={record.id}
                            className='flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors'>
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

                            {/* Status Buttons */}
                            <div className='flex gap-2'>
                              {statusOptions.map((option) => (
                                <button
                                  key={option.value}
                                  onClick={() =>
                                    handleStatusChange(
                                      record.student.id,
                                      option.value
                                    )
                                  }
                                  className={`px-3 py-1.5 rounded-lg text-white text-sm font-medium transition-all ${
                                    attendance.get(record.student.id) ===
                                    option.value
                                      ? getStatusColor(option.value) +
                                        " ring-2 ring-offset-2 ring-gray-300"
                                      : "bg-gray-300 hover:bg-gray-400"
                                  }`}>
                                  {option.label}
                                </button>
                              ))}
                            </div>
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
                        onClick={handleSave}
                        disabled={saving}
                        className='flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition-colors flex items-center justify-center gap-2'>
                        {saving ? (
                          <>
                            <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white'></div>
                            <span>جارٍ الحفظ...</span>
                          </>
                        ) : (
                          <>
                            <Save className='w-4 h-4' />
                            <span>حفظ الحضور</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={onClose}
                        disabled={saving}
                        className='px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 transition-colors'>
                        إلغاء
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
