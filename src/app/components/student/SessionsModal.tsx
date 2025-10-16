"use client";

import { useState, useEffect, useCallback } from "react";
import {
  X,
  Calendar,
  Clock,
  CheckCircle,
  Play,
  Eye,
  AlertCircle,
} from "lucide-react";

interface SessionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  trackId: string;
  trackName: string;
}

interface SessionDetail {
  id: string;
  title: string;
  description?: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  attendance?: {
    id: string;
    status: string;
    markedAt: string;
  };
  materials?: string[];
  externalLink?: string;
}

export default function SessionsModal({
  isOpen,
  onClose,
  trackId,
  trackName,
}: SessionsModalProps) {
  const [sessions, setSessions] = useState<SessionDetail[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<
    "all" | "upcoming" | "completed" | "active"
  >("all");

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/sessions?trackId=${trackId}&includeAttendance=true`
      );

      if (!response.ok) {
        throw new Error("فشل في تحميل الجلسات");
      }

      const data = await response.json();
      setSessions(data.sessions || []);
    } catch (error) {
      console.error("Error fetching sessions:", error);
      setError(error instanceof Error ? error.message : "فشل في تحميل الجلسات");
    } finally {
      setLoading(false);
    }
  }, [trackId]);

  useEffect(() => {
    if (isOpen && trackId) {
      fetchSessions();
    }
  }, [isOpen, trackId, fetchSessions]);

  const filteredSessions = sessions.filter((session) => {
    if (filter === "all") return true;
    if (filter === "upcoming") return session.status === "scheduled";
    if (filter === "completed") return session.status === "completed";
    if (filter === "active") return session.status === "active";
    return true;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "scheduled":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-gray-100 text-gray-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active":
        return "جارية";
      case "scheduled":
        return "مجدولة";
      case "completed":
        return "مكتملة";
      case "cancelled":
        return "ملغاة";
      default:
        return status;
    }
  };

  const getAttendanceStatusColor = (status: string) => {
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

  const getAttendanceStatusLabel = (status: string) => {
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

  const handleJoinSession = (externalLink: string) => {
    if (externalLink) {
      window.open(externalLink, "_blank", "noopener,noreferrer");
    }
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
      <div className='bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden'>
        {/* Header */}
        <div className='flex items-center justify-between p-6 border-b'>
          <div>
            <h2 className='text-xl font-semibold text-gray-900'>
              جلسات المسار
            </h2>
            <p className='text-sm text-gray-600 mt-1'>{trackName}</p>
          </div>
          <button
            onClick={onClose}
            className='text-gray-400 hover:text-gray-600 transition-colors'>
            <X className='w-6 h-6' />
          </button>
        </div>

        {/* Filters */}
        <div className='p-6 border-b bg-gray-50'>
          <div className='flex gap-2 overflow-x-auto'>
            {[
              { key: "all", label: "جميع الجلسات" },
              { key: "upcoming", label: "القادمة" },
              { key: "active", label: "الجارية" },
              { key: "completed", label: "المكتملة" },
            ].map((filterOption) => (
              <button
                key={filterOption.key}
                onClick={() =>
                  setFilter(
                    filterOption.key as
                      | "all"
                      | "upcoming"
                      | "completed"
                      | "active"
                  )
                }
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                  filter === filterOption.key
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}>
                {filterOption.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className='flex-1 overflow-y-auto p-6'>
          {loading ? (
            <div className='flex items-center justify-center py-12'>
              <div className='text-center'>
                <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4'></div>
                <p className='text-gray-600'>جارٍ تحميل الجلسات...</p>
              </div>
            </div>
          ) : error ? (
            <div className='flex items-center justify-center py-12'>
              <div className='text-center'>
                <AlertCircle className='w-12 h-12 text-red-500 mx-auto mb-4' />
                <p className='text-red-600 mb-4'>{error}</p>
                <button
                  onClick={fetchSessions}
                  className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'>
                  إعادة المحاولة
                </button>
              </div>
            </div>
          ) : filteredSessions.length === 0 ? (
            <div className='text-center py-12'>
              <Calendar className='w-16 h-16 text-gray-400 mx-auto mb-4' />
              <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                لا توجد جلسات
              </h3>
              <p className='text-gray-600'>
                {filter === "all"
                  ? "لم يتم جدولة أي جلسات لهذا المسار بعد"
                  : `لا توجد جلسات ${
                      filter === "upcoming"
                        ? "قادمة"
                        : filter === "active"
                        ? "جارية"
                        : "مكتملة"
                    }`}
              </p>
            </div>
          ) : (
            <div className='space-y-4'>
              {filteredSessions.map((session) => (
                <div
                  key={session.id}
                  className='border rounded-lg p-6 hover:shadow-md transition-shadow'>
                  <div className='flex items-start justify-between mb-4'>
                    <div className='flex-1'>
                      <h3 className='font-semibold text-lg text-gray-900 mb-2'>
                        {session.title}
                      </h3>
                      {session.description && (
                        <p className='text-gray-600 text-sm mb-3'>
                          {session.description}
                        </p>
                      )}
                    </div>
                    <div className='flex items-center gap-2'>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                          session.status
                        )}`}>
                        {getStatusLabel(session.status)}
                      </span>
                      {session.attendance && (
                        <span
                          className={`text-sm font-medium ${getAttendanceStatusColor(
                            session.attendance.status
                          )}`}>
                          {getAttendanceStatusLabel(session.attendance.status)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className='grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-4'>
                    <div className='flex items-center'>
                      <Calendar className='w-4 h-4 ml-2' />
                      {formatDate(session.date)}
                    </div>
                    <div className='flex items-center'>
                      <Clock className='w-4 h-4 ml-2' />
                      {formatTime(session.startTime)} -{" "}
                      {formatTime(session.endTime)}
                    </div>
                    {session.attendance && (
                      <div className='flex items-center'>
                        <CheckCircle className='w-4 h-4 ml-2' />
                        تم تسجيل الحضور في{" "}
                        {new Date(
                          session.attendance.markedAt
                        ).toLocaleTimeString("ar-SA")}
                      </div>
                    )}
                  </div>

                  {session.materials && session.materials.length > 0 && (
                    <div className='mb-4'>
                      <h4 className='font-medium text-gray-900 mb-2'>
                        المواد التعليمية:
                      </h4>
                      <div className='space-y-1'>
                        {session.materials.map((material, index) => (
                          <a
                            key={index}
                            href={material}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='text-blue-600 hover:text-blue-800 text-sm block'>
                            {material}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className='flex justify-between items-center'>
                    <div className='text-xs text-gray-500'>
                      المعرف: {session.id}
                    </div>
                    <div className='flex gap-2'>
                      {session.status === "active" && session.externalLink && (
                        <button
                          onClick={() =>
                            handleJoinSession(session.externalLink!)
                          }
                          className='flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors'>
                          <Play className='w-4 h-4' />
                          انضم للجلسة
                        </button>
                      )}
                      {session.externalLink && session.status !== "active" && (
                        <button
                          onClick={() =>
                            handleJoinSession(session.externalLink!)
                          }
                          className='flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors'>
                          <Eye className='w-4 h-4' />
                          رابط الجلسة
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className='border-t p-6 bg-gray-50'>
          <div className='flex justify-between items-center'>
            <div className='text-sm text-gray-600'>
              عرض {filteredSessions.length} من {sessions.length} جلسة
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
