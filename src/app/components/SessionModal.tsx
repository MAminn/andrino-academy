import React, { useState, useEffect } from "react";
import { X, Calendar, Clock, User, BookOpen, AlertCircle } from "lucide-react";

interface Track {
  id: string;
  name: string;
  grade: {
    id: string;
    name: string;
  };
}

interface Instructor {
  id: string;
  name: string;
  email: string;
}

interface SessionFormData {
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  trackId: string;
  instructorId: string;
}

interface EditingSession {
  id?: string;
  title?: string;
  description?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  trackId?: string;
  instructorId?: string;
}

interface SessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (sessionData: SessionFormData) => Promise<void>;
  tracks: Track[];
  instructors: Instructor[];
  editingSession?: EditingSession;
}

export default function SessionModal({
  isOpen,
  onClose,
  onSubmit,
  tracks,
  instructors,
  editingSession,
}: SessionModalProps) {
  const [formData, setFormData] = useState<SessionFormData>({
    title: "",
    description: "",
    date: "",
    startTime: "",
    endTime: "",
    trackId: "",
    instructorId: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editingSession) {
      setFormData({
        title: editingSession.title || "",
        description: editingSession.description || "",
        date: editingSession.date
          ? new Date(editingSession.date).toISOString().split("T")[0]
          : "",
        startTime: editingSession.startTime || "",
        endTime: editingSession.endTime || "",
        trackId: editingSession.trackId || "",
        instructorId: editingSession.instructorId || "",
      });
    } else {
      setFormData({
        title: "",
        description: "",
        date: "",
        startTime: "",
        endTime: "",
        trackId: "",
        instructorId: "",
      });
    }
    setError(null);
  }, [editingSession, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate required fields
      if (
        !formData.title ||
        !formData.date ||
        !formData.startTime ||
        !formData.endTime ||
        !formData.trackId ||
        !formData.instructorId
      ) {
        throw new Error("جميع الحقول مطلوبة");
      }

      // Validate time logic
      if (formData.startTime >= formData.endTime) {
        throw new Error("وقت البداية يجب أن يكون قبل وقت النهاية");
      }

      await onSubmit(formData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "حدث خطأ غير متوقع");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof SessionFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
      <div className='bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto'>
        <div className='flex items-center justify-between p-6 border-b'>
          <h2 className='text-xl font-semibold text-gray-900'>
            {editingSession ? "تعديل الجلسة" : "إنشاء جلسة جديدة"}
          </h2>
          <button
            onClick={onClose}
            className='text-gray-500 hover:text-gray-700'
            disabled={loading}>
            <X className='w-6 h-6' />
          </button>
        </div>

        <form onSubmit={handleSubmit} className='p-6 space-y-6'>
          {error && (
            <div className='bg-red-50 border border-red-200 rounded-lg p-4 flex items-center'>
              <AlertCircle className='w-5 h-5 text-red-600 ml-2' />
              <span className='text-red-700'>{error}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              عنوان الجلسة *
            </label>
            <input
              type='text'
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              placeholder='ادخل عنوان الجلسة'
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              وصف الجلسة
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              rows={3}
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              placeholder='وصف مختصر للجلسة'
            />
          </div>

          {/* Date */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              <Calendar className='w-4 h-4 inline ml-1' />
              تاريخ الجلسة *
            </label>
            <input
              type='date'
              value={formData.date}
              onChange={(e) => handleChange("date", e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              min={new Date().toISOString().split("T")[0]}
              required
            />
          </div>

          {/* Time Range */}
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                <Clock className='w-4 h-4 inline ml-1' />
                وقت البداية *
              </label>
              <input
                type='time'
                value={formData.startTime}
                onChange={(e) => handleChange("startTime", e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                required
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                <Clock className='w-4 h-4 inline ml-1' />
                وقت النهاية *
              </label>
              <input
                type='time'
                value={formData.endTime}
                onChange={(e) => handleChange("endTime", e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                required
              />
            </div>
          </div>

          {/* Track Selection */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              <BookOpen className='w-4 h-4 inline ml-1' />
              المسار *
            </label>
            <select
              value={formData.trackId}
              onChange={(e) => handleChange("trackId", e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              required>
              <option value=''>اختر المسار</option>
              {tracks.map((track) => (
                <option key={track.id} value={track.id}>
                  {track.name} - {track.grade.name}
                </option>
              ))}
            </select>
          </div>

          {/* Instructor Selection */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              <User className='w-4 h-4 inline ml-1' />
              المدرب *
            </label>
            <select
              value={formData.instructorId}
              onChange={(e) => handleChange("instructorId", e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              required>
              <option value=''>اختر المدرب</option>
              {instructors.map((instructor) => (
                <option key={instructor.id} value={instructor.id}>
                  {instructor.name} - {instructor.email}
                </option>
              ))}
            </select>
          </div>

          {/* Action Buttons */}
          <div className='flex justify-end space-x-4 space-x-reverse pt-6 border-t'>
            <button
              type='button'
              onClick={onClose}
              className='px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors'
              disabled={loading}>
              إلغاء
            </button>
            <button
              type='submit'
              className='px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
              disabled={loading}>
              {loading ? "جارٍ الحفظ..." : editingSession ? "تحديث" : "إنشاء"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
