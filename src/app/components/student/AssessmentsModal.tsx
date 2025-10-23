"use client";

import { useState, useEffect, useCallback } from "react";
import {
  X,
  BookOpen,
  Star,
  TrendingUp,
  Calendar,
  AlertCircle,
  Award,
  Target,
  FileText,
  BarChart3,
} from "lucide-react";

interface AssessmentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: string;
}

interface Assessment {
  id: string;
  title: string;
  type: string;
  trackName: string;
  sessionTitle?: string;
  maxScore: number;
  earnedScore?: number;
  grade?: string;
  status: string;
  submittedAt?: string;
  dueDate?: string;
  feedback?: string;
  instructor: string;
  rubric?: {
    criteria: string;
    maxPoints: number;
    earnedPoints?: number;
    comments?: string;
  }[];
}

interface AssessmentStats {
  totalAssessments: number;
  completedAssessments: number;
  averageGrade: number;
  gradeDistribution: {
    grade: string;
    count: number;
  }[];
  recentTrend: {
    period: string;
    averageGrade: number;
  }[];
}

export default function AssessmentsModal({
  isOpen,
  onClose,
  studentId,
}: AssessmentsModalProps) {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [stats, setStats] = useState<AssessmentStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"assessments" | "stats">(
    "assessments"
  );
  const [typeFilter, setTypeFilter] = useState<
    "all" | "quiz" | "assignment" | "project" | "exam"
  >("all");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "pending" | "submitted" | "graded" | "overdue"
  >("all");

  const fetchAssessmentsData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/students/${studentId}/assessments`);

      if (!response.ok) {
        throw new Error("فشل في تحميل بيانات التقييمات");
      }

      const data = await response.json();
      setAssessments(data.assessments || []);
      setStats(data.stats || null);
    } catch (error) {
      console.error("Error fetching assessments data:", error);
      setError(
        error instanceof Error ? error.message : "فشل في تحميل بيانات التقييمات"
      );
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    if (isOpen && studentId) {
      fetchAssessmentsData();
    }
  }, [isOpen, studentId, fetchAssessmentsData]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "quiz":
        return <BookOpen className='w-5 h-5 text-blue-600' />;
      case "assignment":
        return <FileText className='w-5 h-5 text-green-600' />;
      case "project":
        return <Target className='w-5 h-5 text-purple-600' />;
      case "exam":
        return <Award className='w-5 h-5 text-red-600' />;
      default:
        return <BookOpen className='w-5 h-5 text-gray-600' />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "quiz":
        return "اختبار قصير";
      case "assignment":
        return "واجب";
      case "project":
        return "مشروع";
      case "exam":
        return "امتحان";
      default:
        return type;
    }
  };

  const getStatusColor = (status: string, dueDate?: string) => {
    if (
      status === "overdue" ||
      (dueDate && new Date(dueDate) < new Date() && status === "pending")
    ) {
      return "bg-red-100 text-red-800 border-red-200";
    }

    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "submitted":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "graded":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusLabel = (status: string, dueDate?: string) => {
    if (status === "pending" && dueDate && new Date(dueDate) < new Date()) {
      return "متأخر";
    }

    switch (status) {
      case "pending":
        return "معلق";
      case "submitted":
        return "تم التسليم";
      case "graded":
        return "تم التقييم";
      case "overdue":
        return "متأخر";
      default:
        return status;
    }
  };

  const getGradeColor = (grade: string) => {
    const numGrade = parseFloat(grade);
    if (isNaN(numGrade)) return "text-gray-600";

    if (numGrade >= 90) return "text-green-600";
    if (numGrade >= 80) return "text-blue-600";
    if (numGrade >= 70) return "text-yellow-600";
    if (numGrade >= 60) return "text-orange-600";
    return "text-red-600";
  };

  const getFilteredAssessments = () => {
    let filtered = assessments;

    // Filter by type
    if (typeFilter !== "all") {
      filtered = filtered.filter(
        (assessment) => assessment.type === typeFilter
      );
    }

    // Filter by status
    if (statusFilter !== "all") {
      if (statusFilter === "overdue") {
        filtered = filtered.filter(
          (assessment) =>
            assessment.status === "pending" &&
            assessment.dueDate &&
            new Date(assessment.dueDate) < new Date()
        );
      } else {
        filtered = filtered.filter(
          (assessment) => assessment.status === statusFilter
        );
      }
    }

    return filtered.sort((a, b) => {
      if (a.dueDate && b.dueDate) {
        return new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
      }
      if (a.submittedAt && b.submittedAt) {
        return (
          new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
        );
      }
      return 0;
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("ar-SA", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isOverdue = (dueDate?: string, status?: string) => {
    return dueDate && status === "pending" && new Date(dueDate) < new Date();
  };

  if (!isOpen) return null;

  const filteredAssessments = getFilteredAssessments();

  return (
    <div
      className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'
      style={{ overflow: "hidden" }}>
      <div className='bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] flex flex-col'>
        {/* Header */}
        <div className='flex items-center justify-between p-6 border-b flex-shrink-0'>
          <div>
            <h2 className='text-xl font-semibold text-gray-900'>
              التقييمات والدرجات
            </h2>
            <p className='text-sm text-gray-600 mt-1'>
              تتبع تقييماتك وأدائك الأكاديمي
            </p>
          </div>
          <button
            onClick={onClose}
            className='text-gray-400 hover:text-gray-600 transition-colors'>
            <X className='w-6 h-6' />
          </button>
        </div>

        {/* Stats Header */}
        {stats && (
          <div className='p-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white'>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
              <div className='text-center'>
                <div className='flex items-center justify-center mb-2'>
                  <BookOpen className='w-8 h-8' />
                </div>
                <p className='text-2xl font-bold'>
                  {stats.completedAssessments}
                </p>
                <p className='text-sm text-purple-100'>
                  من {stats.totalAssessments} تقييم
                </p>
              </div>

              <div className='text-center'>
                <div className='flex items-center justify-center mb-2'>
                  <Star className='w-8 h-8' />
                </div>
                <p className='text-2xl font-bold'>
                  {stats.averageGrade.toFixed(1)}
                </p>
                <p className='text-sm text-purple-100'>المعدل العام</p>
              </div>

              <div className='text-center'>
                <div className='flex items-center justify-center mb-2'>
                  <TrendingUp className='w-8 h-8' />
                </div>
                <p className='text-2xl font-bold'>
                  {(
                    (stats.completedAssessments / stats.totalAssessments) *
                    100
                  ).toFixed(0)}
                  %
                </p>
                <p className='text-sm text-purple-100'>معدل الإنجاز</p>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className='border-b bg-gray-50'>
          <nav className='flex'>
            {[
              { key: "assessments", label: "التقييمات", icon: BookOpen },
              { key: "stats", label: "الإحصائيات", icon: BarChart3 },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as "assessments" | "stats")}
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
        <div className='flex-1 overflow-y-auto' style={{ minHeight: "200px" }}>
          {loading ? (
            <div className='flex items-center justify-center py-12'>
              <div className='text-center'>
                <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4'></div>
                <p className='text-gray-600'>جارٍ تحميل التقييمات...</p>
              </div>
            </div>
          ) : error ? (
            <div className='flex items-center justify-center py-12'>
              <div className='text-center'>
                <AlertCircle className='w-12 h-12 text-red-500 mx-auto mb-4' />
                <p className='text-red-600 mb-4'>{error}</p>
                <button
                  onClick={fetchAssessmentsData}
                  className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'>
                  إعادة المحاولة
                </button>
              </div>
            </div>
          ) : (
            <div>
              {/* Assessments Tab */}
              {activeTab === "assessments" && (
                <div>
                  {/* Filters */}
                  <div className='p-6 border-b bg-gray-50'>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                      {/* Type Filter */}
                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>
                          نوع التقييم
                        </label>
                        <select
                          value={typeFilter}
                          onChange={(e) =>
                            setTypeFilter(
                              e.target.value as
                                | "all"
                                | "quiz"
                                | "assignment"
                                | "project"
                                | "exam"
                            )
                          }
                          className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'>
                          <option value='all'>جميع الأنواع</option>
                          <option value='quiz'>اختبار قصير</option>
                          <option value='assignment'>واجب</option>
                          <option value='project'>مشروع</option>
                          <option value='exam'>امتحان</option>
                        </select>
                      </div>

                      {/* Status Filter */}
                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>
                          الحالة
                        </label>
                        <select
                          value={statusFilter}
                          onChange={(e) =>
                            setStatusFilter(
                              e.target.value as
                                | "all"
                                | "pending"
                                | "submitted"
                                | "graded"
                                | "overdue"
                            )
                          }
                          className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'>
                          <option value='all'>جميع الحالات</option>
                          <option value='pending'>معلق</option>
                          <option value='submitted'>تم التسليم</option>
                          <option value='graded'>تم التقييم</option>
                          <option value='overdue'>متأخر</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Assessments List */}
                  <div className='p-6'>
                    {filteredAssessments.length === 0 ? (
                      <div className='text-center py-12'>
                        <BookOpen className='w-16 h-16 text-gray-400 mx-auto mb-4' />
                        <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                          لا توجد تقييمات
                        </h3>
                        <p className='text-gray-600'>
                          لم يتم العثور على تقييمات
                        </p>
                      </div>
                    ) : (
                      <div className='space-y-6'>
                        {filteredAssessments.map((assessment) => (
                          <div
                            key={assessment.id}
                            className={`border rounded-lg p-6 hover:shadow-md transition-shadow ${
                              isOverdue(assessment.dueDate, assessment.status)
                                ? "border-red-200 bg-red-50"
                                : ""
                            }`}>
                            <div className='flex items-start justify-between mb-4'>
                              <div className='flex items-start gap-3 flex-1'>
                                {getTypeIcon(assessment.type)}
                                <div className='flex-1'>
                                  <h3 className='font-semibold text-lg text-gray-900 mb-1'>
                                    {assessment.title}
                                  </h3>
                                  <p className='text-sm text-gray-600 mb-2'>
                                    {assessment.trackName}
                                  </p>
                                  {assessment.sessionTitle && (
                                    <p className='text-sm text-gray-500 mb-2'>
                                      الجلسة: {assessment.sessionTitle}
                                    </p>
                                  )}
                                  <div className='flex items-center gap-4 text-sm text-gray-600'>
                                    <span>المدرس: {assessment.instructor}</span>
                                    <span>
                                      النوع: {getTypeLabel(assessment.type)}
                                    </span>
                                    <span>
                                      الدرجة الكاملة: {assessment.maxScore}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className='flex flex-col items-end gap-2'>
                                <span
                                  className={`px-3 py-1 rounded-lg border text-sm font-medium ${getStatusColor(
                                    assessment.status,
                                    assessment.dueDate
                                  )}`}>
                                  {getStatusLabel(
                                    assessment.status,
                                    assessment.dueDate
                                  )}
                                </span>
                                {assessment.grade && (
                                  <span
                                    className={`text-lg font-bold ${getGradeColor(
                                      assessment.grade
                                    )}`}>
                                    {assessment.grade}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Score and Grade */}
                            {assessment.earnedScore !== undefined && (
                              <div className='mb-4'>
                                <div className='flex justify-between text-sm mb-2'>
                                  <span>الدرجة المكتسبة</span>
                                  <span>
                                    {assessment.earnedScore}/
                                    {assessment.maxScore}
                                  </span>
                                </div>
                                <div className='w-full bg-gray-200 rounded-full h-2'>
                                  <div
                                    className={`h-2 rounded-full transition-all duration-300 ${
                                      assessment.earnedScore /
                                        assessment.maxScore >=
                                      0.9
                                        ? "bg-green-500"
                                        : assessment.earnedScore /
                                            assessment.maxScore >=
                                          0.7
                                        ? "bg-blue-500"
                                        : assessment.earnedScore /
                                            assessment.maxScore >=
                                          0.5
                                        ? "bg-yellow-500"
                                        : "bg-red-500"
                                    }`}
                                    style={{
                                      width: `${
                                        (assessment.earnedScore /
                                          assessment.maxScore) *
                                        100
                                      }%`,
                                    }}></div>
                                </div>
                              </div>
                            )}

                            {/* Dates */}
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mb-4'>
                              {assessment.dueDate && (
                                <div className='flex items-center gap-2'>
                                  <Calendar className='w-4 h-4' />
                                  <span>
                                    موعد التسليم:{" "}
                                    {formatDate(assessment.dueDate)}
                                  </span>
                                  {isOverdue(
                                    assessment.dueDate,
                                    assessment.status
                                  ) && (
                                    <span className='text-red-600 font-medium'>
                                      (متأخر)
                                    </span>
                                  )}
                                </div>
                              )}
                              {assessment.submittedAt && (
                                <div className='flex items-center gap-2'>
                                  <Calendar className='w-4 h-4' />
                                  <span>
                                    تم التسليم:{" "}
                                    {formatDateTime(assessment.submittedAt)}
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Feedback */}
                            {assessment.feedback && (
                              <div className='bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4'>
                                <h4 className='font-medium text-blue-900 mb-2'>
                                  ملاحظات المدرس:
                                </h4>
                                <p className='text-blue-800 text-sm'>
                                  {assessment.feedback}
                                </p>
                              </div>
                            )}

                            {/* Rubric */}
                            {assessment.rubric &&
                              assessment.rubric.length > 0 && (
                                <div className='bg-gray-50 border border-gray-200 rounded-lg p-4'>
                                  <h4 className='font-medium text-gray-900 mb-3'>
                                    تفاصيل التقييم:
                                  </h4>
                                  <div className='space-y-3'>
                                    {assessment.rubric.map(
                                      (criterion, index) => (
                                        <div
                                          key={index}
                                          className='border-b border-gray-200 pb-2 last:border-b-0'>
                                          <div className='flex justify-between items-start mb-1'>
                                            <span className='font-medium text-sm text-gray-900'>
                                              {criterion.criteria}
                                            </span>
                                            <span className='text-sm text-gray-600'>
                                              {criterion.earnedPoints !==
                                              undefined
                                                ? `${criterion.earnedPoints}/`
                                                : ""}
                                              {criterion.maxPoints}
                                            </span>
                                          </div>
                                          {criterion.comments && (
                                            <p className='text-xs text-gray-600'>
                                              {criterion.comments}
                                            </p>
                                          )}
                                        </div>
                                      )
                                    )}
                                  </div>
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
                    {/* Grade Distribution */}
                    {stats.gradeDistribution.length > 0 && (
                      <div>
                        <h3 className='font-semibold text-lg text-gray-900 mb-4'>
                          توزيع الدرجات
                        </h3>
                        <div className='space-y-3'>
                          {stats.gradeDistribution.map((grade, index) => (
                            <div
                              key={index}
                              className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'>
                              <span className='font-medium text-gray-900'>
                                {grade.grade}
                              </span>
                              <span className='text-gray-600'>
                                {grade.count} تقييم
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Recent Trend */}
                    {stats.recentTrend.length > 0 && (
                      <div>
                        <h3 className='font-semibold text-lg text-gray-900 mb-4'>
                          الاتجاه الحديث
                        </h3>
                        <div className='space-y-3'>
                          {stats.recentTrend.map((trend, index) => (
                            <div key={index} className='border rounded-lg p-4'>
                              <div className='flex items-center justify-between mb-2'>
                                <span className='font-medium text-gray-900'>
                                  {trend.period}
                                </span>
                                <span
                                  className={`text-lg font-bold ${getGradeColor(
                                    trend.averageGrade.toString()
                                  )}`}>
                                  {trend.averageGrade.toFixed(1)}
                                </span>
                              </div>
                              <div className='w-full bg-gray-200 rounded-full h-2'>
                                <div
                                  className={`h-2 rounded-full transition-all duration-300 ${
                                    trend.averageGrade >= 90
                                      ? "bg-green-500"
                                      : trend.averageGrade >= 80
                                      ? "bg-blue-500"
                                      : trend.averageGrade >= 70
                                      ? "bg-yellow-500"
                                      : trend.averageGrade >= 60
                                      ? "bg-orange-500"
                                      : "bg-red-500"
                                  }`}
                                  style={{
                                    width: `${trend.averageGrade}%`,
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
              {activeTab === "assessments"
                ? `عرض ${filteredAssessments.length} من ${assessments.length} تقييم`
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
