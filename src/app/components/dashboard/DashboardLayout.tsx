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
      <div className='min-h-screen bg-gradient-to-br from-gray-50 via-[#f5f5f5] to-gray-100 flex items-center justify-center'>
        <div className='text-center'>
          <div className='relative'>
            <div className='animate-spin rounded-full h-16 w-16 border-4 border-[#c19170]/20 border-t-[#7e5b3f] mx-auto'></div>
            <div className='absolute inset-0 animate-ping rounded-full h-16 w-16 border-4 border-[#7e5b3f]/20'></div>
          </div>
          <p className='mt-4 text-[#343b50] font-medium'>جاري التحميل...</p>
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
    <div
      className='min-h-screen bg-gradient-to-br from-gray-50 via-[#f5f5f5] to-gray-100'
      dir='rtl'>
      {/* Content */}
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {children}
      </div>

      {/* Decorative background elements */}
      <div className='fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden -z-10'>
        <div className='absolute top-20 right-10 w-72 h-72 bg-[#7e5b3f]/5 rounded-full blur-3xl'></div>
        <div className='absolute bottom-20 left-10 w-96 h-96 bg-[#c19170]/5 rounded-full blur-3xl'></div>
      </div>
    </div>
  );
}
