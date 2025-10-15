"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, AlertCircle, RefreshCw, Wifi, WifiOff } from "lucide-react";

// Loading Spinner Component
export function LoadingSpinner({
  size = "md",
  className = "",
}: {
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  return (
    <Loader2 className={`animate-spin ${sizeClasses[size]} ${className}`} />
  );
}

// Full Page Loading
export function PageLoading({
  message = "جارٍ التحميل...",
}: {
  message?: string;
}) {
  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50'>
      <div className='text-center'>
        <LoadingSpinner size='lg' className='text-blue-600 mx-auto mb-4' />
        <p className='text-gray-600 text-lg'>{message}</p>
      </div>
    </div>
  );
}

// Card Loading Skeleton
export function CardSkeleton({ count = 1 }: { count?: number }) {
  return (
    <div className='space-y-4'>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className='border rounded-lg p-4 animate-pulse'>
          <div className='flex items-center justify-between mb-3'>
            <div className='h-4 bg-gray-200 rounded w-1/3'></div>
            <div className='h-6 bg-gray-200 rounded-full w-16'></div>
          </div>
          <div className='space-y-2'>
            <div className='h-3 bg-gray-200 rounded w-full'></div>
            <div className='h-3 bg-gray-200 rounded w-2/3'></div>
          </div>
          <div className='flex gap-2 mt-4'>
            <div className='h-8 bg-gray-200 rounded w-20'></div>
            <div className='h-8 bg-gray-200 rounded w-20'></div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Table Loading Skeleton
export function TableSkeleton({
  rows = 5,
  columns = 4,
}: {
  rows?: number;
  columns?: number;
}) {
  return (
    <div className='animate-pulse'>
      <div className='grid grid-cols-4 gap-4 p-4 border-b bg-gray-50'>
        {Array.from({ length: columns }).map((_, index) => (
          <div key={index} className='h-4 bg-gray-200 rounded'></div>
        ))}
      </div>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className='grid grid-cols-4 gap-4 p-4 border-b'>
          {Array.from({ length: columns }).map((_, colIndex) => (
            <div key={colIndex} className='h-4 bg-gray-200 rounded'></div>
          ))}
        </div>
      ))}
    </div>
  );
}

// Stats Card Loading
export function StatsCardSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className='bg-white rounded-lg border shadow-sm p-6 animate-pulse'>
          <div className='flex items-center justify-between'>
            <div>
              <div className='h-4 bg-gray-200 rounded w-20 mb-2'></div>
              <div className='h-8 bg-gray-200 rounded w-16'></div>
            </div>
            <div className='w-12 h-12 bg-gray-200 rounded-lg'></div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Data Loading State
export function DataLoading({
  message = "جارٍ تحميل البيانات...",
  size = "md",
}: {
  message?: string;
  size?: "sm" | "md" | "lg";
}) {
  return (
    <div className='flex items-center justify-center p-8'>
      <div className='text-center'>
        <LoadingSpinner size={size} className='text-blue-600 mx-auto mb-3' />
        <p className='text-gray-600'>{message}</p>
      </div>
    </div>
  );
}

// Empty State Component
export function EmptyState({
  icon: Icon = AlertCircle,
  title = "لا توجد بيانات",
  description = "لم يتم العثور على أي بيانات لعرضها",
  action,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}) {
  return (
    <div className='text-center py-12'>
      <Icon className='w-16 h-16 text-gray-400 mx-auto mb-4' />
      <h3 className='text-lg font-semibold text-gray-900 mb-2'>{title}</h3>
      <p className='text-gray-600 mb-6 max-w-md mx-auto'>{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'>
          {action.label}
        </button>
      )}
    </div>
  );
}

