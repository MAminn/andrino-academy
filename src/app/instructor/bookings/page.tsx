/**
 * Instructor Bookings Page
 * Andrino Academy - View and Manage Student Bookings
 *
 * Features:
 * - View all student bookings
 * - Add/edit instructor notes
 * - See student notes
 * - Filter by week
 * - Session status tracking
 */

"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { redirect } from "next/navigation";
import DashboardLayout from "@/app/components/dashboard/DashboardLayout";
import InstructorBookingsList from "@/components/InstructorBookingsList";
import { Calendar, Info } from "lucide-react";

export default function InstructorBookingsPage() {
  const { data: session, status } = useSession();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle authentication and authorization
  if (status === "loading" || !mounted) {
    return (
      <DashboardLayout title="حجوزات الطلاب" role="INSTRUCTOR">
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

  return (
    <DashboardLayout title="حجوزات الطلاب" role="INSTRUCTOR">
      {/* Decorative Background */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-20 right-10 w-72 h-72 bg-[#7e5b3f]/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-[#c19170]/5 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-[#7e5b3f] rounded-lg">
              <Calendar className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                حجوزات الطلاب
              </h1>
              <p className="text-gray-600 mt-1">
                عرض وإدارة حجوزات الطلاب وإضافة الملاحظات
              </p>
            </div>
          </div>
        </div>

        {/* Instructions Card */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <div className="flex items-start gap-3">
            <Info className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
            <div className="space-y-2">
              <h3 className="font-semibold text-blue-900 text-lg">
                كيفية الاستخدام
              </h3>
              <ul className="space-y-2 text-blue-800">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  <span>
                    <strong>عرض الحجوزات:</strong> جميع حجوزات الطلاب مرتبة حسب اليوم والساعة
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  <span>
                    <strong>ملاحظات الطلاب:</strong> يمكنك رؤية الملاحظات التي أضافها الطلاب عن الجلسة
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  <span>
                    <strong>ملاحظات المدرس:</strong> أضف ملاحظاتك الخاصة عن الطالب أو الجلسة
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  <span>
                    <strong>الفلترة:</strong> اختر أسبوعاً محدداً لعرض حجوزاته فقط
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  <span>
                    <strong>الجلسات:</strong> إذا كانت هناك جلسة مرتبطة بالحجز، ستظهر رابط الانضمام
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bookings List */}
        <InstructorBookingsList instructorId={session.user.id} />
      </div>
    </DashboardLayout>
  );
}
