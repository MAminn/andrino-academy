"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, ReactNode } from "react";
import { LogOut, User } from "lucide-react";

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
  role: string;
}

export default function DashboardLayout({
  children,
  title,
  role,
}: DashboardLayoutProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/auth/signin");
      return;
    }

    if (session.user.role !== role) {
      router.push("/");
      return;
    }
  }, [session, status, router, role]);

  if (status === "loading") {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto'></div>
          <p className='mt-2 text-gray-600'>جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" });
  };

  return (
    <div className='min-h-screen bg-gray-50' dir='rtl'>
      {/* Header */}
      <div className='bg-white shadow-sm border-b'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center h-16'>
            <div className='flex items-center'>
              <div className='flex-shrink-0'>
                <h1 className='text-xl font-bold text-gray-900'>{title}</h1>
              </div>
            </div>
            <div className='flex items-center space-x-4 space-x-reverse'>
              <div className='flex items-center text-sm text-gray-700'>
                <User className='w-4 h-4 ml-1' />
                {session.user.name || session.user.email}
              </div>
              <button
                onClick={handleSignOut}
                className='flex items-center text-sm text-red-600 hover:text-red-700 transition-colors'>
                <LogOut className='w-4 h-4 ml-1' />
                تسجيل الخروج
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {children}
      </div>
    </div>
  );
}
