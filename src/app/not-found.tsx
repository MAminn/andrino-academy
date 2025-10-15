import Link from "next/link";
import { Home, ArrowRight, Search, Mail } from "lucide-react";

export default function NotFound() {
  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4'>
      <div className='max-w-lg w-full text-center'>
        {/* 404 Number */}
        <div className='mb-8'>
          <h1 className='text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600'>
            404
          </h1>
          <div className='w-24 h-1 bg-gradient-to-r from-blue-600 to-indigo-600 mx-auto rounded-full'></div>
        </div>

        {/* Content */}
        <div className='bg-white rounded-2xl shadow-xl p-8 mb-8'>
          <h2 className='text-2xl font-bold text-gray-900 mb-4'>
            الصفحة غير موجودة
          </h2>
          <p className='text-gray-600 mb-6 leading-relaxed'>
            عذراً، الصفحة التي تبحث عنها غير موجودة أو قد تكون قد تم نقلها إلى
            موقع آخر. يمكنك العودة إلى الصفحة الرئيسية أو البحث عن ما تحتاجه.
          </p>

          {/* Navigation Options */}
          <div className='space-y-4'>
            <Link
              href='/'
              className='w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium'>
              <Home className='w-5 h-5' />
              العودة للصفحة الرئيسية
            </Link>

            <Link
              href='/auth/signin'
              className='w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium'>
              <ArrowRight className='w-5 h-5' />
              تسجيل الدخول
            </Link>
          </div>
        </div>

        {/* Help Section */}
        <div className='bg-white/80 backdrop-blur rounded-xl p-6'>
          <h3 className='text-lg font-semibold text-gray-900 mb-4'>
            هل تحتاج مساعدة؟
          </h3>

          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            <a
              href='mailto:support@andrino-academy.com'
              className='flex items-center gap-3 p-3 bg-white rounded-lg hover:shadow-md transition-shadow'>
              <div className='w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center'>
                <Mail className='w-5 h-5 text-blue-600' />
              </div>
              <div className='text-right'>
                <div className='font-medium text-gray-900'>الدعم الفني</div>
                <div className='text-sm text-gray-600'>
                  support@andrino-academy.com
                </div>
              </div>
            </a>

            <Link
              href='/'
              className='flex items-center gap-3 p-3 bg-white rounded-lg hover:shadow-md transition-shadow'>
              <div className='w-10 h-10 bg-green-100 rounded-full flex items-center justify-center'>
                <Search className='w-5 h-5 text-green-600' />
              </div>
              <div className='text-right'>
                <div className='font-medium text-gray-900'>البحث</div>
                <div className='text-sm text-gray-600'>ابحث عن ما تحتاجه</div>
              </div>
            </Link>
          </div>
        </div>

        {/* Footer */}
        <p className='text-gray-500 text-sm mt-6'>
          © 2024 أكاديمية أندرينو - جميع الحقوق محفوظة
        </p>
      </div>
    </div>
  );
}
