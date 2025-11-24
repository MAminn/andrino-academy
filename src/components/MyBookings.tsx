/**
 * MyBookings Component
 * Andrino Academy - Student Bookings Management
 *
 * Features:
 * - List all student bookings
 * - Display booking details (instructor, track, time)
 * - Show session status
 * - Edit student notes
 * - Cancel bookings (if no session created)
 * - Filter by status
 */

"use client";

import { useState, useEffect } from "react";
import { Calendar, Clock, User, BookOpen, MessageSquare, X, Loader2, AlertCircle, ExternalLink } from "lucide-react";

// Types
interface SessionBooking {
  id: string;
  studentId: string;
  availabilityId: string;
  sessionId: string | null;
  status: string;
  studentNotes: string | null;
  instructorNotes: string | null;
  createdAt: string;
  availability: {
    id: string;
    weekStartDate: string;
    dayOfWeek: number;
    startHour: number;
    endHour: number;
    instructor: {
      id: string;
      name: string;
      email: string;
    };
    track: {
      id: string;
      name: string;
      gradeName?: string;
    };
  };
  session?: {
    id: string;
    title: string;
    status: string;
    externalLink: string | null;
    scheduledAt: string | null;
  };
}

interface MyBookingsProps {
  studentId: string;
  onBookingUpdated?: () => void;
}

const DAYS = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

