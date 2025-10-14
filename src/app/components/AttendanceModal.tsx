"use client";

import { useState, useEffect, useCallback } from "react";
import {
  UserCheck,
  UserX,
  Clock,
  CheckCircle,
  X,
  Save,
  Users,
  AlertCircle
} from "lucide-react";

interface Student {
  id: string;
  name: string;
  email: string;
  gradeId: string;
}

interface AttendanceRecord {
  id: string;
  studentId: string;
  status: string;
  markedAt: string;
  markedBy: string | null;
  notes: string | null;
  student: Student;
}

interface Session {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
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
  };
  attendances: AttendanceRecord[];
}

interface AttendanceStats {
  totalStudents: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  excusedCount: number;
  attendanceRate: number;
}

interface AttendanceModalProps {
  sessionId: string;
  isOpen: boolean;
  onClose: () => void;
  onSave?: () => void;
}

export default function AttendanceModal({
  sessionId,
  isOpen,
  onClose,
  onSave
}: AttendanceModalProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [attendanceStats, setAttendanceStats] = useState<AttendanceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [attendanceData, setAttendanceData] = useState<Record<string, { status: string; notes: string }>>({});
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const fetchAttendanceData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/attendance/session/${sessionId}`);
      if (response.ok) {
        const data = await response.json();
        setSession(data.session);
        setAttendanceStats(data.attendanceStats);
        
        // Initialize attendance data state
        const initialData: Record<string, { status: string; notes: string }> = {};
        data.session.attendances.forEach((attendance: AttendanceRecord) => {
          initialData[attendance.studentId] = {
            status: attendance.status,
            notes: attendance.notes || ""
          };
        });
        setAttendanceData(initialData);
      }
    } catch (error) {
      console.error("Error fetching attendance data:", error);
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    if (isOpen && sessionId) {
      fetchAttendanceData();
    }
  }, [isOpen, sessionId, fetchAttendanceData]);

  const handleStatusChange = (studentId: string, status: string) => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status
      }
    }));
  };

  const handleNotesChange = (studentId: string, notes: string) => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        notes
      }
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      const attendanceUpdates = Object.entries(attendanceData).map(([studentId, data]) => ({
        studentId,
        status: data.status,
        notes: data.notes
      }));

      const response = await fetch(`/api/attendance/session/${sessionId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ attendanceUpdates })
      });

      if (response.ok) {
        await fetchAttendanceData(); // Refresh data
        onSave?.();
      }
    } catch (error) {
      console.error("Error saving attendance:", error);
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "present":
        return "bg-green-100 text-green-800 border-green-200";
      case "late":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "excused":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-red-100 text-red-800 border-red-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "present":
        return <UserCheck className="w-4 h-4" />;
      case "late":
        return <Clock className="w-4 h-4" />;
      case "excused":
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <UserX className="w-4 h-4" />;
    }
  };

  const filteredAttendances = session?.attendances.filter(attendance => {
    if (filterStatus === "all") return true;
    return (attendanceData[attendance.studentId]?.status || attendance.status) === filterStatus;
  }) || [];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold mb-2">إدارة الحضور</h2>
              {session && (
                <div className="text-blue-100 text-sm">
                  <p>{session.title}</p>
                  <p>{session.track.name} - {session.track.grade.name}</p>
                  <p>{new Date(session.date).toLocaleDateString("ar-SA")} | {session.startTime} - {session.endTime}</p>
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-blue-100 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            {attendanceStats && (
              <div className="p-6 border-b bg-gray-50">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{attendanceStats.totalStudents}</div>
                    <div className="text-sm text-gray-600">إجمالي الطلاب</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{attendanceStats.presentCount}</div>
                    <div className="text-sm text-gray-600">حاضر</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{attendanceStats.absentCount}</div>
                    <div className="text-sm text-gray-600">غائب</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">{attendanceStats.lateCount}</div>
                    <div className="text-sm text-gray-600">متأخر</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{attendanceStats.attendanceRate}%</div>
                    <div className="text-sm text-gray-600">معدل الحضور</div>
                  </div>
                </div>
              </div>
            )}

            {/* Filters */}
            <div className="p-4 border-b bg-white">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-700">فلترة حسب الحالة:</span>
                <div className="flex gap-2">
                  {[
                    { value: "all", label: "الكل", icon: Users },
                    { value: "present", label: "حاضر", icon: UserCheck },
                    { value: "absent", label: "غائب", icon: UserX },
                    { value: "late", label: "متأخر", icon: Clock },
                    { value: "excused", label: "معذور", icon: CheckCircle }
                  ].map((filter) => (
                    <button
                      key={filter.value}
                      onClick={() => setFilterStatus(filter.value)}
                      className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        filterStatus === filter.value
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      <filter.icon className="w-4 h-4" />
                      {filter.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Attendance List */}
            <div className="flex-1 overflow-auto p-6">
              <div className="space-y-3">
                {filteredAttendances.map((attendance) => {
                  const currentStatus = attendanceData[attendance.studentId]?.status || attendance.status;
                  const currentNotes = attendanceData[attendance.studentId]?.notes || attendance.notes || "";

                  return (
                    <div
                      key={attendance.id}
                      className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{attendance.student.name}</h3>
                            <p className="text-sm text-gray-600">{attendance.student.email}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          {/* Status Buttons */}
                          <div className="flex gap-2">
                            {[
                              { status: "present", label: "حاضر", color: "green" },
                              { status: "late", label: "متأخر", color: "yellow" },
                              { status: "absent", label: "غائب", color: "red" },
                              { status: "excused", label: "معذور", color: "blue" }
                            ].map((option) => (
                              <button
                                key={option.status}
                                onClick={() => handleStatusChange(attendance.studentId, option.status)}
                                className={`px-3 py-1 rounded-full text-sm font-medium border transition-colors ${
                                  currentStatus === option.status
                                    ? getStatusColor(option.status)
                                    : "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200"
                                }`}
                              >
                                <div className="flex items-center gap-1">
                                  {getStatusIcon(option.status)}
                                  {option.label}
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Notes */}
                      <div className="mt-3">
                        <textarea
                          value={currentNotes}
                          onChange={(e) => handleNotesChange(attendance.studentId, e.target.value)}
                          placeholder="ملاحظات (اختياري)"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          rows={2}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredAttendances.length === 0 && (
                <div className="text-center py-8">
                  <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">
                    {filterStatus === "all" 
                      ? "لا توجد سجلات حضور" 
                      : `لا توجد سجلات حضور بالحالة المحددة`
                    }
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t bg-gray-50 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                آخر تحديث: {new Date().toLocaleString("ar-SA")}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {saving ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {saving ? "جارٍ الحفظ..." : "حفظ الحضور"}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}