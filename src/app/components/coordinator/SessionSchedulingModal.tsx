"use client";

import { useState, useEffect } from "react";
import {
  X,
  Calendar,
  Clock,
  Save,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

interface SessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editSession?: {
    id: string;
    title: string;
    description?: string;
    date: string;
    startTime: string;
    endTime: string;
    trackId: string;
  } | null;
}

interface Track {
  id: string;
  name: string;
  grade: {
    name: string;
  };
  instructor: {
    name: string;
  };
}

export default function SessionSchedulingModal({
  isOpen,
  onClose,
  onSuccess,
  editSession,
}: SessionModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    startTime: "",
    endTime: "",
    trackId: "",
  });
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Get today's date for minimum date validation
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    if (isOpen) {
      fetchTracks();
      if (editSession) {
        setFormData({
          title: editSession.title,
          description: editSession.description || "",
          date: editSession.date,
          startTime: editSession.startTime,
          endTime: editSession.endTime,
          trackId: editSession.trackId,
        });
      } else {
        setFormData({
          title: "",
          description: "",
          date: "",
          startTime: "",
          endTime: "",
          trackId: "",
        });
      }
      setError(null);
      setSuccess(false);
    }
  }, [isOpen, editSession]);

  const fetchTracks = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/tracks");
      if (response.ok) {
        const data = await response.json();
        setTracks(data);
      } else {
        setError("فشل في تحميل المسارات");
      }
    } catch (error) {
      console.error("Error fetching tracks:", error);
      setError("فشل في تحميل المسارات");
    } finally {
      setLoading(false);
    }
  };

  const validateTimeRange = () => {
    if (formData.startTime && formData.endTime) {
      return formData.startTime < formData.endTime;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (
      !formData.title.trim() ||
      !formData.date ||
      !formData.startTime ||
      !formData.endTime ||
      !formData.trackId
    ) {
      setError("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    if (!validateTimeRange()) {
      setError("وقت البداية يجب أن يكون قبل وقت النهاية");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const url = editSession
        ? `/api/sessions/${editSession.id}`
        : "/api/sessions";
      const method = editSession ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          status: "scheduled", // Default status for new sessions
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "فشل في حفظ الجلسة");
      }

      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (error) {
      setError(error instanceof Error ? error.message : "حدث خطأ غير متوقع");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) {
      onClose();
    }
  };

  // Generate time options (every 30 minutes from 6 AM to 10 PM)
  const generateTimeOptions = () => {
    const options = [];
    for (let hour = 6; hour <= 22; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, "0")}:${minute
          .toString()
          .padStart(2, "0")}`;
        const displayTime = new Date(
          `2000-01-01T${timeString}`
        ).toLocaleTimeString("ar-SA", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        });
        options.push({ value: timeString, label: displayTime });
      }
    }
    return options;
  };

  const timeOptions = generateTimeOptions();

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
      <div className='bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto'>
        {/* Header */}
        <div className='flex items-center justify-between p-6 border-b'>
          <h2 className='text-xl font-semibold text-gray-900'>
            {editSession ? "تعديل الجلسة" : "جدولة جلسة جديدة"}
          </h2>
          <button
            onClick={handleClose}
            disabled={submitting}
            className='text-gray-400 hover:text-gray-600 transition-colors'>
            <X className='w-6 h-6' />
          </button>
        </div>

        {/* Content */}
        <div className='p-6'>
          {loading ? (
            <div className='flex items-center justify-center py-8'>
              <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
              <span className='mr-2 text-gray-600'>جارٍ التحميل...</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className='space-y-4'>
              {/* Session Title */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  عنوان الجلسة *
                </label>
                <input
                  type='text'
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  placeholder='أدخل عنوان الجلسة'
                  required
                  disabled={submitting}
                />
              </div>

              {/* Track Selection */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  المسار *
                </label>
                <select
                  value={formData.trackId}
                  onChange={(e) =>
                    setFormData({ ...formData, trackId: e.target.value })
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  required
                  disabled={submitting}>
                  <option value=''>اختر المسار</option>
                  {tracks.map((track) => (
                    <option key={track.id} value={track.id}>
                      {track.name} - {track.grade.name} (مع{" "}
                      {track.instructor.name})
                    </option>
                  ))}
                </select>
              </div>

              {/* Date */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  تاريخ الجلسة *
                </label>
                <div className='relative'>
                  <input
                    type='date'
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                    min={today}
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    required
                    disabled={submitting}
                  />
                  <Calendar className='absolute left-3 top-2.5 h-5 w-5 text-gray-400 pointer-events-none' />
                </div>
              </div>

              {/* Time Range */}
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    وقت البداية *
                  </label>
                  <div className='relative'>
                    <select
                      value={formData.startTime}
                      onChange={(e) =>
                        setFormData({ ...formData, startTime: e.target.value })
                      }
                      className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                      required
                      disabled={submitting}>
                      <option value=''>اختر الوقت</option>
                      {timeOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <Clock className='absolute left-3 top-2.5 h-5 w-5 text-gray-400 pointer-events-none' />
                  </div>
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    وقت النهاية *
                  </label>
                  <div className='relative'>
                    <select
                      value={formData.endTime}
                      onChange={(e) =>
                        setFormData({ ...formData, endTime: e.target.value })
                      }
                      className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                      required
                      disabled={submitting}>
                      <option value=''>اختر الوقت</option>
                      {timeOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <Clock className='absolute left-3 top-2.5 h-5 w-5 text-gray-400 pointer-events-none' />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  وصف الجلسة
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  placeholder='وصف محتوى الجلسة (اختياري)'
                  rows={3}
                  disabled={submitting}
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className='flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md'>
                  <AlertCircle className='w-5 h-5 text-red-500 flex-shrink-0' />
                  <span className='text-red-700 text-sm'>{error}</span>
                </div>
              )}

              {/* Success Message */}
              {success && (
                <div className='flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md'>
                  <CheckCircle className='w-5 h-5 text-green-500 flex-shrink-0' />
                  <span className='text-green-700 text-sm'>
                    {editSession
                      ? "تم تحديث الجلسة بنجاح"
                      : "تم جدولة الجلسة بنجاح"}
                  </span>
                </div>
              )}

              {/* Buttons */}
              <div className='flex gap-3 pt-4'>
                <button
                  type='button'
                  onClick={handleClose}
                  disabled={submitting}
                  className='flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed'>
                  إلغاء
                </button>
                <button
                  type='submit'
                  disabled={submitting || success}
                  className='flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'>
                  {submitting ? (
                    <>
                      <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white'></div>
                      جارٍ الحفظ...
                    </>
                  ) : (
                    <>
                      <Save className='w-4 h-4' />
                      {editSession ? "تحديث" : "جدولة"}
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
