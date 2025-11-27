"use client";

import { useState } from "react";
import { X, Video, Link, Loader2 } from "lucide-react";

interface MeetingLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionData: {
    id: string;
    availabilityId?: string;
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
  } | null;
  mode: "single" | "bulk"; // single = one booking, bulk = all bookings for time slot
  onSuccess?: () => void;
}

const DAY_NAMES = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

export default function MeetingLinkModal({
  isOpen,
  onClose,
  sessionData,
  mode,
  onSuccess,
}: MeetingLinkModalProps) {
  const [meetingLink, setMeetingLink] = useState("");
  const [title, setTitle] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !sessionData) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      // Validate URL
      try {
        new URL(meetingLink);
      } catch {
        setError("الرجاء إدخال رابط صحيح");
        setSubmitting(false);
        return;
      }

      const endpoint = "/api/sessions/meeting-link";
      const method = mode === "single" ? "POST" : "PUT";
      const body = mode === "single"
        ? { bookingId: sessionData.id, meetingLink, title }
        : { availabilityId: sessionData.availabilityId, meetingLink, title };

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to add meeting link");
      }

      const data = await response.json();
      
      // Show success message
      alert(data.message || "تم إضافة رابط الاجتماع بنجاح");
      
      if (onSuccess) {
        onSuccess();
      }
      
      // Reset and close
      setMeetingLink("");
      setTitle("");
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
            <div className="p-2 bg-blue-100 rounded-lg">
              <Video className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                إضافة رابط الاجتماع
              </h2>
              <p className="text-sm text-gray-600">
                {mode === "bulk"
                  ? "سيتم إرسال الرابط لجميع الطلاب المسجلين في هذا الوقت"
                  : "سيتم إرسال الرابط للطالب"}
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
                  {sessionData.track.name}
                </span>
              </div>
              {mode === "single" && sessionData.student && (
                <div>
                  <span className="text-gray-600">الطالب:</span>
                  <span className="font-medium text-gray-900 mr-2">
                    {sessionData.student.name}
                  </span>
                </div>
              )}
              <div>
                <span className="text-gray-600">اليوم:</span>
                <span className="font-medium text-gray-900 mr-2">
                  {DAY_NAMES[sessionData.availability.dayOfWeek]}
                </span>
              </div>
              <div>
                <span className="text-gray-600">الوقت:</span>
                <span className="font-medium text-gray-900 mr-2">
                  {sessionData.availability.startHour}:00 -{" "}
                  {sessionData.availability.endHour}:00
                </span>
              </div>
            </div>
          </div>

          {/* Title Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              عنوان الجلسة (اختياري)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: شرح الدرس الأول"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Meeting Link Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              رابط الاجتماع <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Link className="absolute right-3 top-3 text-gray-400 w-5 h-5" />
              <input
                type="url"
                value={meetingLink}
                onChange={(e) => setMeetingLink(e.target.value)}
                placeholder="https://zoom.us/j/... أو https://meet.google.com/..."
                required
                className="w-full pr-10 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              أدخل رابط Zoom أو Google Meet أو أي منصة اجتماعات أخرى
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
              disabled={submitting || !meetingLink}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  جاري الإضافة...
                </>
              ) : (
                <>
                  <Video className="w-4 h-4" />
                  إضافة الرابط
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
