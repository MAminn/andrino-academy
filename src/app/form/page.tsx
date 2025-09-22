"use client";

import { useState } from "react";
import Link from "next/link";

export default function StudentForm() {
  const [formData, setFormData] = useState({
    studentName: "",
    age: "",
    school: "",
    phoneNumber: "",
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate form submission (you can integrate with your backend here)
    await new Promise((resolve) => setTimeout(resolve, 1000));

    console.log("Form Data:", formData);
    setIsSubmitted(true);
    setIsLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  if (isSubmitted) {
    return (
      <div
        className='min-h-screen bg-gradient-to-b from-white to-[#b7b7b8] flex items-center justify-center'
        dir='rtl'>
        <div className='max-w-md w-full mx-4'>
          <div className='bg-white rounded-2xl p-8 shadow-lg text-center'>
            <div className='w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4'>
              <svg
                className='w-8 h-8 text-green-600'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M5 13l4 4L19 7'
                />
              </svg>
            </div>
            <h2 className='text-2xl font-bold text-gray-900 mb-4'>
              تم إرسال البيانات بنجاح! 🎉
            </h2>
            <p className='text-gray-600 mb-6'>
              شكراً لك على اهتمامك بأكاديمية أندرينو. سنتواصل معك قريباً لتحديد
              موعد الحصة المجانية.
            </p>
            <Link
              href='/'
              className='inline-block bg-[#7e5b3f] text-white px-6 py-3 rounded-xl font-medium hover:bg-[#343b50] transition-colors duration-300'>
              العودة للصفحة الرئيسية
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className='min-h-screen bg-gradient-to-b from-white to-[#b7b7b8]'
      dir='rtl'>
      <div className='max-w-2xl mx-auto px-4 py-12'>
        {/* Header */}
        <div className='text-center mb-8'>
          <Link
            href='/'
            className='inline-flex items-center text-[#7e5b3f] hover:text-[#343b50] transition-colors duration-300 mb-6'>
            <svg
              className='w-5 h-5 ml-2'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M10 19l-7-7m0 0l7-7m-7 7h18'
              />
            </svg>
            العودة للصفحة الرئيسية
          </Link>
          <h1 className='text-3xl md:text-4xl font-bold text-gray-900 mb-4'>
            احجز حصة مجانية لطفلك
          </h1>

          <p className='text-lg text-gray-600 max-w-lg mx-auto'>
            املأ البيانات التالية وسنتواصل معك لتحديد موعد مناسب للحصة التجريبية
            المجانية
          </p>
        </div>

        {/* Form */}
        <div className='bg-white rounded-2xl p-8 shadow-lg'>
          <form onSubmit={handleSubmit} className='space-y-6'>
            {/* Student Name */}
            <div>
              <label
                htmlFor='studentName'
                className='block text-sm font-medium text-gray-700 mb-2'>
                اسم الطالب *
              </label>
              <input
                type='text'
                id='studentName'
                name='studentName'
                value={formData.studentName}
                onChange={handleChange}
                required
                className='w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#7e5b3f] focus:border-transparent outline-none transition-all duration-300'
                placeholder='أدخل اسم الطالب'
              />
            </div>

            {/* Age */}
            <div>
              <label
                htmlFor='age'
                className='block text-sm font-medium text-gray-700 mb-2'>
                سن الطالب *
              </label>
              <input
                type='number'
                id='age'
                name='age'
                value={formData.age}
                onChange={handleChange}
                required
                min='5'
                max='18'
                className='w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#7e5b3f] focus:border-transparent outline-none transition-all duration-300'
                placeholder='أدخل سن الطالب'
              />
            </div>

            {/* School */}
            <div>
              <label
                htmlFor='school'
                className='block text-sm font-medium text-gray-700 mb-2'>
                المدرسة *
              </label>
              <input
                type='text'
                id='school'
                name='school'
                value={formData.school}
                onChange={handleChange}
                required
                className='w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#7e5b3f] focus:border-transparent outline-none transition-all duration-300'
                placeholder='أدخل اسم المدرسة'
              />
            </div>

            {/* Phone Number */}
            <div>
              <label
                htmlFor='phoneNumber'
                className='block text-sm font-medium text-gray-700 mb-2'>
                رقم الهاتف *
              </label>
              <input
                type='tel'
                id='phoneNumber'
                name='phoneNumber'
                value={formData.phoneNumber}
                onChange={handleChange}
                required
                className='w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#7e5b3f] focus:border-transparent outline-none transition-all duration-300'
                placeholder='05xxxxxxxx'
                pattern='[0-9]{10}'
              />
            </div>

            {/* Submit Button */}
            <button
              type='submit'
              disabled={isLoading}
              className='w-full bg-[#7e5b3f] text-white py-4 px-6 rounded-xl font-semibold text-lg hover:bg-[#343b50] transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'>
              {isLoading ? (
                <>
                  <svg
                    className='animate-spin w-5 h-5'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'>
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                    />
                  </svg>
                  جاري الإرسال...
                </>
              ) : (
                <>
                  إرسال البيانات
                  <svg
                    className='w-5 h-5'
                    fill='currentColor'
                    viewBox='0 0 20 20'>
                    <path
                      fillRule='evenodd'
                      d='M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z'
                      clipRule='evenodd'
                    />
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Additional Info */}
          <div className='mt-6 p-4 bg-[#7e5b3f]/5 rounded-xl border border-[#7e5b3f]/10'>
            <div className='flex items-start gap-3'>
              <div className='w-5 h-5 text-[#7e5b3f] mt-0.5'>ℹ️</div>
              <div className='text-sm text-gray-600'>
                <p className='font-medium text-gray-700 mb-1'>ملاحظة مهمة:</p>
                <p>
                  هذه البيانات ستُستخدم فقط للتواصل معك وتحديد موعد الحصة
                  التجريبية. سنحافظ على خصوصية معلوماتك ولن نشاركها مع أي طرف
                  ثالث.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
