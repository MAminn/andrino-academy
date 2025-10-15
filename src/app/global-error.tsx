"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, Home, RefreshCw, Mail, Bug } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to console and external services
    console.error("Global error:", error);

    // In production, send to error tracking service
    if (process.env.NODE_ENV === "production") {
      // Example: Send to Sentry, LogRocket, etc.
      console.error("Production error logged:", {
        message: error.message,
        stack: error.stack,
        digest: error.digest,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
      });
    }
  }, [error]);

  const handleReportError = () => {
    const emailBody = `
خطأ عام في النظام:

الرسالة: ${error.message}
معرف الخطأ: ${error.digest || "غير متوفر"}
الوقت: ${new Date().toLocaleString("ar-SA")}
الصفحة: ${window.location.href}
المتصفح: ${navigator.userAgent}

تفاصيل تقنية:
${error.stack || "غير متوفر"}
    `.trim();

    const mailtoLink = `mailto:support@andrino-academy.com?subject=خطأ عام في النظام&body=${encodeURIComponent(
      emailBody
    )}`;
    window.open(mailtoLink);
  };

  return (
    <html lang='ar' dir='rtl'>
      <body>
        <div className='min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center p-4'>
          <div className='max-w-md w-full'>
            {/* Error Icon and Title */}
            <div className='text-center mb-8'>
              <div className='w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                <AlertTriangle className='w-10 h-10 text-red-600' />
              </div>
              <h1 className='text-3xl font-bold text-gray-900 mb-2'>
                خطأ في النظام
              </h1>
              <p className='text-gray-600'>
                حدث خطأ غير متوقع ونحن نعمل على إصلاحه
              </p>
            </div>

            {/* Error Card */}
            <div className='bg-white rounded-xl shadow-lg p-6 mb-6'>
              <div className='mb-6'>
                <h2 className='text-lg font-semibold text-gray-900 mb-2'>
                  ما حدث؟
                </h2>
                <p className='text-gray-600 text-sm leading-relaxed'>
                  تعذر على النظام معالجة طلبك بشكل صحيح. هذا الخطأ تم تسجيله
                  تلقائياً وسيتم إصلاحه في أقرب وقت ممكن.
                </p>
              </div>

              {/* Error Details (Development) */}
              {process.env.NODE_ENV === "development" && (
                <div className='mb-6 p-4 bg-red-50 rounded-lg'>
                  <h3 className='text-sm font-semibold text-red-800 mb-2'>
                    تفاصيل الخطأ (للتطوير فقط):
                  </h3>
                  <p className='text-xs text-red-700 font-mono break-words'>
                    {error.message}
                  </p>
                  {error.digest && (
                    <p className='text-xs text-red-600 mt-1'>
                      معرف الخطأ: {error.digest}
                    </p>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className='space-y-3'>
                <button
                  onClick={reset}
                  className='w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium'>
                  <RefreshCw className='w-5 h-5' />
                  إعادة المحاولة
                </button>

                <Link
                  href='/'
                  className='w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium'>
                  <Home className='w-5 h-5' />
                  العودة للصفحة الرئيسية
                </Link>

                <button
                  onClick={handleReportError}
                  className='w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium'>
                  <Bug className='w-5 h-5' />
                  إبلاغ عن المشكلة
                </button>
              </div>
            </div>

            {/* Help Section */}
            <div className='bg-white/80 backdrop-blur rounded-xl p-4 text-center'>
              <h3 className='font-semibold text-gray-900 mb-2'>
                تحتاج مساعدة فورية؟
              </h3>
              <p className='text-sm text-gray-600 mb-3'>
                تواصل مع فريق الدعم الفني للحصول على المساعدة
              </p>
              <a
                href='mailto:support@andrino-academy.com'
                className='inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium'>
                <Mail className='w-4 h-4' />
                support@andrino-academy.com
              </a>
            </div>

            {/* Footer */}
            <p className='text-center text-gray-500 text-xs mt-4'>
              خطأ رقم: {error.digest || "UNKNOWN"}
            </p>
          </div>
        </div>
      </body>
    </html>
  );
}
