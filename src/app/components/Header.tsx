"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { User, LogOut } from "lucide-react";
import LogoImage from "@/../assests/andrino-logo-03.png";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { data: session, status } = useSession();

  // Smooth scroll function
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
        inline: "nearest",
      });
    }
    setIsMobileMenuOpen(false);
  };

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" });
  };

  const getDashboardUrl = () => {
    if (!session?.user?.role) return "/";

    const dashboardMap = {
      student: "/student/dashboard",
      instructor: "/instructor/dashboard",
      coordinator: "/coordinator/dashboard",
      manager: "/manager/dashboard",
      ceo: "/ceo/dashboard",
    };

    return dashboardMap[session.user.role as keyof typeof dashboardMap] || "/";
  };

  const navigationLinks = [
    { name: "الرئيسية", sectionId: "hero" },
    { name: "مميزاتنا", sectionId: "features" },
    { name: "إحصائياتنا", sectionId: "stats" },
    { name: "طلابنا", sectionId: "students" },
    { name: "مشاريعنا", sectionId: "projects" },
    { name: "لماذا أندرينو", sectionId: "why-us" },
  ];

  return (
    <header className='bg-white sticky top-0 z-50 transition-all duration-300'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-6'>
        <div className='flex justify-between lg:justify-start gap-12 items-center h-20'>
          {/* Logo */}
          <div className='flex items-center'>
            <Link href='/' className=' hover:opacity-80 transition-opacity'>
              <Image
                src={LogoImage}
                alt='Andrino Academy Logo'
                width={300}
                height={60}
                className=''
                priority
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className='hidden md:flex items-center space-x-8 space-x-reverse'>
            {navigationLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => scrollToSection(link.sectionId)}
                className='text-gray-700 hover:text-[#7e5b3f] px-3 py-2 text-sm font-medium transition-colors duration-300 hover:bg-[#7e5b3f]/5 rounded-lg'>
                {link.name}
              </button>
            ))}
          </nav>

          {/* Auth Section */}
          <div className='hidden md:flex items-center space-x-3 space-x-reverse'>
            {session ? (
              // Logged in user menu
              <>
                <Link
                  href={getDashboardUrl()}
                  className='flex items-center text-[#7e5b3f] hover:text-[#343b50] px-3 py-2 text-sm font-medium transition-colors'>
                  <User className='w-4 h-4 ml-1' />
                  {session.user.name || session.user.email}
                </Link>
                <button
                  onClick={handleSignOut}
                  className='flex items-center bg-[#7e5b3f] hover:bg-[#343b50] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm hover:shadow-md'>
                  <LogOut className='w-4 h-4 ml-1' />
                  تسجيل الخروج
                </button>
              </>
            ) : (
              // Guest user auth buttons
              <>
                <Link
                  href='/auth/signin'
                  className='text-[#7e5b3f] hover:text-[#343b50] px-3 py-2 text-sm font-medium transition-colors'>
                  تسجيل الدخول
                </Link>
                <Link
                  href='/auth/signup'
                  className='bg-[#7e5b3f] hover:bg-[#343b50] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm hover:shadow-md transform hover:-translate-y-0.5'>
                  إنشاء حساب
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className='md:hidden'>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className='text-gray-700 hover:text-[#7e5b3f] transition-colors p-2 rounded-lg hover:bg-gray-50'>
              {isMobileMenuOpen ? (
                <XMarkIcon className='w-6 h-6' />
              ) : (
                <Bars3Icon className='w-6 h-6' />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className='md:hidden border-t border-gray-100 py-4 bg-white/95 backdrop-blur-sm'>
            <div className='space-y-1'>
              {navigationLinks.map((link) => (
                <button
                  key={link.name}
                  onClick={() => scrollToSection(link.sectionId)}
                  className='block w-full text-right px-3 py-2 text-gray-700 hover:text-[#7e5b3f] hover:bg-gray-50 rounded-md transition-colors'>
                  {link.name}
                </button>
              ))}

              {/* Mobile Auth Section */}
              <div className='border-t border-gray-100 pt-4 mt-4 space-y-2'>
                {session ? (
                  // Logged in user mobile menu
                  <>
                    <Link
                      href={getDashboardUrl()}
                      className='flex items-center px-3 py-2 text-[#7e5b3f] hover:bg-gray-50 rounded-md transition-colors'
                      onClick={() => setIsMobileMenuOpen(false)}>
                      <User className='w-4 h-4 ml-2' />
                      {session.user.name || session.user.email}
                    </Link>
                    <button
                      onClick={() => {
                        handleSignOut();
                        setIsMobileMenuOpen(false);
                      }}
                      className='flex items-center w-full px-3 py-2 bg-[#7e5b3f] text-white rounded-md text-center hover:bg-[#343b50] transition-colors'>
                      <LogOut className='w-4 h-4 ml-2' />
                      تسجيل الخروج
                    </button>
                  </>
                ) : (
                  // Guest user mobile menu
                  <>
                    <Link
                      href='/auth/signin'
                      className='block px-3 py-2 text-[#7e5b3f] hover:bg-gray-50 rounded-md transition-colors'
                      onClick={() => setIsMobileMenuOpen(false)}>
                      تسجيل الدخول
                    </Link>
                    <Link
                      href='/auth/signup'
                      className='block px-3 py-2 bg-[#7e5b3f] text-white rounded-md text-center hover:bg-[#343b50] transition-colors'
                      onClick={() => setIsMobileMenuOpen(false)}>
                      إنشاء حساب
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
