"use client";

import { useState, useEffect } from "react";
import { X, UserCheck, Users, AlertCircle, Search, Filter } from "lucide-react";

interface InstructorManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Instructor {
  id: string;
  name: string;
  email: string;
  tracks: {
    id: string;
    name: string;
    grade: {
      name: string;
    };
    _count: {
      liveSessions: number;
    };
  }[];
  _count: {
    tracks: number;
  };
}

interface InstructorAnalytics {
  instructorWorkload: {
    id: string;
    name: string;
    email: string;
    totalTracks: number;
    totalUpcomingSessions: number;
    activeSessions: number;
    workloadScore: number;
  }[];
  averageWorkload: number;
}

export default function InstructorManagementModal({
  isOpen,
  onClose,
}: InstructorManagementModalProps) {
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [analytics, setAnalytics] = useState<InstructorAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "workload" | "tracks">("name");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchInstructorData();
    }
  }, [isOpen]);

  const fetchInstructorData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch instructors with their tracks
      const instructorsResponse = await fetch(
        "/api/users?role=instructor&include=tracks"
      );
      if (instructorsResponse.ok) {
        const instructorsData = await instructorsResponse.json();
        setInstructors(instructorsData);
      }

      // Fetch coordinator analytics to get workload data
      const analyticsResponse = await fetch("/api/analytics/coordinator");
      if (analyticsResponse.ok) {
        const analyticsData = await analyticsResponse.json();
        setAnalytics(analyticsData.analytics.instructorAnalytics);
      }
    } catch (error) {
      console.error("Error fetching instructor data:", error);
      setError("فشل في تحميل بيانات المدربين");
    } finally {
      setLoading(false);
    }
  };

  const getWorkloadData = (instructorId: string) => {
    if (!analytics) return null;
    return analytics.instructorWorkload.find((w) => w.id === instructorId);
  };

  const getWorkloadColor = (score: number) => {
    if (score >= 80) return "text-red-600 bg-red-100";
    if (score >= 60) return "text-yellow-600 bg-yellow-100";
    if (score >= 40) return "text-blue-600 bg-blue-100";
    return "text-green-600 bg-green-100";
  };

  const getWorkloadLabel = (score: number) => {
    if (score >= 80) return "مرتفع جداً";
    if (score >= 60) return "مرتفع";
    if (score >= 40) return "متوسط";
    return "منخفض";
  };

  const filteredAndSortedInstructors = instructors
    .filter(
      (instructor) =>
        instructor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        instructor.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name, "ar");
        case "tracks":
          return b._count.tracks - a._count.tracks;
        case "workload":
          const aWorkload = getWorkloadData(a.id)?.workloadScore || 0;
          const bWorkload = getWorkloadData(b.id)?.workloadScore || 0;
          return bWorkload - aWorkload;
        default:
          return 0;
      }
    });

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
      <div className='bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden'>
        {/* Header */}
        <div className='flex items-center justify-between p-6 border-b'>
          <div>
            <h2 className='text-xl font-semibold text-gray-900'>
              إدارة المدربين
            </h2>
            <p className='text-sm text-gray-600 mt-1'>
              عرض وإدارة أعباء العمل والمسارات للمدربين
            </p>
          </div>
          <button
            onClick={onClose}
            className='text-gray-400 hover:text-gray-600 transition-colors'>
            <X className='w-6 h-6' />
          </button>
        </div>

        {/* Content */}
        <div className='flex flex-col h-[calc(90vh-120px)]'>
          {/* Controls */}
          <div className='flex items-center justify-between p-6 border-b bg-gray-50'>
            <div className='flex items-center gap-4'>
              {/* Search */}
              <div className='relative'>
                <Search className='absolute right-3 top-2.5 h-5 w-5 text-gray-400' />
                <input
                  type='text'
                  placeholder='البحث عن مدرب...'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className='pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                />
              </div>

              {/* Sort */}
              <div className='flex items-center gap-2'>
                <Filter className='h-5 w-5 text-gray-500' />
                <select
                  value={sortBy}
                  onChange={(e) =>
                    setSortBy(e.target.value as "name" | "workload" | "tracks")
                  }
                  className='px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'>
                  <option value='name'>ترتيب حسب الاسم</option>
                  <option value='workload'>ترتيب حسب عبء العمل</option>
                  <option value='tracks'>ترتيب حسب عدد المسارات</option>
                </select>
              </div>
            </div>

            {/* Summary Stats */}
            {analytics && (
              <div className='flex items-center gap-6 text-sm'>
                <div className='text-center'>
                  <div className='font-semibold text-gray-900'>
                    {instructors.length}
                  </div>
                  <div className='text-gray-600'>إجمالي المدربين</div>
                </div>
                <div className='text-center'>
                  <div className='font-semibold text-gray-900'>
                    {analytics.averageWorkload}%
                  </div>
                  <div className='text-gray-600'>متوسط عبء العمل</div>
                </div>
              </div>
            )}
          </div>

          {/* Main Content */}
          <div className='flex-1 overflow-y-auto p-6'>
            {loading ? (
              <div className='flex items-center justify-center py-12'>
                <div className='text-center'>
                  <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4'></div>
                  <p className='text-gray-600'>جارٍ تحميل بيانات المدربين...</p>
                </div>
              </div>
            ) : error ? (
              <div className='flex items-center justify-center py-12'>
                <div className='text-center'>
                  <AlertCircle className='w-12 h-12 text-red-500 mx-auto mb-4' />
                  <p className='text-red-600'>{error}</p>
                  <button
                    onClick={fetchInstructorData}
                    className='mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'>
                    إعادة المحاولة
                  </button>
                </div>
              </div>
            ) : (
              <div className='grid gap-4'>
                {filteredAndSortedInstructors.map((instructor) => {
                  const workloadData = getWorkloadData(instructor.id);

                  return (
                    <div
                      key={instructor.id}
                      className='bg-white border rounded-lg p-6 hover:shadow-md transition-shadow'>
                      <div className='flex items-start justify-between mb-4'>
                        <div className='flex items-center gap-4'>
                          <div className='w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center'>
                            <UserCheck className='w-6 h-6 text-blue-600' />
                          </div>
                          <div>
                            <h3 className='font-semibold text-gray-900'>
                              {instructor.name}
                            </h3>
                            <p className='text-gray-600 text-sm'>
                              {instructor.email}
                            </p>
                          </div>
                        </div>

                        {workloadData && (
                          <div className='text-left'>
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-medium ${getWorkloadColor(
                                workloadData.workloadScore
                              )}`}>
                              {getWorkloadLabel(workloadData.workloadScore)} (
                              {workloadData.workloadScore}%)
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Statistics */}
                      <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-4'>
                        <div className='text-center p-3 bg-blue-50 rounded-lg'>
                          <div className='font-semibold text-blue-900'>
                            {instructor._count.tracks}
                          </div>
                          <div className='text-blue-700 text-sm'>المسارات</div>
                        </div>
                        {workloadData && (
                          <>
                            <div className='text-center p-3 bg-green-50 rounded-lg'>
                              <div className='font-semibold text-green-900'>
                                {workloadData.totalUpcomingSessions}
                              </div>
                              <div className='text-green-700 text-sm'>
                                الجلسات القادمة
                              </div>
                            </div>
                            <div className='text-center p-3 bg-purple-50 rounded-lg'>
                              <div className='font-semibold text-purple-900'>
                                {workloadData.activeSessions}
                              </div>
                              <div className='text-purple-700 text-sm'>
                                الجلسات النشطة
                              </div>
                            </div>
                            <div className='text-center p-3 bg-orange-50 rounded-lg'>
                              <div className='font-semibold text-orange-900'>
                                {workloadData.workloadScore}%
                              </div>
                              <div className='text-orange-700 text-sm'>
                                عبء العمل
                              </div>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Tracks List */}
                      {instructor.tracks.length > 0 && (
                        <div>
                          <h4 className='font-medium text-gray-900 mb-2 flex items-center gap-2'>
                            <Users className='w-4 h-4' />
                            المسارات المُدرَّسة ({instructor.tracks.length})
                          </h4>
                          <div className='grid gap-2'>
                            {instructor.tracks.slice(0, 3).map((track) => (
                              <div
                                key={track.id}
                                className='flex items-center justify-between p-2 bg-gray-50 rounded'>
                                <span className='font-medium'>
                                  {track.name}
                                </span>
                                <div className='flex items-center gap-4 text-sm text-gray-600'>
                                  <span>{track.grade.name}</span>
                                  <span>{track._count.liveSessions} جلسة</span>
                                </div>
                              </div>
                            ))}
                            {instructor.tracks.length > 3 && (
                              <div className='text-center py-2 text-sm text-gray-500'>
                                و {instructor.tracks.length - 3} مسارات أخرى...
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {instructor.tracks.length === 0 && (
                        <div className='text-center py-4 text-gray-500'>
                          لا توجد مسارات مُدرَّسة حالياً
                        </div>
                      )}
                    </div>
                  );
                })}

                {filteredAndSortedInstructors.length === 0 && !loading && (
                  <div className='text-center py-12'>
                    <Users className='w-16 h-16 text-gray-400 mx-auto mb-4' />
                    <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                      لا توجد نتائج
                    </h3>
                    <p className='text-gray-600'>
                      {searchTerm
                        ? `لم يتم العثور على مدربين يتطابقون مع "${searchTerm}"`
                        : "لا توجد مدربين مسجلين"}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className='border-t p-6 bg-gray-50'>
            <div className='flex justify-between items-center'>
              <div className='text-sm text-gray-600'>
                عرض {filteredAndSortedInstructors.length} من{" "}
                {instructors.length} مدرب
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
    </div>
  );
}
