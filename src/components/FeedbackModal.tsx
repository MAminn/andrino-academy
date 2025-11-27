"use client";

import { useState } from "react";
import { X, MessageSquare, Star, Loader2 } from "lucide-react";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingData: {
    id: string;
    track: {
      name: string;
    };
    availability: {
      startHour: number;
      endHour: number;
      dayOfWeek: number;
    };
    student?: {
      name: string;
    };
    instructor?: {
      name: string;
    };
  } | null;
  userRole: "instructor" | "student";
  onSuccess?: () => void;
}

const DAY_NAMES = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

export default function FeedbackModal({
  isOpen,
  onClose,
  bookingData,
  userRole,
  onSuccess,
}: FeedbackModalProps) {
  const [rating, setRating] = useState<number>(0);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !bookingData) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const response = await fetch("/api/sessions/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: bookingData.id,
          rating,
          notes,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to submit feedback");
      }

      const data = await response.json();
      alert(data.message || "تم إرسال التقييم بنجاح");
      
      if (onSuccess) {
        onSuccess();
      }

      // Reset and close
      setRating(0);
      setNotes("");
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <MessageSquare className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                تقييم الجلسة
              </h2>
              <p className="text-sm text-gray-600">
                {userRole === "instructor"
                  ? "كيف كانت الجلسة مع الطالب؟"
                  : "كيف كانت الجلسة مع المدرب؟"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Session Info */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <h3 className="font-semibold text-gray-900">معلومات الجلسة</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">المسار:</span>
                <span className="font-medium text-gray-900 mr-2">
                  {bookingData.track.name}
                </span>
              </div>
              {userRole === "instructor" && bookingData.student && (
                <div>
                  <span className="text-gray-600">الطالب:</span>
                  <span className="font-medium text-gray-900 mr-2">
                    {bookingData.student.name}
                  </span>
                </div>
              )}
              {userRole === "student" && bookingData.instructor && (
                <div>
                  <span className="text-gray-600">المدرب:</span>
                  <span className="font-medium text-gray-900 mr-2">
                    {bookingData.instructor.name}
                  </span>
                </div>
              )}
              <div>
                <span className="text-gray-600">اليوم:</span>
                <span className="font-medium text-gray-900 mr-2">
                  {DAY_NAMES[bookingData.availability.dayOfWeek]}
                </span>
              </div>
              <div>
                <span className="text-gray-600">الوقت:</span>
                <span className="font-medium text-gray-900 mr-2">
                  {bookingData.availability.startHour}:00 -{" "}
                  {bookingData.availability.endHour}:00
                </span>
              </div>
            </div>
          </div>

          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              التقييم <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2 justify-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="p-2 hover:scale-110 transition-transform"
                >
                  <Star
                    className={`w-10 h-10 ${
                      star <= rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-center text-sm text-gray-600 mt-2">
                {rating === 5 && "ممتاز جداً! 🌟"}
                {rating === 4 && "جيد جداً! 👍"}
                {rating === 3 && "جيد"}
                {rating === 2 && "مقبول"}
                {rating === 1 && "يحتاج تحسين"}
              </p>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ملاحظات وتعليقات (اختياري)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={
                userRole === "instructor"
                  ? "ملاحظات عن أداء الطالب، نقاط القوة والضعف..."
                  : "ملاحظاتك عن الجلسة، ما أعجبك وما تود تحسينه..."
              }
              rows={5}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              ملاحظاتك ستساعدنا في تحسين تجربة التعلم
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={submitting || rating === 0}
              className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  جاري الإرسال...
                </>
              ) : (
                <>
                  <MessageSquare className="w-4 h-4" />
                  إرسال التقييم
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
