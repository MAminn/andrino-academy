"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, UserPlus, AlertCircle, CheckCircle } from "lucide-react";

interface FormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  age: string;
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  priorExperience: string;
  phone: string;
  address: string;
}

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    age: "",
    parentName: "",
    parentEmail: "",
    parentPhone: "",
    priorExperience: "",
    phone: "",
    address: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState("");

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: string[] = [];

    if (formData.password !== formData.confirmPassword) {
      newErrors.push("كلمة المرور وتأكيد كلمة المرور غير متطابقتان");
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.push("البريد الإلكتروني غير صحيح (مثال: student@example.com)");
    }

    if (formData.parentEmail && !emailRegex.test(formData.parentEmail)) {
      newErrors.push(
        "البريد الإلكتروني لولي الأمر غير صحيح (مثال: parent@example.com)"
      );
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setErrors([]);
    setSuccess("");

    try {
      const submitData = {
        ...formData,
        age: parseInt(formData.age),
      };

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess("تم إنشاء الحساب بنجاح! سيتم توجيهك لصفحة تسجيل الدخول...");
        setTimeout(() => {
          router.push("/auth/signin");
        }, 2000);
      } else {
        setErrors(data.errors || [data.error]);
      }
    } catch (err) {
      console.error("Registration error:", err);
      setErrors(["حدث خطأ في الاتصال بالخادم"]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className='min-h-screen bg-gradient-to-b from-[#b7b7b8] to-white py-12 px-4'
      dir='rtl'>
      <div className='max-w-2xl mx-auto'>
        <div className='bg-white rounded-2xl shadow-xl p-8 border border-gray-100'>
          {/* Header */}
          <div className='text-center mb-8'>
            <div className='mx-auto w-16 h-16 bg-gradient-to-r from-[#7e5b3f] to-[#c19170] rounded-full flex items-center justify-center mb-4'>
              <UserPlus className='w-8 h-8 text-white' />
            </div>
            <h1 className='text-3xl font-bold text-[#343b50] mb-2'>
              إنشاء حساب طالب
            </h1>
            <p className='text-gray-600'>
              انضم إلى أكاديمية أندرينو وابدأ رحلتك في تعلم البرمجة
            </p>
          </div>

          {/* Error Messages */}
          {errors.length > 0 && (
            <div className='mb-6 p-4 bg-red-50 border border-red-200 rounded-lg'>
              <div className='flex items-center mb-2'>
                <AlertCircle className='w-5 h-5 text-red-500 ml-2' />
                <h3 className='text-red-800 font-medium'>
                  يرجى تصحيح الأخطاء التالية:
                </h3>
              </div>
              <ul className='text-red-700 text-sm space-y-1'>
                {errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className='mb-6 p-4 bg-green-50 border border-green-200 rounded-lg'>
              <div className='flex items-center'>
                <CheckCircle className='w-5 h-5 text-green-500 ml-2' />
                <p className='text-green-800'>{success}</p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className='space-y-6'>
            {/* Student Information */}
            <div className='space-y-4'>
              <h3 className='text-lg font-semibold text-[#343b50] border-b-2 border-[#c19170]/30 pb-2'>
                معلومات الطالب
              </h3>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    الاسم الكامل *
                  </label>
                  <input
                    type='text'
                    name='name'
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7e5b3f] focus:border-transparent transition-colors'
                    placeholder='أدخل اسمك الكامل'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    العمر *
                  </label>
                  <input
                    type='number'
                    name='age'
                    value={formData.age}
                    onChange={handleInputChange}
                    required
                    min='6'
                    max='18'
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7e5b3f] focus:border-transparent transition-colors'
                    placeholder='6-18'
                  />
                </div>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  البريد الإلكتروني *
                </label>
                <input
                  type='email'
                  name='email'
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7e5b3f] focus:border-transparent transition-colors'
                  placeholder='student@example.com'
                />
                <p className='text-xs text-gray-500 mt-1'>
                  استخدم بريد إلكتروني صحيح مثل: student@example.com
                </p>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    كلمة المرور *
                  </label>
                  <div className='relative'>
                    <input
                      type={showPassword ? "text" : "password"}
                      name='password'
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      minLength={6}
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7e5b3f] focus:border-transparent transition-colors pl-10'
                      placeholder='أدخل كلمة مرور قوية'
                    />
                    <button
                      type='button'
                      onClick={() => setShowPassword(!showPassword)}
                      className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-[#7e5b3f] transition-colors'>
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    تأكيد كلمة المرور *
                  </label>
                  <div className='relative'>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name='confirmPassword'
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      required
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7e5b3f] focus:border-transparent transition-colors pl-10'
                      placeholder='أعد كتابة كلمة المرور'
                    />
                    <button
                      type='button'
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-[#7e5b3f] transition-colors'>
                      {showConfirmPassword ? (
                        <EyeOff size={16} />
                      ) : (
                        <Eye size={16} />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  مستوى الخبرة السابقة في البرمجة *
                </label>
                <select
                  name='priorExperience'
                  value={formData.priorExperience}
                  onChange={handleInputChange}
                  required
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7e5b3f] focus:border-transparent transition-colors'>
                  <option value=''>اختر مستوى خبرتك</option>
                  <option value='none'>لا يوجد خبرة سابقة</option>
                  <option value='basic'>خبرة أساسية</option>
                  <option value='intermediate'>خبرة متوسطة</option>
                  <option value='advanced'>خبرة متقدمة</option>
                </select>
              </div>
            </div>

            {/* Parent Information */}
            <div className='space-y-4'>
              <h3 className='text-lg font-semibold text-[#343b50] border-b-2 border-[#c19170]/30 pb-2'>
                معلومات ولي الأمر
              </h3>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  اسم ولي الأمر *
                </label>
                <input
                  type='text'
                  name='parentName'
                  value={formData.parentName}
                  onChange={handleInputChange}
                  required
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7e5b3f] focus:border-transparent transition-colors'
                  placeholder='اسم ولي الأمر الكامل'
                />
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    البريد الإلكتروني لولي الأمر *
                  </label>
                  <input
                    type='email'
                    name='parentEmail'
                    value={formData.parentEmail}
                    onChange={handleInputChange}
                    required
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7e5b3f] focus:border-transparent transition-colors'
                    placeholder='parent@example.com'
                  />
                  <p className='text-xs text-gray-500 mt-1'>
                    استخدم بريد إلكتروني صحيح مثل: parent@example.com
                  </p>
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    رقم هاتف ولي الأمر *
                  </label>
                  <input
                    type='tel'
                    name='parentPhone'
                    value={formData.parentPhone}
                    onChange={handleInputChange}
                    required
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7e5b3f] focus:border-transparent transition-colors'
                    placeholder='+966 5X XXX XXXX'
                  />
                </div>
              </div>
            </div>

            {/* Optional Information */}
            <div className='space-y-4'>
              <h3 className='text-lg font-semibold text-[#343b50] border-b-2 border-[#c19170]/30 pb-2'>
                معلومات إضافية (اختيارية)
              </h3>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    رقم الهاتف
                  </label>
                  <input
                    type='tel'
                    name='phone'
                    value={formData.phone}
                    onChange={handleInputChange}
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7e5b3f] focus:border-transparent transition-colors'
                    placeholder='+966 5X XXX XXXX'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    العنوان
                  </label>
                  <input
                    type='text'
                    name='address'
                    value={formData.address}
                    onChange={handleInputChange}
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7e5b3f] focus:border-transparent transition-colors'
                    placeholder='المدينة، المملكة العربية السعودية'
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className='pt-4'>
              <button
                type='submit'
                disabled={isLoading}
                className='w-full bg-gradient-to-r from-[#7e5b3f] to-[#c19170] text-white py-3 px-4 rounded-xl font-medium hover:from-[#343b50] hover:to-[#7e5b3f] focus:ring-2 focus:ring-[#7e5b3f] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'>
                {isLoading ? "جاري إنشاء الحساب..." : "إنشاء الحساب"}
              </button>
            </div>
          </form>

          {/* Sign In Link */}
          <div className='mt-6 text-center text-sm text-gray-600'>
            لديك حساب بالفعل؟{" "}
            <Link
              href='/auth/signin'
              className='text-[#7e5b3f] hover:text-[#343b50] font-medium transition-colors'>
              تسجيل الدخول
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
