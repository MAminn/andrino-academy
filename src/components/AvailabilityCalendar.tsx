/**
 * AvailabilityCalendar Component
 * Andrino Academy - Instructor Availability Management
 *
 * Features:
 * - Grid UI (7 days × 10 hours: 13:00-22:00)
 * - Click/drag selection for time slots
 * - Track selector dropdown
 * - Visual states: available, selected, booked, confirmed
 * - Confirm button to lock weekly availability
 * - Integrates with instructor availability APIs
 */

"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Calendar, Check, Lock, AlertCircle, Loader2 } from "lucide-react";

// Types
interface InstructorAvailability {
  id: string;
  instructorId: string;
  trackId: string;
  weekStartDate: string;
  dayOfWeek: number; // 0=Sunday, 6=Saturday
  startHour: number; // 13-22
  endHour: number; // 13-22
  isBooked: boolean;
  isConfirmed: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

interface Track {
  id: string;
  name: string;
  gradeName?: string;
}

interface TimeSlot {
  day: number; // 0-6
  hour: number; // 13-22
  isSelected: boolean;
  isBooked: boolean;
  isConfirmed: boolean;
  availabilityId?: string;
}

interface AvailabilityCalendarProps {
  instructorId: string;
  onSlotsUpdated?: () => void;
}

const DAYS = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
const HOURS = Array.from({ length: 10 }, (_, i) => i + 13); // 13-22
const HOUR_LABELS = HOURS.map(h => `${h}:00`);

export default function AvailabilityCalendar({
  instructorId,
  onSlotsUpdated,
}: AvailabilityCalendarProps) {
  // State
  const [tracks, setTracks] = useState<Track[]>([]);
  const [selectedTrackId, setSelectedTrackId] = useState<string>("");
  const [weekStartDate, setWeekStartDate] = useState<string>("");
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [dragMode, setDragMode] = useState<"select" | "deselect">("select");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [weekStartDay, setWeekStartDay] = useState<number>(0); // Default Sunday

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
    const daysToSubtract = (currentDay - weekStartDay + 7) % 7;
    d.setDate(d.getDate() - daysToSubtract);
    d.setHours(0, 0, 0, 0);
    return d.toISOString().split("T")[0];
  };

  // Helper: Get slot key
  const getSlotKey = (day: number, hour: number): string => {
    return `${day}-${hour}`;
  };

  // Helper: Find slot
  const findSlot = (day: number, hour: number): TimeSlot | undefined => {
    return slots.find(s => s.day === day && s.hour === hour);
  };

  // Initialize week start date after schedule settings are loaded
  useEffect(() => {
    if (weekStartDay !== null && !weekStartDate) {
      setWeekStartDate(getWeekStartDate(new Date()));
    }
  }, [weekStartDay, weekStartDate]);

  // Fetch instructor's tracks
  useEffect(() => {
    const fetchTracks = async () => {
      try {
        const response = await fetch("/api/tracks");
        if (!response.ok) throw new Error("Failed to fetch tracks");
        
        const responseData = await response.json();
        const data = responseData.data || responseData;
        const instructorTracks = data.filter((t: Track & { instructorId: string }) => t.instructorId === instructorId);
        
        setTracks(instructorTracks);
        
        // Auto-select first track
        if (instructorTracks.length > 0 && !selectedTrackId) {
          setSelectedTrackId(instructorTracks[0].id);
        }
      } catch (err) {
        console.error("Error fetching tracks:", err);
        setError("فشل تحميل المسارات");
      }
    };

    if (instructorId) {
      fetchTracks();
    }
  }, [instructorId, selectedTrackId]);

