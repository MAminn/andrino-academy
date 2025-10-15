"use client";

import { useState, useEffect, useCallback } from "react";
import {
  X,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  AlertCircle,
  TrendingUp,
  BarChart3,
} from "lucide-react";

interface AttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: string;
}

interface AttendanceRecord {
  id: string;
  sessionId: string;
  sessionTitle: string;
  trackName: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  markedAt?: string;
  notes?: string;
  instructor: string;
}

interface AttendanceStats {
  totalSessions: number;
  attendedSessions: number;
  absentSessions: number;
  lateSessions: number;
  attendanceRate: number;
  currentStreak: number;
  longestStreak: number;
  monthlyStats: {
    month: string;
    attendanceRate: number;
    sessionsCount: number;
  }[];
}

export default function AttendanceModal({
  isOpen,
  onClose,
  studentId,
}: AttendanceModalProps) {
  const [attendanceRecords, setAttendanceRecords] = useState<
    AttendanceRecord[]
  >([]);
  const [stats, setStats] = useState<AttendanceStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"records" | "stats">("records");
  const [dateFilter, setDateFilter] = useState<
    "all" | "thisMonth" | "lastMonth" | "thisWeek"
  >("all");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "present" | "absent" | "late"
  >("all");

  const fetchAttendanceData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/students/${studentId}/attendance`);

      if (!response.ok) {
        throw new Error("فشل في تحميل بيانات الحضور");
      }

      const data = await response.json();
      setAttendanceRecords(data.records || []);
      setStats(data.stats || null);
    } catch (error) {
      console.error("Error fetching attendance data:", error);
      setError(
        error instanceof Error ? error.message : "فشل في تحميل بيانات الحضور"
      );
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    if (isOpen && studentId) {
      fetchAttendanceData();
    }
  }, [isOpen, studentId, fetchAttendanceData]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "present":
        return <CheckCircle className='w-5 h-5 text-green-600' />;
      case "absent":
        return <XCircle className='w-5 h-5 text-red-600' />;
      case "late":
        return <Clock className='w-5 h-5 text-yellow-600' />;
      default:
        return <AlertCircle className='w-5 h-5 text-gray-600' />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "present":
        return "bg-green-100 text-green-800 border-green-200";
      case "absent":
        return "bg-red-100 text-red-800 border-red-200";
      case "late":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "present":
        return "حاضر";
      case "absent":
        return "غائب";
      case "late":
        return "متأخر";
      default:
        return "غير محدد";
    }
  };

  const getFilteredRecords = () => {
    let filtered = attendanceRecords;

    // Filter by date
    const now = new Date();
    switch (dateFilter) {
      case "thisWeek":
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        filtered = filtered.filter(
          (record) => new Date(record.date) >= weekStart
        );
        break;
      case "thisMonth":
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        filtered = filtered.filter(
          (record) => new Date(record.date) >= monthStart
        );
        break;
      case "lastMonth":
        const lastMonthStart = new Date(
          now.getFullYear(),
          now.getMonth() - 1,
          1
        );
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
        filtered = filtered.filter((record) => {
          const recordDate = new Date(record.date);
          return recordDate >= lastMonthStart && recordDate <= lastMonthEnd;
        });
        break;
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((record) => record.status === statusFilter);
    }

    return filtered.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
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
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (!isOpen) return null;

  const filteredRecords = getFilteredRecords();

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
      <div className='bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden'>
        {/* Header */}
        <div className='flex items-center justify-between p-6 border-b'>
          <div>
            <h2 className='text-xl font-semibold text-gray-900'>سجل الحضور</h2>
            <p className='text-sm text-gray-600 mt-1'>تتبع حضورك وأدائك</p>
          </div>
          <button
            onClick={onClose}
            className='text-gray-400 hover:text-gray-600 transition-colors'>
            <X className='w-6 h-6' />
          </button>
        </div>

        {/* Stats Header */}
        {stats && (
          <div className='p-6 bg-gradient-to-r from-green-600 to-blue-600 text-white'>
            <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
              <div className='text-center'>
                <div className='flex items-center justify-center mb-2'>
                  <CheckCircle className='w-8 h-8' />
                </div>
                <p className='text-2xl font-bold'>
                  {stats.attendanceRate.toFixed(1)}%
                </p>
                <p className='text-sm text-green-100'>معدل الحضور</p>
              </div>

              <div className='text-center'>
                <div className='flex items-center justify-center mb-2'>
                  <Users className='w-8 h-8' />
                </div>
                <p className='text-2xl font-bold'>{stats.attendedSessions}</p>
                <p className='text-sm text-green-100'>
                  من {stats.totalSessions} جلسة
                </p>
              </div>

              <div className='text-center'>
                <div className='flex items-center justify-center mb-2'>
                  <TrendingUp className='w-8 h-8' />
                </div>
                <p className='text-2xl font-bold'>{stats.currentStreak}</p>
                <p className='text-sm text-green-100'>التسلسل الحالي</p>
              </div>

              <div className='text-center'>
                <div className='flex items-center justify-center mb-2'>
                  <BarChart3 className='w-8 h-8' />
                </div>
                <p className='text-2xl font-bold'>{stats.longestStreak}</p>
                <p className='text-sm text-green-100'>أطول تسلسل</p>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className='border-b bg-gray-50'>
          <nav className='flex'>
            {[
              { key: "records", label: "سجل الحضور", icon: Calendar },
              { key: "stats", label: "الإحصائيات", icon: BarChart3 },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as "records" | "stats")}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === tab.key
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}>
                <tab.icon className='w-4 h-4' />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className='flex-1 overflow-y-auto'>
          {loading ? (
            <div className='flex items-center justify-center py-12'>
              <div className='text-center'>
                <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4'></div>
                <p className='text-gray-600'>جارٍ تحميل بيانات الحضور...</p>
              </div>
            </div>
          ) : error ? (
            <div className='flex items-center justify-center py-12'>
              <div className='text-center'>
                <AlertCircle className='w-12 h-12 text-red-500 mx-auto mb-4' />
                <p className='text-red-600 mb-4'>{error}</p>
                <button
                  onClick={fetchAttendanceData}
                  className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'>
                  إعادة المحاولة
                </button>
              </div>
            </div>
          ) : (
            <div>
              {/* Records Tab */}
              {activeTab === "records" && (
                <div>
                  {/* Filters */}
                  <div className='p-6 border-b bg-gray-50'>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                      {/* Date Filter */}
                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>
                          الفترة الزمنية
                        </label>
                        <select
                          value={dateFilter}
                          onChange={(e) =>
                            setDateFilter(
                              e.target.value as
                                | "all"
                                | "thisMonth"
                                | "lastMonth"
                                | "thisWeek"
                            )
                          }
                          className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'>
                          <option value='all'>جميع الفترات</option>
                          <option value='thisWeek'>هذا الأسبوع</option>
                          <option value='thisMonth'>هذا الشهر</option>
                          <option value='lastMonth'>الشهر الماضي</option>
                        </select>
                      </div>

                      {/* Status Filter */}
                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>
                          حالة الحضور
                        </label>
                        <select
                          value={statusFilter}
                          onChange={(e) =>
                            setStatusFilter(
                              e.target.value as
                                | "all"
                                | "present"
                                | "absent"
                                | "late"
                            )
                          }
                          className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'>
                          <option value='all'>جميع الحالات</option>
                          <option value='present'>حاضر</option>
                          <option value='absent'>غائب</option>
                          <option value='late'>متأخر</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Records List */}
                  <div className='p-6'>
                    {filteredRecords.length === 0 ? (
                      <div className='text-center py-12'>
                        <Calendar className='w-16 h-16 text-gray-400 mx-auto mb-4' />
                        <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                          لا توجد سجلات
                        </h3>
                        <p className='text-gray-600'>
                          لم يتم العثور على سجلات حضور
                        </p>
                      </div>
                    ) : (
                      <div className='space-y-4'>
                        {filteredRecords.map((record) => (
                          <div
                            key={record.id}
                            className='border rounded-lg p-6 hover:shadow-md transition-shadow'>
                            <div className='flex items-start justify-between mb-4'>
                              <div className='flex-1'>
                                <h3 className='font-semibold text-lg text-gray-900 mb-1'>
                                  {record.sessionTitle}
                                </h3>
                                <p className='text-sm text-gray-600 mb-2'>
                                  {record.trackName}
                                </p>
                                <div className='flex items-center gap-4 text-sm text-gray-600'>
                                  <span>{formatDate(record.date)}</span>
                                  <span>
                                    {formatTime(record.startTime)} -{" "}
                                    {formatTime(record.endTime)}
                                  </span>
                                  <div className='flex items-center gap-1'>
                                    <Users className='w-4 h-4' />
                                    {record.instructor}
                                  </div>
                                </div>
                              </div>

                              <div className='flex items-center gap-3'>
                                <div
                                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${getStatusColor(
                                    record.status
                                  )}`}>
                                  {getStatusIcon(record.status)}
                                  <span className='font-medium'>
                                    {getStatusLabel(record.status)}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {record.markedAt && (
                              <div className='text-sm text-gray-600 mb-2'>
                                <Clock className='w-4 h-4 inline ml-1' />
                                تم تسجيل الحضور في:{" "}
                                {new Date(record.markedAt).toLocaleString(
                                  "ar-SA"
                                )}
                              </div>
                            )}

                            {record.notes && (
                              <div className='bg-gray-50 rounded-lg p-3 text-sm text-gray-700'>
                                <strong>ملاحظات:</strong> {record.notes}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Stats Tab */}
              {activeTab === "stats" && stats && (
                <div className='p-6'>
                  <div className='space-y-6'>
                    {/* Overall Stats */}
                    <div>
                      <h3 className='font-semibold text-lg text-gray-900 mb-4'>
                        الإحصائيات العامة
                      </h3>
                      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                        <div className='bg-green-50 border border-green-200 rounded-lg p-4'>
                          <div className='flex items-center gap-3'>
                            <CheckCircle className='w-8 h-8 text-green-600' />
                            <div>
                              <p className='text-2xl font-bold text-green-900'>
                                {stats.attendedSessions}
                              </p>
                              <p className='text-sm text-green-700'>
                                جلسة حضور
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className='bg-red-50 border border-red-200 rounded-lg p-4'>
                          <div className='flex items-center gap-3'>
                            <XCircle className='w-8 h-8 text-red-600' />
                            <div>
                              <p className='text-2xl font-bold text-red-900'>
                                {stats.absentSessions}
                              </p>
                              <p className='text-sm text-red-700'>جلسة غياب</p>
                            </div>
                          </div>
                        </div>

                        <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-4'>
                          <div className='flex items-center gap-3'>
                            <Clock className='w-8 h-8 text-yellow-600' />
                            <div>
                              <p className='text-2xl font-bold text-yellow-900'>
                                {stats.lateSessions}
                              </p>
                              <p className='text-sm text-yellow-700'>
                                جلسة تأخير
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Monthly Stats */}
                    {stats.monthlyStats.length > 0 && (
                      <div>
                        <h3 className='font-semibold text-lg text-gray-900 mb-4'>
                          الإحصائيات الشهرية
                        </h3>
                        <div className='space-y-3'>
                          {stats.monthlyStats.map((month, index) => (
                            <div key={index} className='border rounded-lg p-4'>
                              <div className='flex items-center justify-between mb-2'>
                                <span className='font-medium text-gray-900'>
                                  {month.month}
                                </span>
                                <span className='text-sm text-gray-600'>
                                  {month.sessionsCount} جلسة
                                </span>
                              </div>
                              <div className='flex justify-between text-sm mb-2'>
                                <span>معدل الحضور</span>
                                <span>{month.attendanceRate.toFixed(1)}%</span>
                              </div>
                              <div className='w-full bg-gray-200 rounded-full h-2'>
                                <div
                                  className={`h-2 rounded-full transition-all duration-300 ${
                                    month.attendanceRate >= 90
                                      ? "bg-green-500"
                                      : month.attendanceRate >= 70
                                      ? "bg-blue-500"
                                      : month.attendanceRate >= 50
                                      ? "bg-yellow-500"
                                      : "bg-red-500"
                                  }`}
                                  style={{
                                    width: `${month.attendanceRate}%`,
                                  }}></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className='border-t p-6 bg-gray-50'>
          <div className='flex justify-between items-center'>
            <div className='text-sm text-gray-600'>
              {activeTab === "records"
                ? `عرض ${filteredRecords.length} من ${attendanceRecords.length} سجل`
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
