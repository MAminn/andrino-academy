/**
 * InstructorBookingsList Component
 * Andrino Academy - Instructor View of Student Bookings
 *
 * Features:
 * - List all bookings for instructor
 * - Display student details
 * - View student notes
 * - Add/edit instructor notes
 * - Filter by week
 * - Session status display
 * - Link to session if created
 */

"use client";

import { useState, useEffect } from "react";
import { Calendar, Clock, User, BookOpen, MessageSquare, Loader2, AlertCircle, ExternalLink, Save, Edit2, X } from "lucide-react";

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
  student: {
    id: string;
    name: string;
    email: string;
  };
  availability: {
    id: string;
    weekStartDate: string;
    dayOfWeek: number;
    startHour: number;
    endHour: number;
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

interface InstructorBookingsListProps {
  instructorId: string;
}

const DAYS = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

export default function InstructorBookingsList({
  instructorId,
}: InstructorBookingsListProps) {
  // State
  const [bookings, setBookings] = useState<SessionBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [notesValue, setNotesValue] = useState<string>("");
  const [savingNotes, setSavingNotes] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedWeek, setSelectedWeek] = useState<string>("");
  const [weeks, setWeeks] = useState<string[]>([]);

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
    return { text: "محجوز", color: "bg-yellow-100 text-yellow-800 border-yellow-300" };
  };

  // Fetch bookings
  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch all bookings for this instructor
        const response = await fetch(`/api/instructor/bookings?instructorId=${instructorId}`);
        if (!response.ok) throw new Error("Failed to fetch bookings");

        const { bookings: data } = await response.json();
        setBookings(data as SessionBooking[]);

        // Extract unique weeks
        const uniqueWeeks = Array.from(
          new Set((data as SessionBooking[]).map((b: SessionBooking) => b.availability.weekStartDate))
        ).sort() as string[];
        setWeeks(uniqueWeeks);
        
        // Set most recent week as default
        if (uniqueWeeks.length > 0 && !selectedWeek) {
          setSelectedWeek(uniqueWeeks[uniqueWeeks.length - 1]);
        }
      } catch (err) {
        console.error("Error fetching bookings:", err);
        setError("فشل تحميل الحجوزات");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [instructorId]);

  // Handle edit notes
  const handleEditNotes = (booking: SessionBooking) => {
    setEditingNotes(booking.id);
    setNotesValue(booking.instructorNotes || "");
    setError(null);
    setSuccessMessage(null);
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditingNotes(null);
    setNotesValue("");
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
          instructorNotes: notesValue.trim() || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save notes");
      }

      const updatedBooking: SessionBooking = await response.json();
      
      // Update local state
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? updatedBooking : b))
      );

      setEditingNotes(null);
      setNotesValue("");
      setSuccessMessage("تم حفظ الملاحظات بنجاح");
      
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error("Error saving notes:", err);
      setError(err instanceof Error ? err.message : "فشل حفظ الملاحظات");
    } finally {
      setSavingNotes(false);
    }
  };

  // Filter bookings by selected week
  const filteredBookings = selectedWeek
    ? bookings.filter((b) => b.availability.weekStartDate === selectedWeek)
    : bookings;

  // Group bookings by day
  const groupedByDay = filteredBookings.reduce((acc, booking) => {
    const day = booking.availability.dayOfWeek;
    if (!acc[day]) acc[day] = [];
    acc[day].push(booking);
    return acc;
  }, {} as Record<number, SessionBooking[]>);

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-12 w-12 animate-spin text-[#7e5b3f]" />
      </div>
    );
  }

  // Empty state
  if (bookings.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-12 text-center">
        <Calendar className="h-16 w-16 mx-auto text-gray-400 mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          لا توجد حجوزات حتى الآن
        </h3>
        <p className="text-gray-600">
          عندما يقوم الطلاب بحجز أوقات التوافر الخاصة بك، ستظهر هنا
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Error/Success Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Week Selector */}
      {weeks.length > 1 && (
        <div className="bg-white rounded-lg shadow-md p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            اختر الأسبوع
          </label>
          <select
            value={selectedWeek}
            onChange={(e) => setSelectedWeek(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7e5b3f] focus:border-transparent"
          >
            <option value="">جميع الأسابيع</option>
            {weeks.map((week) => {
              const weekDate = new Date(week);
              return (
                <option key={week} value={week}>
                  {weekDate.toLocaleDateString("ar-EG", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </option>
              );
            })}
          </select>
        </div>
      )}

      {/* Bookings Count */}
      <div className="bg-gradient-to-r from-[#7e5b3f] to-[#c19170] text-white rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">إجمالي الحجوزات</h3>
            <p className="text-white/90">
              {selectedWeek ? "للأسبوع المحدد" : "لجميع الأسابيع"}
            </p>
          </div>
          <div className="text-4xl font-bold">{filteredBookings.length}</div>
        </div>
      </div>

      {/* Bookings by Day */}
      {Object.entries(groupedByDay)
        .sort(([dayA], [dayB]) => Number(dayA) - Number(dayB))
        .map(([dayStr, dayBookings]) => {
          const day = Number(dayStr);
          return (
            <div key={day} className="space-y-4">
              {/* Day Header */}
              <div className="bg-[#7e5b3f] text-white rounded-lg p-3">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  {DAYS[day]} - {formatDate(dayBookings[0].availability.weekStartDate, day)}
                </h3>
              </div>

              {/* Bookings for this day */}
              <div className="grid grid-cols-1 gap-4">
                {dayBookings
                  .sort((a, b) => a.availability.startHour - b.availability.startHour)
                  .map((booking) => {
                    const statusBadge = getStatusBadge(booking);
                    const isEditingThisBooking = editingNotes === booking.id;

                    return (
                      <div
                        key={booking.id}
                        className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow"
                      >
                        {/* Booking Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <User className="h-5 w-5 text-[#7e5b3f]" />
                              <h4 className="text-lg font-semibold text-gray-900">
                                {booking.student.name}
                              </h4>
                            </div>
                            <p className="text-sm text-gray-600">{booking.student.email}</p>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusBadge.color}`}
                          >
                            {statusBadge.text}
                          </span>
                        </div>

                        {/* Booking Details */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-gray-500" />
                            <span className="text-gray-700">
                              {booking.availability.startHour.toString().padStart(2, "0")}:00 -{" "}
                              {booking.availability.endHour.toString().padStart(2, "0")}:00
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4 text-gray-500" />
                            <span className="text-gray-700">{booking.availability.track.name}</span>
                            {booking.availability.track.gradeName && (
                              <span className="text-xs text-gray-500">
                                ({booking.availability.track.gradeName})
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500">
                            حُجز في:{" "}
                            {new Date(booking.createdAt).toLocaleDateString("ar-EG", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        </div>

                        {/* Session Link */}
                        {booking.session?.externalLink && (
                          <div className="mb-4">
                            <a
                              href={booking.session.externalLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
                            >
                              <ExternalLink className="h-4 w-4" />
                              انضم للجلسة: {booking.session.title}
                            </a>
                          </div>
                        )}

                        {/* Student Notes (Read-Only) */}
                        {booking.studentNotes && (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                            <div className="flex items-center gap-2 mb-2">
                              <MessageSquare className="h-4 w-4 text-blue-600" />
                              <span className="text-sm font-semibold text-blue-900">
                                ملاحظات الطالب
                              </span>
                            </div>
                            <p className="text-sm text-blue-800">{booking.studentNotes}</p>
                          </div>
                        )}

                        {/* Instructor Notes (Editable) */}
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <MessageSquare className="h-4 w-4 text-[#7e5b3f]" />
                              <span className="text-sm font-semibold text-gray-900">
                                ملاحظات المدرس
                              </span>
                            </div>
                            {!isEditingThisBooking && (
                              <button
                                onClick={() => handleEditNotes(booking)}
                                className="text-[#7e5b3f] hover:text-[#6a4d35] transition-colors"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>

                          {isEditingThisBooking ? (
                            <div className="space-y-3">
                              <textarea
                                value={notesValue}
                                onChange={(e) => setNotesValue(e.target.value)}
                                placeholder="أضف ملاحظات عن الطالب أو الجلسة..."
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7e5b3f] focus:border-transparent resize-none"
                                disabled={savingNotes}
                              />
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleSaveNotes(booking.id)}
                                  disabled={savingNotes}
                                  className="px-4 py-2 bg-[#7e5b3f] hover:bg-[#6a4d35] text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
                                >
                                  {savingNotes ? (
                                    <>
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                      جاري الحفظ...
                                    </>
                                  ) : (
                                    <>
                                      <Save className="h-4 w-4" />
                                      حفظ
                                    </>
                                  )}
                                </button>
                                <button
                                  onClick={handleCancelEdit}
                                  disabled={savingNotes}
                                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
                                >
                                  <X className="h-4 w-4" />
                                  إلغاء
                                </button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-sm text-gray-700">
                              {booking.instructorNotes || (
                                <span className="text-gray-500 italic">لا توجد ملاحظات</span>
                              )}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          );
        })}

      {/* Empty filtered state */}
      {filteredBookings.length === 0 && bookings.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <Calendar className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            لا توجد حجوزات للأسبوع المحدد
          </h3>
          <p className="text-gray-600">
            اختر أسبوعاً آخر من القائمة أعلاه
          </p>
        </div>
      )}
    </div>
  );
}
