/**
 * Manager Schedule Settings Page
 * Andrino Academy - Configure Availability Reset Schedule
 *
 * Features:
 * - Set week reset day (0-6, Sunday-Saturday)
 * - Set week reset hour (0-23)
 * - Set availability open hours
 * - Manager/CEO only access
 * - Auto-load current settings
 * - Save with validation
 */

"use client";

import { useSession } from "@/lib/auth-client";
import { useEffect, useState } from "react";
import { redirect } from "next/navigation";
import DashboardLayout from "@/app/components/dashboard/DashboardLayout";
import { Calendar, Clock, Settings, Save, Loader2, AlertCircle, CheckCircle, Info } from "lucide-react";

// Types
interface ScheduleSettings {
  id: string;
  weekResetDay: number; // 0-6 (Sunday-Saturday)
  weekResetHour: number; // 0-23
  availabilityOpenHours: number; // Hours before reset when availability opens
  nextOpenDate?: Date | null; // Specific date when calendar opens
  createdAt: Date;
  updatedAt: Date;
}

const DAYS = [
  { value: 0, label: "الأحد" },
  { value: 1, label: "الإثنين" },
  { value: 2, label: "الثلاثاء" },
  { value: 3, label: "الأربعاء" },
  { value: 4, label: "الخميس" },
  { value: 5, label: "الجمعة" },
  { value: 6, label: "السبت" },
];

// Helper function to calculate next open date from weekly settings
function calculateNextOpenDate(weekResetDay: number, weekResetHour: number): string {
  const now = new Date();
  const currentDay = now.getDay();
  const currentHour = now.getHours();

  let daysUntilReset = weekResetDay - currentDay;
  if (daysUntilReset < 0) {
    daysUntilReset += 7;
  } else if (daysUntilReset === 0 && currentHour >= weekResetHour) {
    daysUntilReset = 7;
  }

  const nextReset = new Date(now);
  nextReset.setDate(now.getDate() + daysUntilReset);
  nextReset.setHours(weekResetHour, 0, 0, 0);

  // Return in YYYY-MM-DD format for date input
  return nextReset.toISOString().split('T')[0];
}

