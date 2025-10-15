"use client";

import { useState, useEffect } from "react";
import {
  X,
  Download,
  AlertCircle,
  Search,
  Filter,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";

interface AttendanceReportsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface AttendanceReport {
  sessionId: string;
  sessionTitle: string;
  date: string;
  startTime: string;
  endTime: string;
  trackName: string;
  gradeName: string;
  instructorName: string;
  totalStudents: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  attendanceRate: number;
  status: string;
}

interface AttendanceFilter {
  dateFrom: string;
  dateTo: string;
  trackId: string;
  gradeId: string;
  status: string;
}

interface Track {
  id: string;
  name: string;
  grade: {
    id: string;
    name: string;
  };
}

interface Grade {
  id: string;
  name: string;
}

export default function AttendanceReportsModal({
  isOpen,
  onClose,
}: AttendanceReportsModalProps) {
  const [reports, setReports] = useState<AttendanceReport[]>([]);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [filters, setFilters] = useState<AttendanceFilter>({
    dateFrom: "",
    dateTo: "",
    trackId: "",
    gradeId: "",
    status: "",
  });

  // Get default date range (last 30 days)
  const getDefaultDateRange = () => {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);

    return {
      from: thirtyDaysAgo.toISOString().split("T")[0],
      to: today.toISOString().split("T")[0],
    };
  };

  useEffect(() => {
    if (isOpen) {
      const defaultDates = getDefaultDateRange();
      const newFilters = {
        ...filters,
        dateFrom: defaultDates.from,
        dateTo: defaultDates.to,
      };
      setFilters(newFilters);

      fetchInitialData();
      fetchReports(newFilters);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const fetchInitialData = async () => {
    try {
      // Fetch tracks and grades
      const [tracksResponse, gradesResponse] = await Promise.all([
        fetch("/api/tracks"),
        fetch("/api/grades"),
      ]);

      if (tracksResponse.ok) {
        const tracksData = await tracksResponse.json();
        setTracks(tracksData);
      }

      if (gradesResponse.ok) {
        const gradesData = await gradesResponse.json();
        setGrades(gradesData);
      }
    } catch (error) {
      console.error("Error fetching initial data:", error);
    }
  };

  const fetchReports = async (currentFilters: AttendanceFilter) => {
    setLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams();

      if (currentFilters.dateFrom)
        queryParams.append("dateFrom", currentFilters.dateFrom);
      if (currentFilters.dateTo)
        queryParams.append("dateTo", currentFilters.dateTo);
      if (currentFilters.trackId)
        queryParams.append("trackId", currentFilters.trackId);
      if (currentFilters.gradeId)
        queryParams.append("gradeId", currentFilters.gradeId);
      if (currentFilters.status)
        queryParams.append("status", currentFilters.status);

      const response = await fetch(
        `/api/reports/attendance?${queryParams.toString()}`
      );

      if (!response.ok) {
        throw new Error("فشل في تحميل تقارير الحضور");
      }

      const data = await response.json();
      setReports(data.reports || []);
    } catch (error) {
      console.error("Error fetching reports:", error);
      setError(
        error instanceof Error ? error.message : "فشل في تحميل التقارير"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof AttendanceFilter, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);

    // Auto-fetch when date range changes
    if (
      (key === "dateFrom" || key === "dateTo") &&
      newFilters.dateFrom &&
      newFilters.dateTo
    ) {
      fetchReports(newFilters);
    }
  };

  const handleApplyFilters = () => {
    fetchReports(filters);
  };

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      const queryParams = new URLSearchParams();
      if (filters.dateFrom) queryParams.append("dateFrom", filters.dateFrom);
      if (filters.dateTo) queryParams.append("dateTo", filters.dateTo);
      if (filters.trackId) queryParams.append("trackId", filters.trackId);
      if (filters.gradeId) queryParams.append("gradeId", filters.gradeId);
      if (filters.status) queryParams.append("status", filters.status);
      queryParams.append("format", "csv");

      const response = await fetch(
        `/api/reports/attendance?${queryParams.toString()}`
      );

      if (!response.ok) {
        throw new Error("فشل في تصدير التقرير");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `attendance_report_${
        new Date().toISOString().split("T")[0]
      }.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting CSV:", error);
      setError(error instanceof Error ? error.message : "فشل في تصدير التقرير");
    } finally {
      setExporting(false);
    }
  };

  const getAttendanceRateColor = (rate: number) => {
    if (rate >= 90) return "text-green-600 bg-green-100";
    if (rate >= 75) return "text-blue-600 bg-blue-100";
    if (rate >= 60) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-600 bg-green-100";
      case "active":
        return "text-blue-600 bg-blue-100";
      case "scheduled":
        return "text-gray-600 bg-gray-100";
      case "cancelled":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "completed":
        return "مكتملة";
      case "active":
        return "جارية";
      case "scheduled":
        return "مجدولة";
      case "cancelled":
        return "ملغاة";
      default:
        return status;
    }
  };

  const filteredReports = reports.filter(
    (report) =>
      report.sessionTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.trackName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.instructorName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate summary statistics
  const totalSessions = filteredReports.length;
  const totalStudents = filteredReports.reduce(
    (sum, report) => sum + report.totalStudents,
    0
  );
  const totalPresent = filteredReports.reduce(
    (sum, report) => sum + report.presentCount,
    0
  );
  const averageAttendanceRate =
    totalStudents > 0 ? Math.round((totalPresent / totalStudents) * 100) : 0;

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
      <div className='bg-white rounded-lg shadow-xl max-w-7xl w-full max-h-[90vh] overflow-hidden'>
        {/* Header */}
        <div className='flex items-center justify-between p-6 border-b'>
          <div>
            <h2 className='text-xl font-semibold text-gray-900'>
              تقارير الحضور
            </h2>
            <p className='text-sm text-gray-600 mt-1'>
              عرض وتصدير تقارير حضور الطلاب في الجلسات
            </p>
          </div>
          <button
            onClick={onClose}
            className='text-gray-400 hover:text-gray-600 transition-colors'>
            <X className='w-6 h-6' />
          </button>
        </div>

        {/* Filters and Controls */}
        <div className='p-6 border-b bg-gray-50'>
          <div className='grid grid-cols-1 md:grid-cols-6 gap-4 mb-4'>
            {/* Date Range */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                من تاريخ
              </label>
              <input
                type='date'
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm'
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                إلى تاريخ
              </label>
              <input
                type='date'
                value={filters.dateTo}
                onChange={(e) => handleFilterChange("dateTo", e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm'
              />
            </div>

            {/* Grade Filter */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                المستوى
              </label>
              <select
                value={filters.gradeId}
                onChange={(e) => handleFilterChange("gradeId", e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm'>
                <option value=''>جميع المستويات</option>
                {grades.map((grade) => (
                  <option key={grade.id} value={grade.id}>
                    {grade.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Track Filter */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                المسار
              </label>
              <select
                value={filters.trackId}
                onChange={(e) => handleFilterChange("trackId", e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm'>
                <option value=''>جميع المسارات</option>
                {tracks.map((track) => (
                  <option key={track.id} value={track.id}>
                    {track.name} - {track.grade.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                حالة الجلسة
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm'>
                <option value=''>جميع الحالات</option>
                <option value='completed'>مكتملة</option>
                <option value='active'>جارية</option>
                <option value='scheduled'>مجدولة</option>
                <option value='cancelled'>ملغاة</option>
              </select>
            </div>

            {/* Action Buttons */}
            <div className='flex flex-col gap-2'>
              <button
                onClick={handleApplyFilters}
                disabled={loading}
                className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm flex items-center justify-center gap-2'>
                <Filter className='w-4 h-4' />
                تطبيق
              </button>
              <button
                onClick={handleExportCSV}
                disabled={exporting || filteredReports.length === 0}
                className='px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 text-sm flex items-center justify-center gap-2'>
                {exporting ? (
                  <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white'></div>
                ) : (
                  <Download className='w-4 h-4' />
                )}
                تصدير
              </button>
            </div>
          </div>

          {/* Search */}
          <div className='flex items-center justify-between'>
            <div className='relative'>
              <Search className='absolute right-3 top-2.5 h-5 w-5 text-gray-400' />
              <input
                type='text'
                placeholder='البحث في التقارير...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
              />
            </div>

            {/* Summary Stats */}
            <div className='flex items-center gap-6 text-sm'>
              <div className='text-center'>
                <div className='font-semibold text-gray-900'>
                  {totalSessions}
                </div>
                <div className='text-gray-600'>جلسة</div>
              </div>
              <div className='text-center'>
                <div className='font-semibold text-gray-900'>
                  {totalStudents}
                </div>
                <div className='text-gray-600'>طالب</div>
              </div>
              <div className='text-center'>
                <div className='font-semibold text-gray-900'>
                  {averageAttendanceRate}%
                </div>
                <div className='text-gray-600'>متوسط الحضور</div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className='flex-1 overflow-y-auto'>
          {loading ? (
            <div className='flex items-center justify-center py-12'>
              <div className='text-center'>
                <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4'></div>
                <p className='text-gray-600'>جارٍ تحميل التقارير...</p>
              </div>
            </div>
          ) : error ? (
            <div className='flex items-center justify-center py-12'>
              <div className='text-center'>
                <AlertCircle className='w-12 h-12 text-red-500 mx-auto mb-4' />
                <p className='text-red-600 mb-4'>{error}</p>
                <button
                  onClick={() => fetchReports(filters)}
                  className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'>
                  إعادة المحاولة
                </button>
              </div>
            </div>
          ) : filteredReports.length === 0 ? (
            <div className='flex items-center justify-center py-12'>
              <div className='text-center'>
                <FileText className='w-16 h-16 text-gray-400 mx-auto mb-4' />
                <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                  لا توجد تقارير
                </h3>
                <p className='text-gray-600'>
                  لم يتم العثور على تقارير حضور للفترة المحددة
                </p>
              </div>
            </div>
          ) : (
            <div className='overflow-x-auto'>
              <table className='w-full'>
                <thead className='bg-gray-50 border-b'>
                  <tr>
                    <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      الجلسة
                    </th>
                    <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      التاريخ والوقت
                    </th>
                    <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      المسار
                    </th>
                    <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      المدرب
                    </th>
                    <th className='px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      الحضور
                    </th>
                    <th className='px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      معدل الحضور
                    </th>
                    <th className='px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      الحالة
                    </th>
                  </tr>
                </thead>
                <tbody className='bg-white divide-y divide-gray-200'>
                  {filteredReports.map((report) => (
                    <tr key={report.sessionId} className='hover:bg-gray-50'>
                      <td className='px-6 py-4'>
                        <div>
                          <div className='font-medium text-gray-900'>
                            {report.sessionTitle}
                          </div>
                          <div className='text-sm text-gray-500'>
                            {report.gradeName}
                          </div>
                        </div>
                      </td>
                      <td className='px-6 py-4'>
                        <div>
                          <div className='text-sm text-gray-900'>
                            {new Date(report.date).toLocaleDateString("ar-SA")}
                          </div>
                          <div className='text-sm text-gray-500'>
                            {new Date(
                              `2000-01-01T${report.startTime}`
                            ).toLocaleTimeString("ar-SA", {
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                            })}{" "}
                            -{" "}
                            {new Date(
                              `2000-01-01T${report.endTime}`
                            ).toLocaleTimeString("ar-SA", {
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                            })}
                          </div>
                        </div>
                      </td>
                      <td className='px-6 py-4'>
                        <div className='text-sm text-gray-900'>
                          {report.trackName}
                        </div>
                      </td>
                      <td className='px-6 py-4'>
                        <div className='text-sm text-gray-900'>
                          {report.instructorName}
                        </div>
                      </td>
                      <td className='px-6 py-4 text-center'>
                        <div className='grid grid-cols-3 gap-2 text-xs'>
                          <div className='flex items-center justify-center gap-1'>
                            <CheckCircle className='w-3 h-3 text-green-500' />
                            <span>{report.presentCount}</span>
                          </div>
                          <div className='flex items-center justify-center gap-1'>
                            <XCircle className='w-3 h-3 text-red-500' />
                            <span>{report.absentCount}</span>
                          </div>
                          <div className='flex items-center justify-center gap-1'>
                            <Clock className='w-3 h-3 text-yellow-500' />
                            <span>{report.lateCount}</span>
                          </div>
                        </div>
                        <div className='text-xs text-gray-500 mt-1'>
                          من {report.totalStudents} طالب
                        </div>
                      </td>
                      <td className='px-6 py-4 text-center'>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getAttendanceRateColor(
                            report.attendanceRate
                          )}`}>
                          {report.attendanceRate}%
                        </span>
                      </td>
                      <td className='px-6 py-4 text-center'>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            report.status
                          )}`}>
                          {getStatusLabel(report.status)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className='border-t p-6 bg-gray-50'>
          <div className='flex justify-between items-center'>
            <div className='text-sm text-gray-600'>
              عرض {filteredReports.length} من {reports.length} تقرير
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
