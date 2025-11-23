"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ShieldX, Home, ArrowRight } from "lucide-react";

export default function UnauthorizedPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const getDashboardUrl = () => {
    if (!session?.user?.role) return "/";
    
    const dashboardMap: Record<string, string> = {
      student: "/student/dashboard",
      instructor: "/instructor/dashboard",
      coordinator: "/coordinator/dashboard",
      manager: "/manager/dashboard",
      ceo: "/ceo/dashboard",
    };

    return dashboardMap[session.user.role] || "/";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4" dir="rtl">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
        {/* Icon */}
        <div className="mb-6 flex justify-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
            <ShieldX className="w-12 h-12 text-red-600" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          غير مصرح بالدخول
        </h1>

        {/* Description */}
        <p className="text-gray-600 mb-8 leading-relaxed">
          عذراً، ليس لديك صلاحية للوصول إلى هذه الصفحة. يرجى التواصل مع المسؤول إذا كنت تعتقد أن هذا خطأ.
        </p>

        {/* User Info */}
        {session?.user && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              <span className="font-semibold">المستخدم:</span> {session.user.name}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              <span className="font-semibold">الدور:</span>{" "}
              <span className="capitalize">{session.user.role}</span>
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={() => router.push(getDashboardUrl())}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" />
            العودة إلى لوحة التحكم
            <ArrowRight className="w-5 h-5" />
          </button>

          <button
            onClick={() => router.back()}
            className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
          >
            رجوع
          </button>
        </div>

        {/* Help */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            هل تحتاج إلى مساعدة؟{" "}
            <a
              href="mailto:support@andrino-academy.com"
              className="text-blue-600 hover:underline font-semibold"
            >
              اتصل بالدعم الفني
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