export default function ScheduleSettingsPage() {
  const { data: session, isPending } = useSession();
  const [settings, setSettings] = useState<ScheduleSettings | null>(null);
  const [nextOpenDate, setNextOpenDate] = useState<string>("");  // New: Specific date when calendar opens
  const [weekResetDay, setWeekResetDay] = useState<number>(6); // Keep for backward compatibility
  const [weekResetHour, setWeekResetHour] = useState<number>(22); // Default: 10 PM
  const [availabilityOpenHours, setAvailabilityOpenHours] = useState<number>(168); // Default: 1 week
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch current settings
  useEffect(() => {
    if (status !== "loading" && session?.user) {
      const fetchSettings = async () => {
        setLoading(true);
        setError(null);

        try {
          const response = await fetch("/api/settings/schedule");
          if (!response.ok) throw new Error("Failed to fetch settings");

          const data = await response.json();
          const settingsData: ScheduleSettings = data.settings || data;
          setSettings(settingsData);
          setWeekResetDay(settingsData.weekResetDay);
          setWeekResetHour(settingsData.weekResetHour);
          setAvailabilityOpenHours(settingsData.availabilityOpenHours);
          
          // Set nextOpenDate if available, otherwise calculate from weekly settings
          if (settingsData.nextOpenDate) {
            const dateStr = new Date(settingsData.nextOpenDate).toISOString().split('T')[0];
            setNextOpenDate(dateStr);
          } else {
            const nextDate = calculateNextOpenDate(settingsData.weekResetDay, settingsData.weekResetHour);
            setNextOpenDate(nextDate);
          }
        } catch (err) {
          console.error("Error fetching settings:", err);
          setError("فشل تحميل الإعدادات");
        } finally {
          setLoading(false);
        }
      };

      fetchSettings();
    }
  }, [session, status]);

  // Handle authentication and authorization
  if (isPending) {
    return (
      <DashboardLayout title="إعدادات الجدول" role="manager">
        <div className="flex items-center justify-center min-h-screen">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#c19170]/20 border-t-[#7e5b3f] mx-auto"></div>
          </div>
          <p className="mt-4 text-gray-600">جاري التحميل...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!session?.user) {
    redirect("/auth/signin");
    return null;
  }

  // Only managers/CEOs can access this page
  const userRole = (session.user.role || '').toLowerCase();
  console.log("Schedule Settings - User Role:", userRole); // Debug log
  if (userRole !== "manager" && userRole !== "ceo") {
    console.log("Access denied - redirecting to unauthorized"); // Debug log
    redirect("/unauthorized");
    return null;
  }

  // Handle save
  const handleSave = async () => {
    // Validation
    if (weekResetDay < 0 || weekResetDay > 6) {
      setError("يوم إعادة التعيين يجب أن يكون بين 0 و 6");
      return;
    }

    if (weekResetHour < 0 || weekResetHour > 23) {
      setError("ساعة إعادة التعيين يجب أن تكون بين 0 و 23");
      return;
    }

    if (availabilityOpenHours <= 0) {
      setError("ساعات فتح التوافر يجب أن تكون رقم موجب");
      return;
    }

    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch("/api/settings/schedule", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weekResetDay,
          weekResetHour,
          availabilityOpenHours,
          nextOpenDate: nextOpenDate || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save settings");
      }

      const data = await response.json();
      const updatedSettings: ScheduleSettings = data.settings || data;
      setSettings(updatedSettings);
      setSuccessMessage("تم حفظ الإعدادات بنجاح! سيتم تطبيق التغييرات على جميع المدرسين");
    } catch (err) {
      console.error("Error saving settings:", err);
      setError(err instanceof Error ? err.message : "فشل حفظ الإعدادات");
    } finally {
      setSaving(false);
    }
  };

  // Calculate next reset time
  const getNextResetTime = () => {
    const now = new Date();
    const currentDay = now.getDay();
    const currentHour = now.getHours();

    let daysUntilReset = weekResetDay - currentDay;
    if (daysUntilReset < 0) {
      daysUntilReset += 7;
    } else if (daysUntilReset === 0 && currentHour >= weekResetHour) {
      daysUntilReset = 7;
    }

    const nextReset = new Date(now);
    nextReset.setDate(now.getDate() + daysUntilReset);
    nextReset.setHours(weekResetHour, 0, 0, 0);

    return nextReset.toLocaleDateString("ar-EG", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <DashboardLayout title="إعدادات الجدول" role="MANAGER">
      {/* Decorative Background */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-20 right-10 w-72 h-72 bg-[#7e5b3f]/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-[#c19170]/5 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-[#7e5b3f] rounded-lg">
              <Settings className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                إعدادات جدول التوافر
              </h1>
              <p className="text-gray-600 mt-1">
                التحكم في توقيت إعادة تعيين التوافر الأسبوعي للمدرسين
              </p>
            </div>
          </div>
        </div>

        {/* Info Card */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <div className="flex items-start gap-3">
            <Info className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
            <div className="space-y-2">
              <h3 className="font-semibold text-blue-900 text-lg">
                معلومات هامة
              </h3>
              <ul className="space-y-2 text-blue-800">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  <span>
                    <strong>إعادة التعيين الأسبوعي:</strong> في اليوم والساعة المحددة، يتم إعادة تعيين جداول توافر المدرسين
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  <span>
                    <strong>ساعات الفتح:</strong> عدد الساعات قبل إعادة التعيين التي يمكن للمدرسين فيها تحديد توافرهم
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  <span>
                    <strong>التطبيق:</strong> التغييرات ستؤثر على جميع المدرسين فوراً
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2 mb-6">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2 mb-6">
            <CheckCircle className="h-5 w-5" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Settings Form */}
        {loading ? (
          <div className="bg-white rounded-lg shadow-md p-12 flex items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-[#7e5b3f]" />
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
            {/* Calendar Open Date */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Calendar className="h-5 w-5 text-[#7e5b3f]" />
                موعد إعادة التعيين القادمة
              </label>
              <input
                type="date"
                value={nextOpenDate}
                onChange={(e) => {
                  setNextOpenDate(e.target.value);
                  // Extract day of week from selected date
                  const selectedDate = new Date(e.target.value);
                  setWeekResetDay(selectedDate.getDay());
                }}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7e5b3f] focus:border-transparent text-lg"
                disabled={saving}
              />
              <p className="text-sm text-gray-600 mt-1">
                اليوم الذي يتم فيه إعادة تعيين جداول توافر المدرسين
              </p>
            </div>

            {/* Week Reset Hour */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Clock className="h-5 w-5 text-[#7e5b3f]" />
                ساعة إعادة التعيين
              </label>
              <select
                value={weekResetHour}
                onChange={(e) => setWeekResetHour(Number(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7e5b3f] focus:border-transparent text-lg"
                disabled={saving}
              >
                {Array.from({ length: 24 }, (_, i) => (
                  <option key={i} value={i}>
                    {i.toString().padStart(2, "0")}:00
                  </option>
                ))}
              </select>
              <p className="text-sm text-gray-600 mt-1">
                الساعة التي يتم فيها إعادة التعيين (بتوقيت الخادم)
              </p>
            </div>

            {/* Availability Open Hours */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Clock className="h-5 w-5 text-[#7e5b3f]" />
                ساعات فتح التوافر
              </label>
              <input
                type="number"
                value={availabilityOpenHours ?? 0}
                onChange={(e) => {
                  const value = e.target.value === '' ? 0 : Number(e.target.value);
                  setAvailabilityOpenHours(isNaN(value) ? 0 : value);
                }}
                min="1"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7e5b3f] focus:border-transparent text-lg"
                disabled={saving}
              />
              <p className="text-sm text-gray-600 mt-1">
                عدد الساعات قبل إعادة التعيين التي يمكن للمدرسين فيها تحديد توافرهم (168 = أسبوع)
              </p>
            </div>

            {/* Next Reset Preview */}
            {!loading && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">
                  موعد إعادة التعيين القادمة
                </h4>
                <p className="text-gray-700">{getNextResetTime()}</p>
              </div>
            )}

            {/* Save Button */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <a
                href="/manager/dashboard"
                className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
              >
                إلغاء
              </a>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-3 bg-[#7e5b3f] hover:bg-[#6a4d35] text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    جاري الحفظ...
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5" />
                    حفظ الإعدادات
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Current Settings Display */}
        {settings && !loading && (
          <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-4">الإعدادات الحالية</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-[#7e5b3f]">
                  {DAYS.find((d) => d.value === weekResetDay)?.label || '-'}
                </div>
                <div className="text-sm text-gray-600">يوم الإعادة</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[#7e5b3f]">
                  {(weekResetHour ?? 0).toString().padStart(2, "0")}:00
                </div>
                <div className="text-sm text-gray-600">ساعة الإعادة</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[#7e5b3f]">
                  {availabilityOpenHours ?? 0}
                </div>
                <div className="text-sm text-gray-600">ساعات الفتح</div>
              </div>
            </div>

            {/* Next Reset Preview */}
            <div className="mt-4 pt-4 border-t border-gray-300">
              <p className="text-sm text-gray-600">
                <strong>موعد الإعادة القادم:</strong> {getNextResetTime()}
              </p>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

