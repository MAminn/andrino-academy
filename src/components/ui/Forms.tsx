"use client";

import { useState } from "react";
import { Modal } from "./Modal";

interface Grade {
  id?: string;
  name: string;
  description?: string;
  order?: number;
}

interface GradeFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (grade: Grade) => Promise<void>;
  grade?: Grade;
  mode: "create" | "edit";
}

export function GradeForm({
  isOpen,
  onClose,
  onSubmit,
  grade,
  mode,
}: GradeFormProps) {
  const [formData, setFormData] = useState<Grade>({
    name: grade?.name || "",
    description: grade?.description || "",
    order: grade?.order || 1,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) {
      newErrors.name = "اسم المستوى مطلوب";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        ...formData,
        id: grade?.id,
      });
      onClose();
      setFormData({ name: "", description: "", order: 1 });
      setErrors({});
    } catch (error) {
      console.error("Error submitting grade:", error);
      setErrors({ submit: "حدث خطأ أثناء حفظ البيانات" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === "create" ? "إنشاء مستوى جديد" : "تعديل المستوى"}
      size='md'>
      <form onSubmit={handleSubmit} className='space-y-4'>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            اسم المستوى *
          </label>
          <input
            type='text'
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.name ? "border-red-500" : "border-gray-300"
            }`}
            placeholder='مثل: المستوى الأول'
          />
          {errors.name && (
            <p className='text-red-500 text-sm mt-1'>{errors.name}</p>
          )}
        </div>

        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            الوصف
          </label>
          <textarea
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
            rows={3}
            placeholder='وصف المستوى والفئة العمرية المناسبة'
          />
        </div>

        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            ترتيب المستوى
          </label>
          <input
            type='number'
            min='1'
            value={formData.order}
            onChange={(e) =>
              setFormData({ ...formData, order: parseInt(e.target.value) || 1 })
            }
            className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
          />
        </div>

        {errors.submit && (
          <div className='p-3 bg-red-50 border border-red-200 rounded-lg'>
            <p className='text-red-600 text-sm'>{errors.submit}</p>
          </div>
        )}

        <div className='flex items-center justify-end space-x-3 space-x-reverse pt-4 border-t'>
          <button
            type='button'
            onClick={onClose}
            className='px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors'
            disabled={loading}>
            إلغاء
          </button>
          <button
            type='submit'
            className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50'
            disabled={loading}>
            {loading ? "جاري الحفظ..." : mode === "create" ? "إنشاء" : "تحديث"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

interface Track {
  id?: string;
  name: string;
  description?: string;
  gradeId: string;
  instructorId: string;
  coordinatorId: string;
}

interface TrackFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (track: Track) => Promise<void>;
  track?: Track;
  mode: "create" | "edit";
  grades: Array<{ id: string; name: string }>;
  instructors: Array<{ id: string; name: string }>;
  coordinators: Array<{ id: string; name: string }>;
}

export function TrackForm({
  isOpen,
  onClose,
  onSubmit,
  track,
  mode,
  grades,
  instructors,
  coordinators,
}: TrackFormProps) {
  const [formData, setFormData] = useState<Track>({
    name: track?.name || "",
    description: track?.description || "",
    gradeId: track?.gradeId || "",
    instructorId: track?.instructorId || "",
    coordinatorId: track?.coordinatorId || "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "اسم المسار مطلوب";
    if (!formData.gradeId) newErrors.gradeId = "المستوى مطلوب";
    if (!formData.instructorId) newErrors.instructorId = "المعلم مطلوب";
    if (!formData.coordinatorId) newErrors.coordinatorId = "المنسق مطلوب";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        ...formData,
        id: track?.id,
      });
      onClose();
      setFormData({
        name: "",
        description: "",
        gradeId: "",
        instructorId: "",
        coordinatorId: "",
      });
      setErrors({});
    } catch (error) {
      console.error("Error submitting track:", error);
      setErrors({ submit: "حدث خطأ أثناء حفظ البيانات" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === "create" ? "إنشاء مسار جديد" : "تعديل المسار"}
      size='lg'>
      <form onSubmit={handleSubmit} className='space-y-4'>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            اسم المسار *
          </label>
          <input
            type='text'
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.name ? "border-red-500" : "border-gray-300"
            }`}
            placeholder='مثل: برمجة المواقع'
          />
          {errors.name && (
            <p className='text-red-500 text-sm mt-1'>{errors.name}</p>
          )}
        </div>

        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            المستوى *
          </label>
          <select
            value={formData.gradeId}
            onChange={(e) =>
              setFormData({ ...formData, gradeId: e.target.value })
            }
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.gradeId ? "border-red-500" : "border-gray-300"
            }`}>
            <option value=''>اختر المستوى</option>
            {grades.map((grade) => (
              <option key={grade.id} value={grade.id}>
                {grade.name}
              </option>
            ))}
          </select>
          {errors.gradeId && (
            <p className='text-red-500 text-sm mt-1'>{errors.gradeId}</p>
          )}
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              المعلم *
            </label>
            <select
              value={formData.instructorId}
              onChange={(e) =>
                setFormData({ ...formData, instructorId: e.target.value })
              }
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.instructorId ? "border-red-500" : "border-gray-300"
              }`}>
              <option value=''>اختر المعلم</option>
              {instructors.map((instructor) => (
                <option key={instructor.id} value={instructor.id}>
                  {instructor.name}
                </option>
              ))}
            </select>
            {errors.instructorId && (
              <p className='text-red-500 text-sm mt-1'>{errors.instructorId}</p>
            )}
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              المنسق *
            </label>
            <select
              value={formData.coordinatorId}
              onChange={(e) =>
                setFormData({ ...formData, coordinatorId: e.target.value })
              }
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.coordinatorId ? "border-red-500" : "border-gray-300"
              }`}>
              <option value=''>اختر المنسق</option>
              {coordinators.map((coordinator) => (
                <option key={coordinator.id} value={coordinator.id}>
                  {coordinator.name}
                </option>
              ))}
            </select>
            {errors.coordinatorId && (
              <p className='text-red-500 text-sm mt-1'>
                {errors.coordinatorId}
              </p>
            )}
          </div>
        </div>

        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            وصف المسار
          </label>
          <textarea
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
            rows={3}
            placeholder='وصف المسار والمهارات المكتسبة'
          />
        </div>

        {errors.submit && (
          <div className='p-3 bg-red-50 border border-red-200 rounded-lg'>
            <p className='text-red-600 text-sm'>{errors.submit}</p>
          </div>
        )}

        <div className='flex items-center justify-end space-x-3 space-x-reverse pt-4 border-t'>
          <button
            type='button'
            onClick={onClose}
            className='px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors'
            disabled={loading}>
            إلغاء
          </button>
          <button
            type='submit'
            className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50'
            disabled={loading}>
            {loading ? "جاري الحفظ..." : mode === "create" ? "إنشاء" : "تحديث"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
