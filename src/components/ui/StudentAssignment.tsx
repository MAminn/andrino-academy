"use client";

import { useState } from "react";
import { Modal } from "./Modal";

interface Student {
  id: string;
  name: string;
  email: string;
  age?: number;
  gradeId?: string;
}

interface Grade {
  id: string;
  name: string;
}

interface StudentAssignmentProps {
  isOpen: boolean;
  onClose: () => void;
  onAssign: (studentId: string, gradeId: string) => Promise<void>;
  student: Student | null;
  grades: Grade[];
}

export function StudentAssignment({ 
  isOpen, 
  onClose, 
  onAssign, 
  student, 
  grades 
}: StudentAssignmentProps) {
  const [selectedGradeId, setSelectedGradeId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedGradeId || !student) {
      setError("يرجى اختيار المستوى");
      return;
    }

    setLoading(true);
    try {
      await onAssign(student.id, selectedGradeId);
      onClose();
      setSelectedGradeId("");
      setError("");
    } catch (error) {
      console.error("Error assigning student:", error);
      setError("حدث خطأ أثناء تسجيل الطالب");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="تسجيل الطالب في مستوى"
      size="md"
    >
      {student && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">بيانات الطالب</h4>
            <div className="space-y-1 text-sm text-gray-600">
              <p><span className="font-medium">الاسم:</span> {student.name}</p>
              <p><span className="font-medium">البريد الإلكتروني:</span> {student.email}</p>
              {student.age && (
                <p><span className="font-medium">العمر:</span> {student.age} سنة</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              اختر المستوى *
            </label>
            <select
              value={selectedGradeId}
              onChange={(e) => setSelectedGradeId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">اختر المستوى المناسب</option>
              {grades.map((grade) => (
                <option key={grade.id} value={grade.id}>
                  {grade.name}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <div className="flex items-center justify-end space-x-3 space-x-reverse pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              disabled={loading}
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "جاري التسجيل..." : "تسجيل الطالب"}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}

interface BulkStudentAssignmentProps {
  isOpen: boolean;
  onClose: () => void;
  onAssign: (studentIds: string[], gradeId: string) => Promise<void>;
  unassignedStudents: Student[];
  grades: Grade[];
}

export function BulkStudentAssignment({ 
  isOpen, 
  onClose, 
  onAssign, 
  unassignedStudents, 
  grades 
}: BulkStudentAssignmentProps) {
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [selectedGradeId, setSelectedGradeId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleStudentToggle = (studentId: string) => {
    setSelectedStudentIds(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleSelectAll = () => {
    if (selectedStudentIds.length === unassignedStudents.length) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(unassignedStudents.map(s => s.id));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedStudentIds.length === 0) {
      setError("يرجى اختيار طالب واحد على الأقل");
      return;
    }
    
    if (!selectedGradeId) {
      setError("يرجى اختيار المستوى");
      return;
    }

    setLoading(true);
    try {
      await onAssign(selectedStudentIds, selectedGradeId);
      onClose();
      setSelectedStudentIds([]);
      setSelectedGradeId("");
      setError("");
    } catch (error) {
      console.error("Error assigning students:", error);
      setError("حدث خطأ أثناء تسجيل الطلاب");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="تسجيل متعدد للطلاب"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            اختر المستوى *
          </label>
          <select
            value={selectedGradeId}
            onChange={(e) => setSelectedGradeId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">اختر المستوى</option>
            {grades.map((grade) => (
              <option key={grade.id} value={grade.id}>
                {grade.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-gray-700">
              اختر الطلاب ({selectedStudentIds.length} من {unassignedStudents.length})
            </label>
            <button
              type="button"
              onClick={handleSelectAll}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              {selectedStudentIds.length === unassignedStudents.length ? "إلغاء الكل" : "اختيار الكل"}
            </button>
          </div>
          
          <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
            {unassignedStudents.map((student) => (
              <label
                key={student.id}
                className="flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
              >
                <input
                  type="checkbox"
                  checked={selectedStudentIds.includes(student.id)}
                  onChange={() => handleStudentToggle(student.id)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <div className="mr-3 flex-1">
                  <div className="font-medium text-gray-900">{student.name}</div>
                  <div className="text-sm text-gray-600">{student.email}</div>
                  {student.age && (
                    <div className="text-xs text-gray-500">العمر: {student.age} سنة</div>
                  )}
                </div>
              </label>
            ))}
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <div className="flex items-center justify-end space-x-3 space-x-reverse pt-4 border-t">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            disabled={loading}
          >
            إلغاء
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            disabled={loading || selectedStudentIds.length === 0}
          >
            {loading ? "جاري التسجيل..." : `تسجيل ${selectedStudentIds.length} طالب`}
          </button>
        </div>
      </form>
    </Modal>
  );
}