  // Fetch existing availability
  useEffect(() => {
    const fetchAvailability = async () => {
      if (!selectedTrackId || !weekStartDate) return;

      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          trackId: selectedTrackId,
          weekStartDate: weekStartDate,
        });

        const response = await fetch(`/api/instructor/availability?${params}`);
        if (!response.ok) throw new Error("Failed to fetch availability");

        const { availability: data } = await response.json();

        // Convert API data to TimeSlot format
        const newSlots: TimeSlot[] = [];

        // Initialize all slots as unselected
        DAYS.forEach((_, day) => {
          HOURS.forEach(hour => {
            newSlots.push({
              day,
              hour,
              isSelected: false,
              isBooked: false,
              isConfirmed: false,
            });
          });
        });

        // Mark slots based on fetched data
        data.forEach((availability: InstructorAvailability) => {
          for (let hour = availability.startHour; hour < availability.endHour; hour++) {
            const slotIndex = newSlots.findIndex(
              s => s.day === availability.dayOfWeek && s.hour === hour
            );
            if (slotIndex !== -1) {
              newSlots[slotIndex] = {
                day: availability.dayOfWeek,
                hour,
                isSelected: true,
                isBooked: availability.isBooked,
                isConfirmed: availability.isConfirmed,
                availabilityId: availability.id,
              };
            }
          }
        });

        setSlots(newSlots);
      } catch (err) {
        console.error("Error fetching availability:", err);
        setError("فشل تحميل جدول التوافر");
      } finally {
        setLoading(false);
      }
    };

    fetchAvailability();
  }, [selectedTrackId, weekStartDate]);

  // Handle slot click
  const handleSlotClick = (day: number, hour: number) => {
    const slot = findSlot(day, hour);
    if (!slot || slot.isConfirmed) return; // Cannot edit confirmed slots

    const newIsSelected = !slot.isSelected;
    
    setSlots(prev =>
      prev.map(s =>
        s.day === day && s.hour === hour
          ? { ...s, isSelected: newIsSelected }
          : s
      )
    );
  };

  // Handle drag start
  const handleDragStart = (day: number, hour: number) => {
    const slot = findSlot(day, hour);
    if (!slot || slot.isConfirmed) return;

    setIsDragging(true);
    setDragMode(slot.isSelected ? "deselect" : "select");
    handleSlotClick(day, hour);
  };

  // Handle drag over
  const handleDragOver = (day: number, hour: number) => {
    if (!isDragging) return;

    const slot = findSlot(day, hour);
    if (!slot || slot.isConfirmed) return;

    const shouldSelect = dragMode === "select";
    if (slot.isSelected !== shouldSelect) {
      setSlots(prev =>
        prev.map(s =>
          s.day === day && s.hour === hour
            ? { ...s, isSelected: shouldSelect }
            : s
        )
      );
    }
  };

  // Handle drag end
  const handleDragEnd = () => {
    setIsDragging(false);
  };

  // Save availability
  const handleSave = async () => {
    if (!selectedTrackId || !weekStartDate) {
      setError("الرجاء اختيار مسار وتاريخ");
      return;
    }

    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Group selected slots by day and consecutive hours
      const selectedSlots = slots.filter(s => s.isSelected && !s.isConfirmed);
      
      if (selectedSlots.length === 0) {
        setError("الرجاء اختيار على الأقل فترة زمنية واحدة");
        setSaving(false);
        return;
      }
      
      // Create availability slots (one per hour selected)
      const slotsData = selectedSlots.map(slot => ({
        dayOfWeek: slot.day,
        startHour: slot.hour,
        endHour: slot.hour + 1, // Each slot is 1 hour
      }));

      const response = await fetch("/api/instructor/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trackId: selectedTrackId,
          weekStartDate,
          slots: slotsData,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save availability");
      }

      setSuccessMessage("تم حفظ جدول التوافر بنجاح");
      
      // Reload availability
      const params = new URLSearchParams({
        trackId: selectedTrackId,
        weekStartDate,
      });
      const reloadResponse = await fetch(`/api/instructor/availability?${params}`);
      if (reloadResponse.ok) {
        const { availability: data } = await reloadResponse.json();
        
        // Update slots with new data
        const newSlots = slots.map(slot => {
          const matchingAvailability = data.find(
            (a: InstructorAvailability) => a.dayOfWeek === slot.day && 
                 slot.hour >= a.startHour && 
                 slot.hour < a.endHour
          );
          
          if (matchingAvailability) {
            return {
              ...slot,
              availabilityId: matchingAvailability.id,
              isConfirmed: matchingAvailability.isConfirmed,
              isBooked: matchingAvailability.isBooked,
            };
          }
          
          return slot;
        });
        
        setSlots(newSlots);
      }

      if (onSlotsUpdated) {
        onSlotsUpdated();
      }
    } catch (err) {
      console.error("Error saving availability:", err);
      setError(err instanceof Error ? err.message : "فشل حفظ جدول التوافر");
    } finally {
      setSaving(false);
    }
  };

  // Confirm availability (lock slots)
  const handleConfirm = async () => {
    if (!selectedTrackId || !weekStartDate) {
      setError("الرجاء اختيار مسار وتاريخ");
      return;
    }

    const hasUnconfirmedSlots = slots.some(s => s.isSelected && !s.isConfirmed);
    if (!hasUnconfirmedSlots) {
      setError("جميع الفترات مؤكدة بالفعل");
      return;
    }

    setConfirming(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch("/api/instructor/availability/confirm", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trackId: selectedTrackId,
          weekStartDate,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to confirm availability");
      }

      const result = await response.json();
      setSuccessMessage(`تم تأكيد ${result.confirmedCount} فترة زمنية - لا يمكن التعديل الآن`);

      // Reload availability
      const params = new URLSearchParams({
        trackId: selectedTrackId,
        weekStartDate,
      });
      const reloadResponse = await fetch(`/api/instructor/availability?${params}`);
      if (reloadResponse.ok) {
        const { availability: data } = await reloadResponse.json();
        
        const newSlots = slots.map(slot => {
          const matchingAvailability = data.find(
            (a: InstructorAvailability) => a.dayOfWeek === slot.day && 
                 slot.hour >= a.startHour && 
                 slot.hour < a.endHour
          );
          
          if (matchingAvailability) {
            return {
              ...slot,
              isConfirmed: matchingAvailability.isConfirmed,
              isBooked: matchingAvailability.isBooked,
            };
          }
          
          return slot;
        });
        
        setSlots(newSlots);
      }

      if (onSlotsUpdated) {
        onSlotsUpdated();
      }
    } catch (err) {
      console.error("Error confirming availability:", err);
      setError(err instanceof Error ? err.message : "فشل تأكيد جدول التوافر");
    } finally {
      setConfirming(false);
    }
  };

  // Handle week navigation
  const navigateWeek = (direction: "prev" | "next") => {
    const currentDate = new Date(weekStartDate);
    const daysToAdd = direction === "next" ? 7 : -7;
    currentDate.setDate(currentDate.getDate() + daysToAdd);
    setWeekStartDate(getWeekStartDate(currentDate));
  };

  // Get slot CSS classes
  const getSlotClasses = (slot: TimeSlot | undefined): string => {
    if (!slot) return "bg-gray-50 cursor-not-allowed";

    const baseClasses = "border transition-all duration-150";
    
    if (slot.isConfirmed) {
      if (slot.isBooked) {
        return `${baseClasses} bg-red-100 border-red-300 cursor-not-allowed`;
      }
      return `${baseClasses} bg-green-100 border-green-300 cursor-not-allowed`;
    }

    if (slot.isSelected) {
      return `${baseClasses} bg-blue-100 border-blue-400 cursor-pointer hover:bg-blue-200`;
    }

    return `${baseClasses} bg-white border-gray-200 cursor-pointer hover:bg-gray-50`;
  };

  // Check if any slots are confirmed
  const hasConfirmedSlots = slots.some(s => s.isConfirmed);
  const hasSelectedSlots = slots.some(s => s.isSelected);

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-3 mb-4">
          <Calendar className="h-6 w-6 text-[#7e5b3f]" />
          <h2 className="text-2xl font-bold text-gray-900">جدول التوافر الأسبوعي</h2>
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
        <div className="flex items-center justify-between gap-4 mb-4">
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

        {/* Legend */}
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-white border-2 border-gray-200 rounded"></div>
            <span>متاح للاختيار</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-100 border-2 border-blue-400 rounded"></div>
            <span>محدد (غير مؤكد)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-green-100 border-2 border-green-300 rounded"></div>
            <span>مؤكد ومتاح</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-red-100 border-2 border-red-300 rounded"></div>
            <span>محجوز</span>
          </div>
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
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <Check className="h-5 w-5" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Calendar Grid */}
      <div className="bg-white rounded-lg shadow-md p-6 overflow-x-auto">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-[#7e5b3f]" />
          </div>
        ) : !selectedTrackId ? (
          <div className="text-center py-20 text-gray-500">
            الرجاء اختيار مسار لعرض جدول التوافر
          </div>
        ) : (
          <div className="grid grid-cols-8 gap-1 min-w-[800px]">
            {/* Header Row */}
            <div className="bg-[#7e5b3f] text-white font-semibold p-3 rounded-tl-lg text-center">
              الوقت / اليوم
            </div>
            {DAYS.map((day, idx) => (
              <div
                key={day}
                className={`bg-[#7e5b3f] text-white font-semibold p-3 text-center ${
                  idx === 6 ? "rounded-tr-lg" : ""
                }`}
              >
                {day}
              </div>
            ))}

            {/* Time Slots */}
            {HOURS.map((hour, hourIdx) => (
              <React.Fragment key={`hour-row-${hour}`}>
                {/* Hour Label */}
                <div
                  className={`bg-gray-100 font-medium p-3 text-center flex items-center justify-center ${
                    hourIdx === HOURS.length - 1 ? "rounded-bl-lg" : ""
                  }`}
                >
                  {hour}:00
                </div>

                {/* Day Slots for this hour */}
                {DAYS.map((_, day) => {
                  const slot = findSlot(day, hour);
                  return (
                    <div
                      key={`${day}-${hour}`}
                      className={`${getSlotClasses(slot)} p-3 flex items-center justify-center min-h-[60px] ${
                        hourIdx === HOURS.length - 1 && day === 6 ? "rounded-br-lg" : ""
                      }`}
                      onClick={() => handleSlotClick(day, hour)}
                      onMouseDown={() => handleDragStart(day, hour)}
                      onMouseEnter={() => handleDragOver(day, hour)}
                      onMouseUp={handleDragEnd}
                    >
                      {slot?.isConfirmed && <Lock className="h-4 w-4 text-gray-600" />}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-end">
        <button
          onClick={handleSave}
          disabled={!hasSelectedSlots || saving || loading}
          className="px-6 py-3 bg-[#7e5b3f] hover:bg-[#6a4d35] text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {saving ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              جاري الحفظ...
            </>
          ) : (
            <>
              <Check className="h-5 w-5" />
              حفظ التوافر
            </>
          )}
        </button>

        <button
          onClick={handleConfirm}
          disabled={hasConfirmedSlots || !hasSelectedSlots || confirming || loading}
          className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {confirming ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              جاري التأكيد...
            </>
          ) : (
            <>
              <Lock className="h-5 w-5" />
              تأكيد التوافر (قفل)
            </>
          )}
        </button>
      </div>

      {hasConfirmedSlots && (
        <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-lg">
          ⚠️ تم تأكيد بعض الفترات الزمنية. لا يمكن التعديل على الفترات المؤكدة.
        </div>
      )}
    </div>
  );
}
