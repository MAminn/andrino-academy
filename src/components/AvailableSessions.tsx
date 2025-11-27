/**
 * AvailableSessions Component
 * Andrino Academy - Student Booking Interface
 *
 * Features:
 * - View available instructor slots by track
 * - Week navigation
 * - Grid display by instructor and time
 * - Book button for each slot
 * - Real-time availability updates
 */

"use client";

import { useState, useEffect } from "react";
import { Calendar, Clock, User, CheckCircle, Loader2 } from "lucide-react";

// Types
interface InstructorAvailability {
  id: string;
  instructorId: string;
  trackId: string;
  weekStartDate: string;
  dayOfWeek: number; // 0=Sunday, 6=Saturday
  startHour: number;
  endHour: number;
  isBooked: boolean;
  isConfirmed: boolean;
  instructor: {
    id: string;
    name: string;
    email: string;
  };
}

interface Track {
  id: string;
  name: string;
  gradeName?: string;
}

interface AvailableSessionsProps {
  studentId: string;
  onBookingCreated?: () => void;
}

const DAYS = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

export default function AvailableSessions({
  studentId,
  onBookingCreated,
}: AvailableSessionsProps) {
  // State
  const [tracks, setTracks] = useState<Track[]>([]);
  const [selectedTrackId, setSelectedTrackId] = useState<string>("");
  const [weekStartDate, setWeekStartDate] = useState<string>("");
  const [availableSlots, setAvailableSlots] = useState<InstructorAvailability[]>([]);
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState<string | null>(null); // availabilityId being booked
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [weekStartDay, setWeekStartDay] = useState<number | null>(null); // From schedule settings

  // Fetch schedule settings
  useEffect(() => {
    const fetchScheduleSettings = async () => {
      try {
        const response = await fetch("/api/settings/schedule");
        if (response.ok) {
          const data = await response.json();
          setWeekStartDay(data.settings?.weekResetDay ?? 0);
        }
      } catch (err) {
        console.error("Error fetching schedule settings:", err);
      }
    };
    fetchScheduleSettings();
  }, []);

  // Helper: Get week start date (based on schedule settings)
  const getWeekStartDate = (date: Date): string => {
    const d = new Date(date);
    const currentDay = d.getDay();
    const daysToSubtract = (currentDay - (weekStartDay ?? 0) + 7) % 7;
    d.setDate(d.getDate() - daysToSubtract);
    d.setHours(0, 0, 0, 0);
    
    // Format as YYYY-MM-DD in local time (not UTC) to avoid timezone issues
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Helper: Format date display
  const formatDate = (dateStr: string, dayOfWeek: number): string => {
    const date = new Date(dateStr);
    date.setDate(date.getDate() + dayOfWeek);
    return date.toLocaleDateString("ar-EG", { month: "short", day: "numeric" });
  };

  // Initialize week start date after schedule settings are loaded
  useEffect(() => {
    if (weekStartDay !== null && !weekStartDate) {
      setWeekStartDate(getWeekStartDate(new Date()));
    }
  }, [weekStartDay]);

  // Fetch all tracks
  useEffect(() => {
    const fetchTracks = async () => {
      try {
        const response = await fetch("/api/tracks");
        if (!response.ok) throw new Error("Failed to fetch tracks");
        
        const responseData = await response.json();
        const tracksData = responseData.data || responseData;
        setTracks(tracksData);
        
        // Auto-select first track
        if (tracksData.length > 0 && !selectedTrackId) {
          setSelectedTrackId(tracksData[0].id);
        }
      } catch (err) {
        console.error("Error fetching tracks:", err);
        setError("فشل تحميل المسارات");
      }
    };

    fetchTracks();
  }, [selectedTrackId]);

  // Fetch available slots
  useEffect(() => {
    const fetchAvailableSlots = async () => {
      if (!selectedTrackId || !weekStartDate) return;

      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          trackId: selectedTrackId,
          weekStartDate: weekStartDate,
        });

        const response = await fetch(`/api/student/available-slots?${params}`);
        if (!response.ok) throw new Error("Failed to fetch available slots");

        const data = await response.json();
        setAvailableSlots(data.availableSlots || []);
      } catch (err) {
        console.error("Error fetching available slots:", err);
        setError("فشل تحميل الجلسات المتاحة");
      } finally {
        setLoading(false);
      }
    };

    fetchAvailableSlots();
  }, [selectedTrackId, weekStartDate]);

  // Handle booking
  const handleBook = async (availabilityId: string) => {
    setBooking(availabilityId);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch("/api/student/book-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId,
          availabilityId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to book session");
      }

      const result = await response.json();
      setSuccessMessage("تم حجز الجلسة بنجاح! يمكنك مراجعة حجوزاتك في قسم 'حجوزاتي'");

      // Remove the booked slot from available slots
      setAvailableSlots(prev => prev.filter(slot => slot.id !== availabilityId));

      if (onBookingCreated) {
        onBookingCreated();
      }
    } catch (err) {
      console.error("Error booking session:", err);
      setError(err instanceof Error ? err.message : "فشل حجز الجلسة");
    } finally {
      setBooking(null);
    }
  };

  // Handle week navigation
  const navigateWeek = (direction: "prev" | "next") => {
    // Parse the current week start date in local time to avoid timezone issues
    const [year, month, day] = weekStartDate.split('-').map(Number);
    const currentDate = new Date(year, month - 1, day);
    const daysToAdd = direction === "next" ? 7 : -7;
    currentDate.setDate(currentDate.getDate() + daysToAdd);
    setWeekStartDate(getWeekStartDate(currentDate));
  };

  // Group slots by instructor and day
  const groupedSlots = availableSlots.reduce((acc, slot) => {
    const instructorKey = slot.instructor.id;
    if (!acc[instructorKey]) {
      acc[instructorKey] = {
        instructor: slot.instructor,
        slots: [],
      };
    }
    acc[instructorKey].slots.push(slot);
    return acc;
  }, {} as Record<string, { instructor: { id: string; name: string; email: string }; slots: InstructorAvailability[] }>);

  const instructors = Object.values(groupedSlots);

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-3 mb-4">
          <Calendar className="h-6 w-6 text-[#7e5b3f]" />
          <h2 className="text-2xl font-bold text-gray-900">الجلسات المتاحة للحجز</h2>
        </div>

        {/* Track Selector */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            اختر المسار
          </label>
          <select
            value={selectedTrackId}
            onChange={(e) => setSelectedTrackId(e.target.value)}
            className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7e5b3f] focus:border-transparent"
            disabled={loading}
          >
            <option value="">-- اختر مسارًا --</option>
            {tracks.map(track => (
              <option key={track.id} value={track.id}>
                {track.name} {track.gradeName ? `- ${track.gradeName}` : ""}
              </option>
            ))}
          </select>
        </div>

        {/* Week Navigation */}
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={() => navigateWeek("prev")}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            disabled={loading}
          >
            ← الأسبوع السابق
          </button>
          
          <div className="text-center">
            <p className="text-sm text-gray-600">الأسبوع الحالي</p>
            <p className="font-semibold text-gray-900">{weekStartDate}</p>
          </div>

          <button
            onClick={() => navigateWeek("next")}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            disabled={loading}
          >
            الأسبوع التالي →
          </button>
        </div>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <CheckCircle className="h-5 w-5" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Available Slots Display */}
      <div className="space-y-6">
        {loading ? (
          <div className="bg-white rounded-lg shadow-md p-12 flex items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-[#7e5b3f]" />
          </div>
        ) : !selectedTrackId ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center text-gray-500">
            الرجاء اختيار مسار لعرض الجلسات المتاحة
          </div>
        ) : availableSlots.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">لا توجد جلسات متاحة للحجز في هذا الأسبوع</p>
            <p className="text-gray-500 text-sm mt-2">جرب اختيار أسبوع آخر أو مسار مختلف</p>
          </div>
        ) : (
          instructors.map(({ instructor, slots }) => (
            <div key={instructor.id} className="bg-white rounded-lg shadow-md p-6">
              {/* Instructor Header */}
              <div className="flex items-center gap-3 mb-4 pb-4 border-b">
                <div className="p-2 bg-[#7e5b3f] rounded-lg">
                  <User className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{instructor.name}</h3>
                  <p className="text-sm text-gray-600">{instructor.email}</p>
                </div>
              </div>

              {/* Slots Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {slots.map(slot => (
                  <div
                    key={slot.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    {/* Day & Date */}
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-4 w-4 text-[#7e5b3f]" />
                      <div>
                        <p className="font-semibold text-gray-900">{DAYS[slot.dayOfWeek]}</p>
                        <p className="text-xs text-gray-600">
                          {formatDate(slot.weekStartDate, slot.dayOfWeek)}
                        </p>
                      </div>
                    </div>

                    {/* Time */}
                    <div className="flex items-center gap-2 mb-3">
                      <Clock className="h-4 w-4 text-gray-600" />
                      <span className="text-sm text-gray-700">
                        {slot.startHour}:00 - {slot.endHour}:00
                      </span>
                    </div>

                    {/* Book Button */}
                    <button
                      onClick={() => handleBook(slot.id)}
                      disabled={booking === slot.id}
                      className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {booking === slot.id ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          جاري الحجز...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4" />
                          احجز الآن
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>

              {/* Slot Count */}
              <div className="mt-4 text-sm text-gray-600 text-center">
                {slots.length} {slots.length === 1 ? "جلسة متاحة" : "جلسات متاحة"}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
