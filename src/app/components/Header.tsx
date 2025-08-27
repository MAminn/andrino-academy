"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession, signIn, signOut } from "next-auth/react";

interface NavLink {
  href: string;
  label: string;
}

const navLinks: NavLink[] = [
  { href: "/", label: "الرئيسية" },
  { href: "/plans", label: "الخطط" },
  { href: "/about", label: "لماذا نحن" },
  { href: "/contact", label: "تواصل" },
];

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();

  // Handle mounting for SSR
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Close menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  // Handle escape key to close menu and dropdown
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
        setIsProfileDropdownOpen(false);
      }
    };

    const handleClickOutside = (event: Event) => {
      const target = event.target as Element;
      if (!target.closest("[data-profile-dropdown]")) {
        setIsProfileDropdownOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener("keydown", handleEscapeKey);
      // Prevent body scroll when menu is open
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    if (isProfileDropdownOpen) {
      document.addEventListener("keydown", handleEscapeKey);
      document.addEventListener("click", handleClickOutside);
    }

    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
      document.removeEventListener("click", handleClickOutside);
      document.body.style.overflow = "unset";
    };
  }, [isMenuOpen, isProfileDropdownOpen]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  const getDashboardLink = () => {
    if (!session?.user?.role) return "/profile";

    switch (session.user.role) {
      case "STUDENT":
        return "/student";
      case "INSTRUCTOR":
        return "/instructor";
      case "COORDINATOR":
        return "/coordinator";
      case "MANAGER":
        return "/manager";
      default:
        return "/profile";
    }
  };

  const getDashboardLabel = () => {
    if (!session?.user?.role) return "الملف الشخصي";

    switch (session.user.role) {
      case "STUDENT":
        return "لوحة الطالب";
      case "INSTRUCTOR":
        return "لوحة المدرس";
      case "COORDINATOR":
        return "لوحة المنسق";
      case "MANAGER":
        return "لوحة الإدارة";
      default:
        return "الملف الشخصي";
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const isActiveLink = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  if (!isMounted) {
    return null; // Prevent SSR hydration issues
  }

  return (
    <>
      <header className='sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm'>
        <nav
          className='container mx-auto px-4 py-4 flex items-center justify-between'
          aria-label='التنقل الرئيسي'>
          {/* Logo - Left side in RTL */}
          <div className='flex-shrink-0'>
            <Link
              href='/'
              className='text-2xl font-semibold text-brand-blue hover:text-brand-blue-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2 rounded-sm'
              aria-label='الصفحة الرئيسية - أكاديمية أندرينو'>
              Andrino Academy
            </Link>
          </div>

          {/* Desktop Navigation - Right side in RTL */}
          <div className='hidden md:flex items-center space-x-8 rtl:space-x-reverse'>
            {/* Navigation Links */}
            <div className='flex items-center space-x-6 rtl:space-x-reverse'>
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`font-medium transition-colors hover:text-brand-brown focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2 rounded-sm ${
                    isActiveLink(link.href)
                      ? "text-brand-brown font-bold"
                      : "text-gray-700"
                  }`}
                  aria-current={isActiveLink(link.href) ? "page" : undefined}>
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Authentication Section */}
            {session ? (
              <div className='relative' data-profile-dropdown>
                {/* User Avatar */}
                <button
                  onClick={toggleProfileDropdown}
                  className='flex items-center space-x-3 rtl:space-x-reverse p-2 rounded-full hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-copper focus-visible:ring-offset-2 transition-colors'
                  aria-label='قائمة المستخدم'
                  aria-expanded={isProfileDropdownOpen}>
                  {session.user?.image ? (
                    <Image
                      src={session.user.image}
                      alt={session.user?.name || "المستخدم"}
                      width={40}
                      height={40}
                      className='w-10 h-10 rounded-full border-2 border-gray-200'
                    />
                  ) : (
                    <div className='w-10 h-10 rounded-full bg-brand-copper text-white flex items-center justify-center font-medium text-sm'>
                      {getInitials(session.user?.name || "مستخدم")}
                    </div>
                  )}
                  <svg
                    className={`w-4 h-4 text-gray-500 transition-transform ${
                      isProfileDropdownOpen ? "rotate-180" : ""
                    }`}
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'>
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M19 9l-7 7-7-7'
                    />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {isProfileDropdownOpen && (
                  <div className='absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-lg border border-gray-200 py-2 z-50'>
                    {/* User Info */}
                    <div className='px-4 py-3 border-b border-gray-100'>
                      <p className='text-sm font-medium text-gray-900 text-right'>
                        {session.user?.name || "مستخدم"}
                      </p>
                      <p className='text-sm text-gray-500 text-right'>
                        {session.user?.email}
                      </p>
                      {session.user?.role && (
                        <span className='inline-block mt-1 px-2 py-1 text-xs bg-brand-copper/10 text-brand-copper rounded-full'>
                          {session.user.role === "STUDENT" && "طالب"}
                          {session.user.role === "INSTRUCTOR" && "مدرس"}
                          {session.user.role === "COORDINATOR" && "منسق"}
                          {session.user.role === "MANAGER" && "مدير"}
                        </span>
                      )}
                    </div>

                    {/* Menu Items */}
                    <div className='py-1'>
                      <Link
                        href='/profile'
                        className='block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 text-right transition-colors'
                        onClick={() => setIsProfileDropdownOpen(false)}>
                        الملف الشخصي
                      </Link>
                      <Link
                        href={getDashboardLink()}
                        className='block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 text-right transition-colors'
                        onClick={() => setIsProfileDropdownOpen(false)}>
                        {getDashboardLabel()}
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className='block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 text-right transition-colors'>
                        تسجيل خروج
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className='flex items-center space-x-3 rtl:space-x-reverse'>
                <button
                  onClick={() => signIn()}
                  className='px-4 py-2 text-brand-blue border border-brand-blue rounded-full font-medium hover:bg-brand-blue hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2'>
                  تسجيل الدخول
                </button>
                <Link
                  href='/register'
                  className='bg-brand-copper hover:bg-brand-copper-700 text-white px-4 py-2 rounded-full font-medium transition-colors shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-copper focus-visible:ring-offset-2'>
                  إنشاء حساب
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className='md:hidden p-2 text-gray-700 hover:text-brand-blue focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2 rounded-sm'
            aria-label={isMenuOpen ? "إغلاق القائمة" : "فتح القائمة"}
            aria-expanded={isMenuOpen}
            aria-controls='mobile-menu'>
            <svg
              className='w-6 h-6'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
              aria-hidden='true'>
              {isMenuOpen ? (
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M6 18L18 6M6 6l12 12'
                />
              ) : (
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M4 6h16M4 12h16M4 18h16'
                />
              )}
            </svg>
          </button>
        </nav>
      </header>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className='fixed inset-0 z-50 md:hidden' aria-hidden='true'>
          {/* Backdrop */}
          <div
            className='fixed inset-0 bg-black/50 backdrop-blur-sm'
            onClick={() => setIsMenuOpen(false)}
          />

          {/* Menu Panel - Right side in RTL */}
          <div
            id='mobile-menu'
            className='fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white shadow-xl transform translate-x-0 transition-transform duration-300 ease-in-out'
            role='dialog'
            aria-modal='true'
            aria-labelledby='mobile-menu-title'>
            {/* Menu Header */}
            <div className='flex items-center justify-between p-6 border-b border-gray-200'>
              <h2
                id='mobile-menu-title'
                className='text-lg font-semibold text-brand-blue'>
                القائمة
              </h2>
              <button
                onClick={() => setIsMenuOpen(false)}
                className='p-2 text-gray-400 hover:text-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2 rounded-sm'
                aria-label='إغلاق القائمة'>
                <svg
                  className='w-6 h-6'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                  aria-hidden='true'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M6 18L18 6M6 6l12 12'
                  />
                </svg>
              </button>
            </div>

            {/* Menu Content */}
            <div className='flex flex-col h-full'>
              {/* Navigation Links */}
              <nav
                className='flex-1 px-6 py-6 space-y-4'
                aria-label='التنقل المحمول'>
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`block py-3 px-4 rounded-brand text-lg font-medium transition-colors hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2 ${
                      isActiveLink(link.href)
                        ? "text-brand-brown font-bold bg-brand-brown/5"
                        : "text-gray-700"
                    }`}
                    aria-current={isActiveLink(link.href) ? "page" : undefined}
                    onClick={() => setIsMenuOpen(false)}>
                    {link.label}
                  </Link>
                ))}
              </nav>

              {/* CTA Button or Authentication */}
              <div className='p-6 border-t border-gray-200'>
                {session ? (
                  <div className='space-y-4'>
                    {/* User Info */}
                    <div className='flex items-center space-x-3 rtl:space-x-reverse p-3 bg-gray-50 rounded-2xl'>
                      {session.user?.image ? (
                        <Image
                          src={session.user.image}
                          alt={session.user?.name || "المستخدم"}
                          width={48}
                          height={48}
                          className='w-12 h-12 rounded-full border-2 border-gray-200'
                        />
                      ) : (
                        <div className='w-12 h-12 rounded-full bg-brand-copper text-white flex items-center justify-center font-medium'>
                          {getInitials(session.user?.name || "مستخدم")}
                        </div>
                      )}
                      <div className='flex-1 min-w-0'>
                        <p className='text-sm font-medium text-gray-900 text-right truncate'>
                          {session.user?.name || "مستخدم"}
                        </p>
                        <p className='text-xs text-gray-500 text-right truncate'>
                          {session.user?.email}
                        </p>
                      </div>
                    </div>

                    {/* Profile Actions */}
                    <div className='space-y-2'>
                      <Link
                        href='/profile'
                        className='block w-full py-3 px-4 text-center bg-gray-50 hover:bg-gray-100 rounded-2xl font-medium text-gray-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2'
                        onClick={() => setIsMenuOpen(false)}>
                        الملف الشخصي
                      </Link>
                      <Link
                        href={getDashboardLink()}
                        className='block w-full py-3 px-4 text-center bg-brand-blue text-white rounded-2xl font-medium hover:bg-brand-blue-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2'
                        onClick={() => setIsMenuOpen(false)}>
                        {getDashboardLabel()}
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className='block w-full py-3 px-4 text-center bg-red-50 hover:bg-red-100 text-red-600 rounded-2xl font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2'>
                        تسجيل خروج
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className='space-y-3'>
                    <button
                      onClick={() => signIn()}
                      className='block w-full py-3 px-4 text-center border border-brand-blue text-brand-blue rounded-2xl font-medium hover:bg-brand-blue hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2'>
                      تسجيل الدخول
                    </button>
                    <Link
                      href='/register'
                      className='block w-full bg-brand-copper hover:bg-brand-copper-700 text-white text-center px-4 py-3 rounded-2xl font-medium transition-colors shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-copper focus-visible:ring-offset-2'
                      onClick={() => setIsMenuOpen(false)}>
                      إنشاء حساب
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
