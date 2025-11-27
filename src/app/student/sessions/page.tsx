/**
 * Student Sessions Page
 * Andrino Academy - Book and Manage Sessions
 *
 * Features:
 * - View available sessions
 * - Book sessions
 * - Manage bookings
 * - Add notes to bookings
 * - Cancel bookings
 */

"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { redirect } from "next/navigation";
import DashboardLayout from "@/app/components/dashboard/DashboardLayout";
import AvailableSessions from "@/components/AvailableSessions";
import MyBookings from "@/components/MyBookings";
import { Calendar, BookOpen, Info } from "lucide-react";

export default function StudentSessionsPage() {
  const { data: session, status } = useSession();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"available" | "bookings">("available");

  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle authentication and authorization
  if (status === "loading" || !mounted) {
    return (
      <DashboardLayout title="إدارة الجلسات" role="STUDENT">
        <div className="flex items-center justify-center min-h-screen">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#c19170]/20 border-t-[#7e5b3f] mx-auto"></div>
            <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border-4 border-[#7e5b3f]/20"></div>
          </div>
          <p className="mt-4 text-gray-600">جاري التحميل...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!session?.user) {
    redirect("/auth/signin");
  }

  // Only students can access this page
  if (session.user.role !== "student") {
    redirect("/unauthorized");
  }

  const handleBookingUpdate = () => {
    // Refresh data when booking is created/updated/cancelled
    console.log("Booking updated, refreshing data...");
  };

  return (
    <DashboardLayout title="إدارة الجلسات" role="STUDENT">
      {/* Decorative Background */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-20 right-10 w-72 h-72 bg-[#7e5b3f]/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-[#c19170]/5 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-[#7e5b3f] rounded-lg">
              <Calendar className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                إدارة الجلسات
              </h1>
              <p className="text-gray-600 mt-1">
                احجز جلسات مع المدرسين وتابع حجوزاتك
              </p>
            </div>
          </div>
        </div>

        {/* Instructions Card */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <div className="flex items-start gap-3">
            <Info className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
            <div className="space-y-2">
              <h3 className="font-semibold text-blue-900 text-lg">
                كيفية حجز جلسة
              </h3>
              <ul className="space-y-2 text-blue-800">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  <span>
                    <strong>عرض الجلسات المتاحة:</strong> اختر المسار والأسبوع لرؤية الأوقات المتاحة
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  <span>
                    <strong>حجز جلسة:</strong> اضغط على "احجز الآن" للوقت الذي يناسبك
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  <span>
                    <strong>متابعة الحجوزات:</strong> انتقل إلى تبويب "حجوزاتي" لرؤية جميع حجوزاتك
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  <span>
                    <strong>إضافة ملاحظات:</strong> يمكنك إضافة ملاحظات خاصة بك لكل حجز
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  <span>
                    <strong>إلغاء الحجز:</strong> يمكنك إلغاء الحجز قبل أن يقوم المدرس بإنشاء الجلسة
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab("available")}
              className={`flex-1 px-6 py-4 text-center font-semibold transition-colors flex items-center justify-center gap-2 ${
                activeTab === "available"
                  ? "text-[#7e5b3f] border-b-2 border-[#7e5b3f]"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Calendar className="h-5 w-5" />
              الجلسات المتاحة
            </button>
            <button
              onClick={() => setActiveTab("bookings")}
              className={`flex-1 px-6 py-4 text-center font-semibold transition-colors flex items-center justify-center gap-2 ${
                activeTab === "bookings"
                  ? "text-[#7e5b3f] border-b-2 border-[#7e5b3f]"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <BookOpen className="h-5 w-5" />
              حجوزاتي
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="mb-8">
          {activeTab === "available" ? (
            <AvailableSessions
              studentId={session.user.id}
              onBookingCreated={handleBookingUpdate}
            />
          ) : (
            <MyBookings
              studentId={session.user.id}
              onBookingUpdated={handleBookingUpdate}
            />
          )}
        </div>

        {/* Help Section */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-3">
            تحتاج مساعدة؟
          </h3>
          <p className="text-gray-700 mb-4">
            إذا واجهت أي مشكلة في حجز الجلسات أو كان لديك أي استفسار، يرجى التواصل مع المدرس أو الإدارة.
          </p>
          <div className="flex flex-wrap gap-4">
            <a
              href="/student/dashboard"
              className="px-4 py-2 bg-[#7e5b3f] hover:bg-[#6a4d35] text-white rounded-lg transition-colors inline-flex items-center gap-2"
            >
              العودة إلى لوحة التحكم
            </a>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