// Error Fallback Component
export function ErrorFallback({
  error,
  resetError,
  title = "حدث خطأ",
  showDetails = false,
}: {
  error?: Error;
  resetError?: () => void;
  title?: string;
  showDetails?: boolean;
}) {
  return (
    <div className='text-center py-12'>
      <AlertCircle className='w-16 h-16 text-red-500 mx-auto mb-4' />
      <h3 className='text-lg font-semibold text-gray-900 mb-2'>{title}</h3>
      <p className='text-gray-600 mb-6'>
        {error?.message || "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى."}
      </p>

      {showDetails && error && (
        <details className='text-left bg-gray-100 rounded-lg p-4 mb-6 max-w-md mx-auto'>
          <summary className='cursor-pointer text-sm font-medium text-gray-700 mb-2'>
            تفاصيل الخطأ
          </summary>
          <pre className='text-xs text-gray-600 whitespace-pre-wrap'>
            {error.stack || error.message}
          </pre>
        </details>
      )}

      {resetError && (
        <button
          onClick={resetError}
          className='inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'>
          <RefreshCw className='w-4 h-4' />
          إعادة المحاولة
        </button>
      )}
    </div>
  );
}

// Network Status Hook
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return isOnline;
}

// Network Status Indicator
export function NetworkStatusIndicator() {
  const isOnline = useNetworkStatus();
  const [showOfflineMessage, setShowOfflineMessage] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setShowOfflineMessage(true);
    } else {
      // Hide message after a short delay when back online
      const timer = setTimeout(() => setShowOfflineMessage(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOnline]);

  if (!showOfflineMessage) return null;

  return (
    <div
      className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-4 py-2 rounded-lg shadow-lg transition-all duration-300 ${
        isOnline ? "bg-green-500 text-white" : "bg-red-500 text-white"
      }`}>
      <div className='flex items-center gap-2'>
        {isOnline ? (
          <Wifi className='w-4 h-4' />
        ) : (
          <WifiOff className='w-4 h-4' />
        )}
        <span className='text-sm font-medium'>
          {isOnline ? "تم استعادة الاتصال" : "لا يوجد اتصال بالإنترنت"}
        </span>
      </div>
    </div>
  );
}

// Async Data Hook with Error Handling
export function useAsyncData<T>(asyncFn: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await asyncFn();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
    } finally {
      setLoading(false);
    }
  }, [asyncFn]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const retry = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, retry };
}

// Loading Button Component
export function LoadingButton({
  loading,
  children,
  loadingText = "جارٍ المعالجة...",
  disabled = false,
  className = "",
  ...props
}: {
  loading: boolean;
  children: React.ReactNode;
  loadingText?: string;
  disabled?: boolean;
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      disabled={loading || disabled}
      className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      {...props}>
      {loading && <LoadingSpinner size='sm' />}
      {loading ? loadingText : children}
    </button>
  );
}

// Suspense Fallback Component
export function SuspenseFallback({
  message = "جارٍ التحميل...",
}: {
  message?: string;
}) {
  return (
    <div className='flex items-center justify-center min-h-[200px]'>
      <div className='text-center'>
        <LoadingSpinner size='lg' className='text-blue-600 mx-auto mb-4' />
        <p className='text-gray-600'>{message}</p>
      </div>
    </div>
  );
}

// Progressive Loading Component
export function ProgressiveLoader({
  steps,
  currentStep,
}: {
  steps: string[];
  currentStep: number;
}) {
  return (
    <div className='text-center py-8'>
      <LoadingSpinner size='lg' className='text-blue-600 mx-auto mb-6' />

      <div className='max-w-md mx-auto'>
        <div className='flex justify-between mb-2'>
          <span className='text-sm text-gray-600'>
            الخطوة {currentStep + 1} من {steps.length}
          </span>
          <span className='text-sm text-gray-600'>
            {Math.round(((currentStep + 1) / steps.length) * 100)}%
          </span>
        </div>

        <div className='w-full bg-gray-200 rounded-full h-2 mb-4'>
          <div
            className='bg-blue-600 h-2 rounded-full transition-all duration-300'
            style={{
              width: `${((currentStep + 1) / steps.length) * 100}%`,
            }}></div>
        </div>

        <p className='text-gray-700 font-medium'>
          {steps[currentStep] || "جارٍ التحميل..."}
        </p>
      </div>
    </div>
  );
}
