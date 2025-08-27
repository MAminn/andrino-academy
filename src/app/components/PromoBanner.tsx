"use client";

import { useState, useEffect } from "react";

interface PromoBannerProps {
  initialSeconds?: number;
  coupon?: string;
  message?: string;
}

export default function PromoBanner({
  initialSeconds = 900, // 15 minutes default
  coupon = "ANDRINO25",
  message = "خصم %25 اليوم — استخدم الكوبون:",
}: PromoBannerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  const [copyFeedback, setCopyFeedback] = useState("");
  const [isMounted, setIsMounted] = useState(false);

  // Check if banner was dismissed on mount
  useEffect(() => {
    setIsMounted(true);
    const dismissed = localStorage.getItem("andrino:promo:dismissed");
    if (!dismissed) {
      setIsVisible(true);
    }
  }, []);

  // Countdown timer
  useEffect(() => {
    if (!isVisible || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Auto-dismiss when timer reaches 0
          handleDismiss();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isVisible, timeLeft]);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem("andrino:promo:dismissed", "true");
  };

  const handleCopyCoupon = async () => {
    try {
      await navigator.clipboard.writeText(coupon);
      setCopyFeedback("تم النسخ");

      // Clear feedback after 2 seconds
      setTimeout(() => {
        setCopyFeedback("");
      }, 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = coupon;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);

      setCopyFeedback("تم النسخ");
      setTimeout(() => {
        setCopyFeedback("");
      }, 2000);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Escape") {
      handleDismiss();
    }
  };

  // Format time as mm:ss
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  // Don't render on server to avoid hydration issues
  if (!isMounted || !isVisible) {
    return null;
  }

  return (
    <div
      className='sticky top-0 z-50 bg-brand-brown text-white py-2 px-4'
      role='banner'
      aria-label='عرض ترويجي'
      onKeyDown={handleKeyDown}>
      <div className='container mx-auto flex items-center justify-between text-sm'>
        {/* Dismiss button (left side in RTL) */}
        <button
          onClick={handleDismiss}
          className='flex-shrink-0 hover:bg-brand-brown-700 rounded p-1 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-brand-brown'
          aria-label='إغلاق العرض الترويجي'
          type='button'>
          <svg
            className='w-4 h-4'
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

        {/* Main content (center) */}
        <div className='flex-1 flex items-center justify-center space-x-4 rtl:space-x-reverse'>
          {/* Promo message */}
          <div className='flex items-center space-x-2 rtl:space-x-reverse'>
            <span className='font-medium'>
              {message} <strong className='font-bold'>{coupon}</strong>
            </span>

            {/* Countdown timer */}
            <span
              className='bg-brand-brown-800 px-2 py-1 rounded text-xs font-mono tabular-nums'
              aria-live='polite'
              aria-label={`الوقت المتبقي ${formatTime(timeLeft)}`}>
              {formatTime(timeLeft)}
            </span>
          </div>

          {/* Copy button */}
          <div className='relative'>
            <button
              onClick={handleCopyCoupon}
              className='border border-white/30 hover:bg-white/10 px-3 py-1 rounded text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-brand-brown'
              type='button'
              aria-describedby={copyFeedback ? "copy-feedback" : undefined}>
              انسخ الكوبون
            </button>

            {/* Copy feedback */}
            {copyFeedback && (
              <div
                id='copy-feedback'
                role='status'
                aria-live='polite'
                className='absolute top-full left-1/2 transform -translate-x-1/2 mt-1 bg-green-600 text-white px-2 py-1 rounded text-xs whitespace-nowrap animate-fade-in'>
                {copyFeedback}
              </div>
            )}
          </div>
        </div>

        {/* Right spacer to balance the dismiss button */}
        <div className='w-6 flex-shrink-0'></div>
      </div>
    </div>
  );
}
