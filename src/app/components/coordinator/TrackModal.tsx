"use client";

import { useState, useEffect } from "react";
import { X, Save, AlertCircle, CheckCircle } from "lucide-react";

interface TrackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editTrack?: {
    id: string;
    name: string;
    description?: string;
    gradeId: string;
    instructorId: string;
  } | null;
}

interface Grade {
  id: string;
  name: string;
  order: number;
}

interface User {
  id: string;
  name: string;
  email: string;
}

export default function TrackModal({
  isOpen,
  onClose,
  onSuccess,
  editTrack,
}: TrackModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    gradeId: "",
    instructorId: "",
  });
  const [grades, setGrades] = useState<Grade[]>([]);
  const [instructors, setInstructors] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Fetch data when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchInitialData();
      if (editTrack) {
        setFormData({
          name: editTrack.name,
          description: editTrack.description || "",
          gradeId: editTrack.gradeId,
          instructorId: editTrack.instructorId,
        });
      } else {
        setFormData({
          name: "",
          description: "",
          gradeId: "",
          instructorId: "",
        });
      }
      setError(null);
      setSuccess(false);
    }
  }, [isOpen, editTrack]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      // Fetch grades - API returns { grades: [...] }
      const gradesResponse = await fetch("/api/grades");
      if (gradesResponse.ok) {
        const result = await gradesResponse.json();
        const gradesArray = result.grades || [];
        setGrades(gradesArray.sort((a: Grade, b: Grade) => a.order - b.order));
      }

      // Fetch instructors - API returns { users: [...] }
      const instructorsResponse = await fetch("/api/users?role=instructor");
      if (instructorsResponse.ok) {
        const result = await instructorsResponse.json();
        setInstructors(result.users || []);
      }
    } catch (error) {
      console.error("Error fetching initial data:", error);
      setError("فشل في تحميل البيانات الأولية");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.gradeId || !formData.instructorId) {
      setError("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const url = editTrack ? `/api/tracks/${editTrack.id}` : "/api/tracks";
      const method = editTrack ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "فشل في حفظ المسار");
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

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
      <div className='bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto'>
        {/* Header */}
        <div className='flex items-center justify-between p-6 border-b'>
          <h2 className='text-xl font-semibold text-gray-900'>
            {editTrack ? "تعديل المسار" : "إنشاء مسار جديد"}
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
              {/* Track Name */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  اسم المسار *
                </label>
                <input
                  type='text'
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  placeholder='أدخل اسم المسار'
                  required
                  disabled={submitting}
                />
              </div>

              {/* Description */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  الوصف
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  placeholder='وصف المسار (اختياري)'
                  rows={3}
                  disabled={submitting}
                />
              </div>

              {/* Grade Selection */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  المستوى *
                </label>
                <select
                  value={formData.gradeId}
                  onChange={(e) =>
                    setFormData({ ...formData, gradeId: e.target.value })
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  required
                  disabled={submitting}>
                  <option value=''>اختر المستوى</option>
                  {grades.map((grade) => (
                    <option key={grade.id} value={grade.id}>
                      {grade.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Instructor Selection */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  المدرب *
                </label>
                <select
                  value={formData.instructorId}
                  onChange={(e) =>
                    setFormData({ ...formData, instructorId: e.target.value })
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  required
                  disabled={submitting}>
                  <option value=''>اختر المدرب</option>
                  {instructors.map((instructor) => (
                    <option key={instructor.id} value={instructor.id}>
                      {instructor.name} - {instructor.email}
                    </option>
                  ))}
                </select>
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
                    {editTrack
                      ? "تم تحديث المسار بنجاح"
                      : "تم إنشاء المسار بنجاح"}
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
                  className='flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'>
                  {submitting ? (
                    <>
                      <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white'></div>
                      جارٍ الحفظ...
                    </>
                  ) : (
                    <>
                      <Save className='w-4 h-4' />
                      {editTrack ? "تحديث" : "إنشاء"}
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