export default function MyBookings({
  studentId,
  onBookingUpdated,
}: MyBookingsProps) {
  // State
  const [bookings, setBookings] = useState<SessionBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [notesValue, setNotesValue] = useState<string>("");
  const [savingNotes, setSavingNotes] = useState(false);
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Helper: Format date display
  const formatDate = (dateStr: string, dayOfWeek: number): string => {
    const date = new Date(dateStr);
    date.setDate(date.getDate() + dayOfWeek);
    return date.toLocaleDateString("ar-EG", { 
      weekday: "long",
      year: "numeric", 
      month: "long", 
      day: "numeric" 
    });
  };

  // Helper: Get booking status badge
  const getStatusBadge = (booking: SessionBooking): { text: string; color: string } => {
    if (booking.session) {
      const sessionStatus = booking.session.status;
      switch (sessionStatus) {
        case "ACTIVE":
          return { text: "جلسة نشطة", color: "bg-green-100 text-green-800 border-green-300" };
        case "COMPLETED":
          return { text: "مكتملة", color: "bg-gray-100 text-gray-800 border-gray-300" };
        case "SCHEDULED":
          return { text: "مجدولة", color: "bg-blue-100 text-blue-800 border-blue-300" };
        default:
          return { text: sessionStatus, color: "bg-gray-100 text-gray-800 border-gray-300" };
      }
    }
    return { text: "محجوزة", color: "bg-yellow-100 text-yellow-800 border-yellow-300" };
  };

  // Fetch bookings
  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      setError(null);

      try {
        // Get student's track first
        const studentResponse = await fetch(`/api/users/${studentId}`);
        if (!studentResponse.ok) throw new Error("Failed to fetch student data");
        
        const studentData = await studentResponse.json();
        
        if (!studentData.trackId) {
          setBookings([]);
          setLoading(false);
          return;
        }

        // Fetch bookings via student/book-session endpoint (it handles fetching)
        // Since there's no dedicated GET endpoint for student bookings in the API,
        // we'll use the instructor bookings endpoint with proper filtering
        const response = await fetch(`/api/instructor/bookings?trackId=${studentData.trackId}`);
        
        if (!response.ok) throw new Error("Failed to fetch bookings");

        const allBookings: SessionBooking[] = await response.json();
        
        // Filter to only this student's bookings
        const studentBookings = allBookings.filter(b => b.studentId === studentId);
        
        setBookings(studentBookings);
      } catch (err) {
        console.error("Error fetching bookings:", err);
        setError("فشل تحميل الحجوزات");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [studentId]);

  // Handle edit notes
  const handleEditNotes = (bookingId: string, currentNotes: string | null) => {
    setEditingNotes(bookingId);
    setNotesValue(currentNotes || "");
    setError(null);
    setSuccessMessage(null);
  };

  // Handle save notes
  const handleSaveNotes = async (bookingId: string) => {
    setSavingNotes(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch(`/api/bookings/${bookingId}/notes`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentNotes: notesValue,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update notes");
      }

      // Update local state
      setBookings(prev =>
        prev.map(b =>
          b.id === bookingId ? { ...b, studentNotes: notesValue } : b
        )
      );

      setSuccessMessage("تم حفظ الملاحظات بنجاح");
      setEditingNotes(null);

      if (onBookingUpdated) {
        onBookingUpdated();
      }
    } catch (err) {
      console.error("Error saving notes:", err);
      setError(err instanceof Error ? err.message : "فشل حفظ الملاحظات");
    } finally {
      setSavingNotes(false);
    }
  };

  // Handle cancel booking
  const handleCancelBooking = async (bookingId: string, hasSession: boolean) => {
    if (hasSession) {
      setError("لا يمكن إلغاء الحجز بعد إنشاء الجلسة");
      return;
    }

    if (!confirm("هل أنت متأكد من إلغاء هذا الحجز؟")) {
      return;
    }

    setCancelling(bookingId);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch(`/api/student/book-session?bookingId=${bookingId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to cancel booking");
      }

      // Remove from local state
      setBookings(prev => prev.filter(b => b.id !== bookingId));
      setSuccessMessage("تم إلغاء الحجز بنجاح");

      if (onBookingUpdated) {
        onBookingUpdated();
      }
    } catch (err) {
      console.error("Error cancelling booking:", err);
      setError(err instanceof Error ? err.message : "فشل إلغاء الحجز");
    } finally {
      setCancelling(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-3">
          <BookOpen className="h-6 w-6 text-[#7e5b3f]" />
          <h2 className="text-2xl font-bold text-gray-900">حجوزاتي</h2>
        </div>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {successMessage}
        </div>
      )}

      {/* Bookings List */}
      {loading ? (
        <div className="bg-white rounded-lg shadow-md p-12 flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#7e5b3f]" />
        </div>
      ) : bookings.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">ليس لديك أي حجوزات حالياً</p>
          <p className="text-gray-500 text-sm mt-2">ابدأ بحجز جلسة من قسم "الجلسات المتاحة"</p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map(booking => {
            const status = getStatusBadge(booking);
            const canCancel = !booking.session;
            
            return (
              <div
                key={booking.id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                {/* Header with Status */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="h-5 w-5 text-[#7e5b3f]" />
                      <h3 className="text-xl font-bold text-gray-900">
                        {booking.availability.instructor.name}
                      </h3>
                    </div>
                    <p className="text-sm text-gray-600 flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      {booking.availability.track.name}
                      {booking.availability.track.gradeName && ` - ${booking.availability.track.gradeName}`}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${status.color}`}>
                    {status.text}
                  </span>
                </div>

                {/* Booking Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-gray-600" />
                    <div>
                      <p className="text-sm text-gray-600">التاريخ</p>
                      <p className="font-semibold text-gray-900">
                        {DAYS[booking.availability.dayOfWeek]} - {formatDate(booking.availability.weekStartDate, booking.availability.dayOfWeek)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-gray-600" />
                    <div>
                      <p className="text-sm text-gray-600">الوقت</p>
                      <p className="font-semibold text-gray-900">
                        {booking.availability.startHour}:00 - {booking.availability.endHour}:00
                      </p>
                    </div>
                  </div>
                </div>

                {/* Session Link (if exists) */}
                {booking.session?.externalLink && (
                  <div className="mb-4">
                    <a
                      href={booking.session.externalLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      <ExternalLink className="h-4 w-4" />
                      انضم إلى الجلسة
                    </a>
                  </div>
                )}

                {/* Notes Section */}
                <div className="space-y-3">
                  {/* Student Notes */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-gray-600" />
                        <span className="text-sm font-medium text-gray-700">ملاحظاتي</span>
                      </div>
                      {editingNotes !== booking.id && (
                        <button
                          onClick={() => handleEditNotes(booking.id, booking.studentNotes)}
                          className="text-sm text-[#7e5b3f] hover:text-[#6a4d35]"
                        >
                          تعديل
                        </button>
                      )}
                    </div>
                    
                    {editingNotes === booking.id ? (
                      <div className="space-y-2">
                        <textarea
                          value={notesValue}
                          onChange={(e) => setNotesValue(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7e5b3f] focus:border-transparent"
                          rows={3}
                          placeholder="أضف ملاحظاتك هنا..."
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSaveNotes(booking.id)}
                            disabled={savingNotes}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition-colors disabled:opacity-50"
                          >
                            {savingNotes ? "جاري الحفظ..." : "حفظ"}
                          </button>
                          <button
                            onClick={() => setEditingNotes(null)}
                            disabled={savingNotes}
                            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm transition-colors"
                          >
                            إلغاء
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-600">
                        {booking.studentNotes || "لا توجد ملاحظات"}
                      </p>
                    )}
                  </div>

                  {/* Instructor Notes (read-only) */}
                  {booking.instructorNotes && (
                    <div className="border border-blue-200 bg-blue-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <MessageSquare className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-900">ملاحظات المدرس</span>
                      </div>
                      <p className="text-sm text-blue-800">{booking.instructorNotes}</p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="mt-4 flex gap-2 justify-end">
                  {canCancel && (
                    <button
                      onClick={() => handleCancelBooking(booking.id, !!booking.session)}
                      disabled={cancelling === booking.id}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      {cancelling === booking.id ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          جاري الإلغاء...
                        </>
                      ) : (
                        <>
                          <X className="h-4 w-4" />
                          إلغاء الحجز
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
