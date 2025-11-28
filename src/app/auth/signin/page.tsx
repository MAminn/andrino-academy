"use client";

import { useState, Suspense } from "react";
import { signIn } from "@/lib/auth-client";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, LogIn, AlertCircle } from "lucide-react";

function SigninForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const { data, error } = await signIn.email({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        setError("البريد الإلكتروني أو كلمة المرور غير صحيحة");
      } else if (data?.user?.role) {
        // Redirect based on user role
        switch (data.user.role) {
          case "student":
            router.push("/student/dashboard");
            break;
          case "instructor":
            router.push("/instructor/dashboard");
            break;
          case "coordinator":
            router.push("/coordinator/dashboard");
            break;
          case "manager":
            router.push("/manager/dashboard");
            break;
          case "ceo":
            router.push("/ceo/dashboard");
            break;
          default:
            router.push(callbackUrl);
        }
      } else {
        router.push(callbackUrl);
      }
    } catch (err) {
      console.error("Sign in error:", err);
      setError("حدث خطأ أثناء تسجيل الدخول");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className='min-h-screen bg-gradient-to-b from-white to-[#b7b7b8] flex items-center justify-center py-12 px-4'
      dir='rtl'>
      <div className='max-w-md w-full'>
        <div className='bg-white rounded-2xl shadow-xl p-8 border border-gray-100'>
          {/* Header */}
          <div className='text-center mb-8'>
            <div className='mx-auto w-16 h-16 bg-gradient-to-r from-[#7e5b3f] to-[#c19170] rounded-full flex items-center justify-center mb-4'>
              <LogIn className='w-8 h-8 text-white' />
            </div>
            <h1 className='text-3xl font-bold text-[#343b50] mb-2'>
              تسجيل الدخول
            </h1>
            <p className='text-gray-600'>أدخل بياناتك للوصول إلى حسابك</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className='mb-6 p-4 bg-red-50 border border-red-200 rounded-lg'>
              <div className='flex items-center'>
                <AlertCircle className='w-5 h-5 text-red-500 ml-2' />
                <p className='text-red-800'>{error}</p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className='space-y-6'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                البريد الإلكتروني
              </label>
              <input
                type='email'
                name='email'
                value={formData.email}
                onChange={handleInputChange}
                required
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7e5b3f] focus:border-transparent transition-colors'
                placeholder='أدخل بريدك الإلكتروني'
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                كلمة المرور
              </label>
              <div className='relative'>
                <input
                  type={showPassword ? "text" : "password"}
                  name='password'
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7e5b3f] focus:border-transparent pl-10 transition-colors'
                  placeholder='أدخل كلمة المرور'
                />
                <button
                  type='button'
                  onClick={() => setShowPassword(!showPassword)}
                  className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-[#7e5b3f] transition-colors'>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type='submit'
              disabled={isLoading}
              className='w-full bg-gradient-to-r from-[#7e5b3f] to-[#c19170] text-white py-3 px-4 rounded-xl font-medium hover:from-[#343b50] hover:to-[#7e5b3f] focus:ring-2 focus:ring-[#7e5b3f] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'>
              {isLoading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
            </button>
          </form>

          {/* Divider */}
          <div className='my-6 flex items-center'>
            <div className='flex-1 border-t border-gray-300'></div>
            <span className='px-4 text-sm text-gray-500'>أو</span>
            <div className='flex-1 border-t border-gray-300'></div>
          </div>

          {/* Sign Up Link */}
          <div className='text-center'>
            <p className='text-sm text-gray-600'>
              لا تملك حساباً؟{" "}
              <Link
                href='/auth/signup'
                className='text-[#7e5b3f] hover:text-[#343b50] font-medium transition-colors'>
                إنشاء حساب جديد
              </Link>
            </p>
            <p className='text-xs text-gray-500 mt-2'>
              ملاحظة: يمكن للطلاب فقط إنشاء حسابات جديدة
            </p>
          </div>

          {/* Demo Accounts */}
          <div className='mt-6 p-4 bg-gradient-to-br from-[#7e5b3f]/5 to-[#c19170]/5 rounded-xl border border-[#c19170]/20'>
            <h3 className='text-sm font-medium text-[#343b50] mb-2'>
              حسابات تجريبية:
            </h3>
            <div className='text-xs text-gray-600 space-y-1'>
              <p>المدير التنفيذي: ceo@andrino-academy.com</p>
              <p>مدير النظام: manager@andrino-academy.com</p>
              <p>المنسق: coordinator@andrino-academy.com</p>
              <p className='text-gray-500'>
                كلمة المرور لجميع الحسابات متوفرة لدى المطور
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SigninPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SigninForm />
    </Suspense>
  );
}
