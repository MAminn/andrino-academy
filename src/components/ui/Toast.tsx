/**
 * Toast Notification System for Andrino Academy
 * Provides consistent error/success messaging across the platform
 */

"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface Toast {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

interface ToastProviderProps {
  children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: Toast = {
      ...toast,
      id,
      duration: toast.duration || 5000,
    };

    setToasts((prev) => [...prev, newToast]);

    // Auto-remove after duration
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
      }, newToast.duration);
    }
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const success = useCallback(
    (message: string, title?: string) => {
      addToast({
        type: "success",
        title: title || "نجح العملية",
        message,
      });
    },
    [addToast]
  );

  const error = useCallback(
    (message: string, title?: string) => {
      addToast({
        type: "error",
        title: title || "خطأ",
        message,
        duration: 7000, // Longer duration for errors
      });
    },
    [addToast]
  );

  const warning = useCallback(
    (message: string, title?: string) => {
      addToast({
        type: "warning",
        title: title || "تحذير",
        message,
      });
    },
    [addToast]
  );

  const info = useCallback(
    (message: string, title?: string) => {
      addToast({
        type: "info",
        title: title || "معلومة",
        message,
      });
    },
    [addToast]
  );

  return (
    <ToastContext.Provider
      value={{
        toasts,
        addToast,
        removeToast,
        success,
        error,
        warning,
        info,
      }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
}

function ToastContainer() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div
      className='fixed top-4 left-4 z-50 space-y-3 w-full max-w-sm'
      dir='rtl'>
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  );
}

interface ToastItemProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

function ToastItem({ toast, onRemove }: ToastItemProps) {
  const getToastStyles = (type: ToastType) => {
    switch (type) {
      case "success":
        return {
          container: "bg-green-50 border-green-200 text-green-800",
          icon: CheckCircle,
          iconColor: "text-green-500",
        };
      case "error":
        return {
          container: "bg-red-50 border-red-200 text-red-800",
          icon: AlertCircle,
          iconColor: "text-red-500",
        };
      case "warning":
        return {
          container: "bg-yellow-50 border-yellow-200 text-yellow-800",
          icon: AlertTriangle,
          iconColor: "text-yellow-500",
        };
      case "info":
        return {
          container: "bg-blue-50 border-blue-200 text-blue-800",
          icon: Info,
          iconColor: "text-blue-500",
        };
      default:
        return {
          container: "bg-gray-50 border-gray-200 text-gray-800",
          icon: Info,
          iconColor: "text-gray-500",
        };
    }
  };

  const styles = getToastStyles(toast.type);
  const IconComponent = styles.icon;

  return (
    <div
      className={`
        relative flex items-start p-4 rounded-lg border shadow-lg backdrop-blur-sm
        transform transition-all duration-300 ease-in-out
        animate-in slide-in-from-left-5 fade-in
        ${styles.container}
      `}>
      {/* Icon */}
      <div className='flex-shrink-0 ml-3'>
        <IconComponent className={`w-5 h-5 ${styles.iconColor}`} />
      </div>

      {/* Content */}
      <div className='flex-1 min-w-0'>
        {toast.title && (
          <h4 className='text-sm font-semibold mb-1'>{toast.title}</h4>
        )}
        <p className='text-sm leading-relaxed'>{toast.message}</p>

        {toast.action && (
          <div className='mt-3'>
            <button
              onClick={toast.action.onClick}
              className='text-xs font-medium underline hover:no-underline transition-all'>
              {toast.action.label}
            </button>
          </div>
        )}
      </div>

      {/* Close Button */}
      <button
        onClick={() => onRemove(toast.id)}
        className='flex-shrink-0 mr-2 p-1 rounded-md hover:bg-black/5 transition-colors'
        aria-label='إغلاق الإشعار'>
        <X className='w-4 h-4' />
      </button>
    </div>
  );
}

/**
 * Global error handler for API calls
 */
export function handleAPIError(error: unknown, toast: ToastContextType) {
  console.error("API Error:", error);

  if (error instanceof Error) {
    // Check if it's our custom APIError
    if ("status" in error) {
      const apiError = error as Error & { status: number; message: string };

      switch (apiError.status) {
        case 401:
          toast.error("يجب تسجيل الدخول للوصول لهذه الصفحة", "غير مصرح");
          break;
        case 403:
          toast.error("ليس لديك صلاحية للقيام بهذا الإجراء", "ممنوع الوصول");
          break;
        case 404:
          toast.error("المورد المطلوب غير موجود", "غير موجود");
          break;
        case 500:
          toast.error(
            "حدث خطأ في الخادم. حاول مرة أخرى لاحقاً",
            "خطأ في الخادم"
          );
          break;
        default:
          toast.error(apiError.message || "حدث خطأ غير متوقع");
      }
    } else {
      toast.error(error.message || "حدث خطأ غير متوقع");
    }
  } else {
    toast.error("حدث خطأ غير متوقع");
  }
}

/**
 * Enhanced API client with toast integration
 */
export async function apiCallWithToast<T>(
  url: string,
  options: RequestInit = {},
  toast: ToastContextType,
  successMessage?: string
): Promise<T | null> {
  try {
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error || "خطأ في الطلب");
    }

    // Show success message if provided
    if (successMessage) {
      toast.success(successMessage);
    } else if (data.message) {
      toast.success(data.message);
    }

    return data.data;
  } catch (error) {
    handleAPIError(error, toast);
    return null;
  }
}
