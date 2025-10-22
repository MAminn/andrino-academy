"use client";

import { useState, useEffect, useCallback } from "react";
import {
  BookOpen,
  GraduationCap,
  UserCheck,
  Users,
  Calendar,
  Clock,
  BarChart3,
  X,
} from "lucide-react";

interface TrackDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  trackId: string | null;
}

interface Track {
  id: string;
  name: string;
  description: string;
  startDate?: string;
  endDate?: string;
  grade: {
    id: string;
    name: string;
    description: string;
  };
  instructor: {
    id: string;
    name: string;
    email: string;
  };
  coordinator: {
    id: string;
    name: string;
    email: string;
  };
  liveSessions: {
    id: string;
    title: string;
    date: string;
    startTime: string;
    endTime: string;
    status: string;
    _count: {
      attendances: number;
    };
  }[];
}

export default function TrackDetailsModal({
  isOpen,
  onClose,
  trackId,
}: TrackDetailsModalProps) {
  const [track, setTrack] = useState<Track | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTrackDetails = useCallback(async () => {
    if (!trackId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/tracks/${trackId}`);
      if (!response.ok) {
        throw new Error("فشل في تحميل تفاصيل المسار");
      }

      const result = await response.json();
      // API returns { track } directly
      setTrack(result.track);
    } catch (error) {
      console.error("Error fetching track:", error);
      setError(
        error instanceof Error ? error.message : "فشل في تحميل التفاصيل"
      );
    } finally {
      setLoading(false);
    }
  }, [trackId]);

  useEffect(() => {
    if (isOpen && trackId) {
      fetchTrackDetails();
    }
  }, [isOpen, trackId, fetchTrackDetails]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ar-SA", {
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
        className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.className}`}>
        {statusInfo.label}
      </span>
    );
  };

  return (
    <>
      {isOpen && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
          <div
            className='bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto'
            dir='rtl'>
            {/* Header */}
            <div className='sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between'>
              <h2 className='text-xl font-bold text-gray-800'>تفاصيل المسار</h2>
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

                {!loading && !error && track && (
                  <>
                    {/* Header */}
                    <div className='bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg'>
                      <h2 className='text-2xl font-bold text-gray-800 mb-2'>
                        {track.name}
                      </h2>
                      {track.description && (
                        <p className='text-gray-600 mb-4'>
                          {track.description}
                        </p>
                      )}

                      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        <div className='flex items-center text-gray-700'>
                          <GraduationCap className='w-5 h-5 ml-2 text-blue-600' />
                          <span>{track.grade.name}</span>
                        </div>
                        <div className='flex items-center text-gray-700'>
                          <UserCheck className='w-5 h-5 ml-2 text-blue-600' />
                          <span>المعلم: {track.instructor.name}</span>
                        </div>
                        <div className='flex items-center text-gray-700'>
                          <Users className='w-5 h-5 ml-2 text-blue-600' />
                          <span>المنسق: {track.coordinator.name}</span>
                        </div>
                      </div>
                    </div>

                    {/* Statistics */}
                    <div className='grid grid-cols-2 gap-4'>
                      <div className='bg-blue-50 p-4 rounded-lg text-center'>
                        <div className='flex items-center justify-center mb-2'>
                          <Calendar className='w-6 h-6 text-blue-600' />
                        </div>
                        <div className='text-2xl font-bold text-blue-600'>
                          {track.liveSessions.length}
                        </div>
                        <div className='text-sm text-gray-600'>جلسة</div>
                      </div>
                      <div className='bg-purple-50 p-4 rounded-lg text-center'>
                        <div className='flex items-center justify-center mb-2'>
                          <BarChart3 className='w-6 h-6 text-purple-600' />
                        </div>
                        <div className='text-2xl font-bold text-purple-600'>
                          {
                            track.liveSessions.filter(
                              (s) => s.status === "COMPLETED"
                            ).length
                          }
                        </div>
                        <div className='text-sm text-gray-600'>مكتمل</div>
                      </div>
                    </div>

                    {/* Sessions List */}
                    <div>
                      <h3 className='text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2'>
                        <BookOpen className='w-5 h-5 text-blue-600' />
                        الجلسات ({track.liveSessions.length})
                      </h3>
                      <div className='max-h-64 overflow-y-auto space-y-2'>
                        {track.liveSessions.map((session) => (
                          <div
                            key={session.id}
                            className='flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors'>
                            <div className='flex-1'>
                              <div className='font-medium text-gray-800'>
                                {session.title}
                              </div>
                              <div className='flex items-center gap-4 mt-1 text-sm text-gray-600'>
                                <span className='flex items-center gap-1'>
                                  <Calendar className='w-3 h-3' />
                                  {formatDate(session.date)}
                                </span>
                                <span className='flex items-center gap-1'>
                                  <Clock className='w-3 h-3' />
                                  {formatTime(session.startTime)}
                                </span>
                                <span className='flex items-center gap-1'>
                                  <Users className='w-3 h-3' />
                                  {session._count.attendances} طالب
                                </span>
                              </div>
                            </div>
                            {getStatusBadge(session.status)}
                          </div>
                        ))}

                        {track.liveSessions.length === 0 && (
                          <div className='text-center py-6 text-gray-500'>
                            لا توجد جلسات في هذا المسار
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Sessions List */}
                    <div>
                      <h3 className='text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2'>
                        <BookOpen className='w-5 h-5 text-blue-600' />
                        الجلسات ({track.liveSessions.length})
                      </h3>
                      <div className='max-h-64 overflow-y-auto space-y-2'>
                        {track.liveSessions.map((session) => (
                          <div
                            key={session.id}
                            className='flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors'>
                            <div className='flex-1'>
                              <div className='font-medium text-gray-800'>
                                {session.title}
                              </div>
                              <div className='flex items-center gap-4 mt-1 text-sm text-gray-600'>
                                <span className='flex items-center gap-1'>
                                  <Calendar className='w-3 h-3' />
                                  {formatDate(session.date)}
                                </span>
                                <span className='flex items-center gap-1'>
                                  <Clock className='w-3 h-3' />
                                  {formatTime(session.startTime)}
                                </span>
                                <span className='flex items-center gap-1'>
                                  <Users className='w-3 h-3' />
                                  {session._count.attendances} طالب
                                </span>
                              </div>
                            </div>
                            {getStatusBadge(session.status)}
                          </div>
                        ))}

                        {track.liveSessions.length === 0 && (
                          <div className='text-center py-6 text-gray-500'>
                            لا توجد جلسات في هذا المسار
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
