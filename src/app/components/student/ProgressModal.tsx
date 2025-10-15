"use client";

import { useState, useEffect, useCallback } from "react";
import {
  X,
  TrendingUp,
  Award,
  Calendar,
  Target,
  CheckCircle,
  BarChart3,
  AlertCircle,
} from "lucide-react";

interface ProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: string;
}

interface ProgressData {
  overall: {
    completionRate: number;
    attendanceRate: number;
    averageGrade: number;
    totalSessions: number;
    attendedSessions: number;
    completedTracks: number;
    activeTracks: number;
  };
  tracks: {
    id: string;
    name: string;
    progress: number;
    grade: string;
    totalSessions: number;
    attendedSessions: number;
    status: string;
    completionDate?: string;
  }[];
  recentAchievements: {
    id: string;
    title: string;
    description: string;
    earnedAt: string;
    type: string;
  }[];
  weeklyProgress: {
    week: string;
    attendanceRate: number;
    sessionsCount: number;
  }[];
}

export default function ProgressModal({
  isOpen,
  onClose,
  studentId,
}: ProgressModalProps) {
  const [progressData, setProgressData] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "overview" | "tracks" | "achievements" | "analytics"
  >("overview");

  const fetchProgressData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/students/${studentId}/progress`);

      if (!response.ok) {
        throw new Error("فشل في تحميل بيانات التقدم");
      }

      const data = await response.json();
      setProgressData(data);
    } catch (error) {
      console.error("Error fetching progress data:", error);
      setError(
        error instanceof Error ? error.message : "فشل في تحميل بيانات التقدم"
      );
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    if (isOpen && studentId) {
      fetchProgressData();
    }
  }, [isOpen, studentId, fetchProgressData]);

  const getGradeColor = (grade: string) => {
    const numGrade = parseFloat(grade);
    if (numGrade >= 90) return "text-green-600";
    if (numGrade >= 80) return "text-blue-600";
    if (numGrade >= 70) return "text-yellow-600";
    if (numGrade >= 60) return "text-orange-600";
    return "text-red-600";
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 90) return "bg-green-500";
    if (progress >= 70) return "bg-blue-500";
    if (progress >= 50) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "active":
        return "bg-blue-100 text-blue-800";
      case "paused":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "completed":
        return "مكتمل";
      case "active":
        return "نشط";
      case "paused":
        return "متوقف";
      case "cancelled":
        return "ملغى";
      default:
        return status;
    }
  };

  const getAchievementIcon = (type: string) => {
    switch (type) {
      case "attendance":
        return <CheckCircle className='w-6 h-6 text-green-600' />;
      case "completion":
        return <Target className='w-6 h-6 text-blue-600' />;
      case "grade":
        return <Award className='w-6 h-6 text-yellow-600' />;
      default:
        return <Award className='w-6 h-6 text-purple-600' />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
      <div className='bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden'>
        {/* Header */}
        <div className='flex items-center justify-between p-6 border-b'>
          <div>
            <h2 className='text-xl font-semibold text-gray-900'>
              تقرير التقدم الأكاديمي
            </h2>
            <p className='text-sm text-gray-600 mt-1'>
              نظرة شاملة على أدائك الأكاديمي
            </p>
          </div>
          <button
            onClick={onClose}
            className='text-gray-400 hover:text-gray-600 transition-colors'>
            <X className='w-6 h-6' />
          </button>
        </div>

        {/* Tabs */}
        <div className='border-b bg-gray-50'>
          <nav className='flex'>
            {[
              { key: "overview", label: "نظرة عامة", icon: TrendingUp },
              { key: "tracks", label: "المسارات", icon: Target },
              { key: "achievements", label: "الإنجازات", icon: Award },
              { key: "analytics", label: "التحليلات", icon: BarChart3 },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() =>
                  setActiveTab(
                    tab.key as
                      | "overview"
                      | "tracks"
                      | "achievements"
                      | "analytics"
                  )
                }
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
        <div className='flex-1 overflow-y-auto p-6'>
          {loading ? (
            <div className='flex items-center justify-center py-12'>
              <div className='text-center'>
                <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4'></div>
                <p className='text-gray-600'>جارٍ تحميل بيانات التقدم...</p>
              </div>
            </div>
          ) : error ? (
            <div className='flex items-center justify-center py-12'>
              <div className='text-center'>
                <AlertCircle className='w-12 h-12 text-red-500 mx-auto mb-4' />
                <p className='text-red-600 mb-4'>{error}</p>
                <button
                  onClick={fetchProgressData}
                  className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'>
                  إعادة المحاولة
                </button>
              </div>
            </div>
          ) : progressData ? (
            <div>
              {/* Overview Tab */}
              {activeTab === "overview" && (
                <div className='space-y-6'>
                  {/* Key Metrics */}
                  <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
                    <div className='bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white'>
                      <div className='flex items-center justify-between'>
                        <div>
                          <p className='text-blue-100 text-sm'>معدل الإكمال</p>
                          <p className='text-2xl font-bold'>
                            {progressData.overall.completionRate.toFixed(1)}%
                          </p>
                        </div>
                        <Target className='w-8 h-8 text-blue-200' />
                      </div>
                    </div>

                    <div className='bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white'>
                      <div className='flex items-center justify-between'>
                        <div>
                          <p className='text-green-100 text-sm'>معدل الحضور</p>
                          <p className='text-2xl font-bold'>
                            {progressData.overall.attendanceRate.toFixed(1)}%
                          </p>
                        </div>
                        <CheckCircle className='w-8 h-8 text-green-200' />
                      </div>
                    </div>

                    <div className='bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg p-6 text-white'>
                      <div className='flex items-center justify-between'>
                        <div>
                          <p className='text-yellow-100 text-sm'>
                            المعدل العام
                          </p>
                          <p className='text-2xl font-bold'>
                            {progressData.overall.averageGrade.toFixed(1)}
                          </p>
                        </div>
                        <Award className='w-8 h-8 text-yellow-200' />
                      </div>
                    </div>

                    <div className='bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white'>
                      <div className='flex items-center justify-between'>
                        <div>
                          <p className='text-purple-100 text-sm'>
                            المسارات النشطة
                          </p>
                          <p className='text-2xl font-bold'>
                            {progressData.overall.activeTracks}
                          </p>
                        </div>
                        <Calendar className='w-8 h-8 text-purple-200' />
                      </div>
                    </div>
                  </div>

                  {/* Attendance Summary */}
                  <div className='bg-white border rounded-lg p-6'>
                    <h3 className='font-semibold text-lg text-gray-900 mb-4'>
                      ملخص الحضور
                    </h3>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                      <div>
                        <p className='text-sm text-gray-600 mb-2'>
                          إجمالي الجلسات: {progressData.overall.totalSessions}
                        </p>
                        <p className='text-sm text-gray-600 mb-2'>
                          الجلسات المحضورة:{" "}
                          {progressData.overall.attendedSessions}
                        </p>
                        <p className='text-sm text-gray-600'>
                          الجلسات المتبقية:{" "}
                          {progressData.overall.totalSessions -
                            progressData.overall.attendedSessions}
                        </p>
                      </div>
                      <div>
                        <p className='text-sm text-gray-600 mb-2'>
                          المسارات المكتملة:{" "}
                          {progressData.overall.completedTracks}
                        </p>
                        <p className='text-sm text-gray-600'>
                          المسارات النشطة: {progressData.overall.activeTracks}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tracks Tab */}
              {activeTab === "tracks" && (
                <div className='space-y-4'>
                  <h3 className='font-semibold text-lg text-gray-900'>
                    تقدم المسارات
                  </h3>
                  {progressData.tracks.length === 0 ? (
                    <div className='text-center py-12'>
                      <Target className='w-16 h-16 text-gray-400 mx-auto mb-4' />
                      <h4 className='text-lg font-semibold text-gray-900 mb-2'>
                        لا توجد مسارات
                      </h4>
                      <p className='text-gray-600'>
                        لم تتم المشاركة في أي مسارات تعليمية بعد
                      </p>
                    </div>
                  ) : (
                    <div className='space-y-4'>
                      {progressData.tracks.map((track) => (
                        <div key={track.id} className='border rounded-lg p-6'>
                          <div className='flex items-start justify-between mb-4'>
                            <div className='flex-1'>
                              <h4 className='font-semibold text-gray-900 mb-2'>
                                {track.name}
                              </h4>
                              <div className='flex items-center gap-4 text-sm text-gray-600'>
                                <span>
                                  الحضور: {track.attendedSessions}/
                                  {track.totalSessions}
                                </span>
                                <span className={getGradeColor(track.grade)}>
                                  الدرجة: {track.grade}
                                </span>
                              </div>
                            </div>
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                                track.status
                              )}`}>
                              {getStatusLabel(track.status)}
                            </span>
                          </div>

                          <div className='mb-4'>
                            <div className='flex justify-between text-sm mb-2'>
                              <span>التقدم</span>
                              <span>{track.progress.toFixed(1)}%</span>
                            </div>
                            <div className='w-full bg-gray-200 rounded-full h-2'>
                              <div
                                className={`h-2 rounded-full ${getProgressColor(
                                  track.progress
                                )}`}
                                style={{ width: `${track.progress}%` }}></div>
                            </div>
                          </div>

                          {track.completionDate && (
                            <p className='text-sm text-gray-600'>
                              تاريخ الإكمال:{" "}
                              {new Date(
                                track.completionDate
                              ).toLocaleDateString("ar-SA")}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Achievements Tab */}
              {activeTab === "achievements" && (
                <div className='space-y-4'>
                  <h3 className='font-semibold text-lg text-gray-900'>
                    الإنجازات الأخيرة
                  </h3>
                  {progressData.recentAchievements.length === 0 ? (
                    <div className='text-center py-12'>
                      <Award className='w-16 h-16 text-gray-400 mx-auto mb-4' />
                      <h4 className='text-lg font-semibold text-gray-900 mb-2'>
                        لا توجد إنجازات بعد
                      </h4>
                      <p className='text-gray-600'>
                        استمر في الدراسة لكسب الإنجازات والشارات
                      </p>
                    </div>
                  ) : (
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                      {progressData.recentAchievements.map((achievement) => (
                        <div
                          key={achievement.id}
                          className='border rounded-lg p-4'>
                          <div className='flex items-start gap-4'>
                            {getAchievementIcon(achievement.type)}
                            <div className='flex-1'>
                              <h4 className='font-semibold text-gray-900 mb-1'>
                                {achievement.title}
                              </h4>
                              <p className='text-sm text-gray-600 mb-2'>
                                {achievement.description}
                              </p>
                              <p className='text-xs text-gray-500'>
                                {new Date(
                                  achievement.earnedAt
                                ).toLocaleDateString("ar-SA")}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Analytics Tab */}
              {activeTab === "analytics" && (
                <div className='space-y-6'>
                  <h3 className='font-semibold text-lg text-gray-900'>
                    التحليل الأسبوعي
                  </h3>
                  {progressData.weeklyProgress.length === 0 ? (
                    <div className='text-center py-12'>
                      <BarChart3 className='w-16 h-16 text-gray-400 mx-auto mb-4' />
                      <h4 className='text-lg font-semibold text-gray-900 mb-2'>
                        لا توجد بيانات كافية
                      </h4>
                      <p className='text-gray-600'>
                        سيتم عرض التحليلات بعد المشاركة في المزيد من الجلسات
                      </p>
                    </div>
                  ) : (
                    <div className='space-y-4'>
                      {progressData.weeklyProgress.map((week, index) => (
                        <div key={index} className='border rounded-lg p-4'>
                          <div className='flex items-center justify-between mb-2'>
                            <span className='font-medium text-gray-900'>
                              {week.week}
                            </span>
                            <span className='text-sm text-gray-600'>
                              {week.sessionsCount} جلسة
                            </span>
                          </div>
                          <div className='flex justify-between text-sm mb-2'>
                            <span>معدل الحضور</span>
                            <span>{week.attendanceRate.toFixed(1)}%</span>
                          </div>
                          <div className='w-full bg-gray-200 rounded-full h-2'>
                            <div
                              className={`h-2 rounded-full ${getProgressColor(
                                week.attendanceRate
                              )}`}
                              style={{
                                width: `${week.attendanceRate}%`,
                              }}></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className='text-center py-12'>
              <TrendingUp className='w-16 h-16 text-gray-400 mx-auto mb-4' />
              <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                لا توجد بيانات
              </h3>
              <p className='text-gray-600'>لم يتم العثور على بيانات التقدم</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className='border-t p-6 bg-gray-50'>
          <div className='flex justify-end'>
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
