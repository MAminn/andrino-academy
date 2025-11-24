/**
 * Instructor Availability Page
 * Andrino Academy - Manage Weekly Availability
 *
 * Features:
 * - Integration with AvailabilityCalendar component
 * - Role-based access (instructors only)
 * - Weekly schedule management
 * - Track-based availability configuration
 */

"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { redirect } from "next/navigation";
import DashboardLayout from "@/app/components/dashboard/DashboardLayout";
import AvailabilityCalendar from "@/components/AvailabilityCalendar";
import { Calendar, Info, BookOpen } from "lucide-react";

export default function InstructorAvailabilityPage() {
  const { data: session, status } = useSession();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle authentication and authorization
  if (status === "loading" || !mounted) {
    return (
      <DashboardLayout title="إدارة التوافر" role="INSTRUCTOR">
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

  // Only instructors can access this page
  if (session.user.role !== "instructor") {
    redirect("/unauthorized");
  }

  const handleSlotsUpdated = () => {
    console.log("Availability slots updated successfully");
  };

  return (
    <DashboardLayout title="إدارة التوافر الأسبوعي" role="INSTRUCTOR">
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
                إدارة التوافر الأسبوعي
              </h1>
              <p className="text-gray-600 mt-1">
                قم بتحديد الأوقات المتاحة لديك للتدريس خلال الأسبوع
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
                كيفية استخدام جدول التوافر
              </h3>
              <ul className="space-y-2 text-blue-800">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  <span>
                    <strong>اختر المسار:</strong> ابدأ باختيار المسار الذي تريد تحديد توافرك له
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  <span>
                    <strong>حدد الأوقات:</strong> انقر على الخلايا لتحديد الأوقات المتاحة (يمكنك السحب لتحديد عدة خلايا)
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  <span>
                    <strong>احفظ التغييرات:</strong> اضغط على "حفظ التوافر" لحفظ الأوقات المحددة
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  <span>
                    <strong>أكد التوافر:</strong> بعد التأكد من الأوقات، اضغط "تأكيد التوافر" لقفل الجدول (لا يمكن التعديل بعد التأكيد)
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  <span>
                    <strong>الفترات المحجوزة:</strong> الفترات التي تم حجزها من قبل الطلاب ستظهر باللون الأحمر
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Important Notes */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-6">
          <div className="flex items-start gap-3">
            <BookOpen className="h-6 w-6 text-amber-600 flex-shrink-0 mt-1" />
            <div className="space-y-2">
              <h3 className="font-semibold text-amber-900 text-lg">
                ملاحظات هامة
              </h3>
              <ul className="space-y-2 text-amber-800">
                <li className="flex items-start gap-2">
                  <span className="text-amber-600">⚠️</span>
                  <span>
                    الأوقات المتاحة: من 1:00 ظهرًا إلى 10:00 مساءً فقط
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600">⚠️</span>
                  <span>
                    بعد تأكيد التوافر، لن تتمكن من تعديل الأوقات المؤكدة
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600">⚠️</span>
                  <span>
                    الفترات المحجوزة من قبل الطلاب لا يمكن حذفها أو تعديلها
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600">⚠️</span>
                  <span>
                    يمكنك تحديد أوقات مختلفة لكل مسار بشكل منفصل
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Availability Calendar Component */}
        <AvailabilityCalendar
          instructorId={session.user.id}
          onSlotsUpdated={handleSlotsUpdated}
        />

        {/* Help Section */}
        <div className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-3">
            تحتاج مساعدة؟
          </h3>
          <p className="text-gray-700 mb-4">
            إذا واجهت أي مشكلة في تحديد توافرك أو كان لديك أي استفسار، يرجى التواصل مع المنسق أو الإدارة.
          </p>
          <div className="flex flex-wrap gap-4">
            <a
              href="/instructor/dashboard"
              className="px-4 py-2 bg-[#7e5b3f] hover:bg-[#6a4d35] text-white rounded-lg transition-colors inline-flex items-center gap-2"
            >
              العودة إلى لوحة التحكم
            </a>
            <a
              href="/instructor/bookings"
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors inline-flex items-center gap-2"
            >
              عرض الحجوزات
            </a>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
