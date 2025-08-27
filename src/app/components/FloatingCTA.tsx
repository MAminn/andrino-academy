"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

export default function FloatingCTA() {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const sheetRef = useRef<HTMLDivElement>(null);
  const fabRef = useRef<HTMLButtonElement>(null);

  // Handle opening/closing the action sheet
  const toggleSheet = () => {
    setIsOpen(!isOpen);
  };

  const closeSheet = () => {
    setIsOpen(false);
  };

  // Hide FAB when keyboard navigation is detected (optional enhancement)
  useEffect(() => {
    let keyboardTimeout: NodeJS.Timeout;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Tab") {
        setIsVisible(false);
        clearTimeout(keyboardTimeout);
        keyboardTimeout = setTimeout(() => setIsVisible(true), 3000);
      }
    };

    const handleMouseMove = () => {
      setIsVisible(true);
      clearTimeout(keyboardTimeout);
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousemove", handleMouseMove);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousemove", handleMouseMove);
      clearTimeout(keyboardTimeout);
    };
  }, []);

  // Handle escape key to close sheet
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        closeSheet();
        fabRef.current?.focus();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen]);

  // Focus trap for the action sheet
  useEffect(() => {
    if (isOpen && sheetRef.current) {
      const sheet = sheetRef.current;
      const focusableElements = sheet.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[
        focusableElements.length - 1
      ] as HTMLElement;

      const handleTabKey = (e: KeyboardEvent) => {
        if (e.key === "Tab") {
          if (e.shiftKey) {
            if (document.activeElement === firstElement) {
              e.preventDefault();
              lastElement?.focus();
            }
          } else {
            if (document.activeElement === lastElement) {
              e.preventDefault();
              firstElement?.focus();
            }
          }
        }
      };

      sheet.addEventListener("keydown", handleTabKey);
      firstElement?.focus();

      return () => sheet.removeEventListener("keydown", handleTabKey);
    }
  }, [isOpen]);

  return (
    <>
      {/* Floating Action Button */}
      <button
        ref={fabRef}
        onClick={toggleSheet}
        className={`fixed bottom-6 left-6 h-12 w-12 bg-brand-copper hover:bg-brand-copper-700 text-white rounded-full shadow-lg hover:shadow-xl z-40 flex items-center justify-center transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-copper focus-visible:ring-offset-2 ${
          isVisible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-60"
        } ${isOpen ? "rotate-45" : "rotate-0"}`}
        aria-label={
          isOpen ? "إغلاق خيارات التواصل" : "فتح خيارات التواصل السريع"
        }
        aria-expanded={isOpen}>
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
            d='M12 6v6m0 0v6m0-6h6m-6 0H6'
          />
        </svg>
      </button>

      {/* Action Sheet */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className='fixed inset-0 bg-black/20 z-30'
            onClick={closeSheet}
            aria-hidden='true'
          />

          {/* Sheet */}
          <div
            ref={sheetRef}
            className='fixed bottom-20 left-6 bg-white rounded-2xl shadow-xl border border-gray-200 p-4 z-40 min-w-[280px] transform transition-all duration-300'
            role='dialog'
            aria-modal='true'
            aria-labelledby='floating-cta-title'>
            {/* Header */}
            <div className='text-right mb-4'>
              <h3
                id='floating-cta-title'
                className='text-lg font-semibold text-brand-blue'>
                كيف يمكننا مساعدتك؟
              </h3>
              <p className='text-sm text-gray-600'>
                اختر الطريقة المناسبة للتواصل معنا
              </p>
            </div>

            {/* Actions */}
            <div className='space-y-3'>
              {/* Primary Action - Book Session */}
              <Link
                href='/book-session'
                className='block w-full bg-brand-copper hover:bg-brand-copper-700 text-white text-center py-3 px-4 rounded-xl font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-copper focus-visible:ring-offset-2'
                onClick={closeSheet}>
                📅 احجز حصة مجانية
              </Link>

              {/* Secondary Action - WhatsApp */}
              <Link
                href='https://wa.me/'
                target='_blank'
                rel='noopener noreferrer'
                className='block w-full bg-green-500 hover:bg-green-600 text-white text-center py-3 px-4 rounded-xl font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2'
                onClick={closeSheet}>
                💬 تواصل واتساب
              </Link>

              {/* Close button */}
              <button
                onClick={closeSheet}
                className='block w-full bg-gray-100 hover:bg-gray-200 text-gray-700 text-center py-2 px-4 rounded-xl font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2'>
                إغلاق
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
