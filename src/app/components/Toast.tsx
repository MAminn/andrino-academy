"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { CheckCircle, AlertTriangle, AlertCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
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
  showSuccess: (title: string, message?: string, duration?: number) => void;
  showError: (title: string, message?: string, duration?: number) => void;
  showWarning: (title: string, message?: string, duration?: number) => void;
  showInfo: (title: string, message?: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback(
    (toast: Omit<Toast, "id">) => {
      const id = Math.random().toString(36).substr(2, 9);
      const newToast: Toast = {
        ...toast,
        id,
        duration: toast.duration ?? 5000,
      };

      setToasts((prev) => [...prev, newToast]);

      // Auto-remove toast after duration
      if (newToast.duration && newToast.duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, newToast.duration);
      }
    },
    [removeToast]
  );

  const showSuccess = useCallback(
    (title: string, message?: string, duration?: number) => {
      addToast({ type: "success", title, message, duration });
    },
    [addToast]
  );

  const showError = useCallback(
    (title: string, message?: string, duration?: number) => {
      addToast({ type: "error", title, message, duration: duration ?? 8000 });
    },
    [addToast]
  );

  const showWarning = useCallback(
    (title: string, message?: string, duration?: number) => {
      addToast({ type: "warning", title, message, duration });
    },
    [addToast]
  );

  const showInfo = useCallback(
    (title: string, message?: string, duration?: number) => {
      addToast({ type: "info", title, message, duration });
    },
    [addToast]
  );

  return (
    <ToastContext.Provider
      value={{
        toasts,
        addToast,
        removeToast,
        showSuccess,
        showError,
        showWarning,
        showInfo,
      }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

function ToastContainer({
  toasts,
  onRemove,
}: {
  toasts: Toast[];
  onRemove: (id: string) => void;
}) {
  if (toasts.length === 0) return null;

  return (
    <div className='fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full'>
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
}

function ToastItem({
  toast,
  onRemove,
}: {
  toast: Toast;
  onRemove: (id: string) => void;
}) {
  const getToastConfig = (type: ToastType) => {
    switch (type) {
      case "success":
        return {
          icon: CheckCircle,
          bgColor: "bg-green-50",
          borderColor: "border-green-200",
          iconColor: "text-green-500",
          titleColor: "text-green-800",
          messageColor: "text-green-700",
        };
      case "error":
        return {
          icon: AlertCircle,
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
          iconColor: "text-red-500",
          titleColor: "text-red-800",
          messageColor: "text-red-700",
        };
      case "warning":
        return {
          icon: AlertTriangle,
          bgColor: "bg-yellow-50",
          borderColor: "border-yellow-200",
          iconColor: "text-yellow-500",
          titleColor: "text-yellow-800",
          messageColor: "text-yellow-700",
        };
      case "info":
        return {
          icon: Info,
          bgColor: "bg-blue-50",
          borderColor: "border-blue-200",
          iconColor: "text-blue-500",
          titleColor: "text-blue-800",
          messageColor: "text-blue-700",
        };
    }
  };

  const config = getToastConfig(toast.type);
  const Icon = config.icon;

  return (
    <div
      className={`${config.bgColor} ${config.borderColor} border rounded-lg shadow-lg p-4 transform transition-all duration-300 ease-in-out animate-slide-in-right`}>
      <div className='flex items-start gap-3'>
        <Icon className={`w-5 h-5 ${config.iconColor} flex-shrink-0 mt-0.5`} />

        <div className='flex-1 min-w-0'>
          <h4 className={`text-sm font-semibold ${config.titleColor}`}>
            {toast.title}
          </h4>

          {toast.message && (
            <p className={`text-sm ${config.messageColor} mt-1`}>
              {toast.message}
            </p>
          )}

          {toast.action && (
            <button
              onClick={toast.action.onClick}
              className={`text-sm ${config.titleColor} underline hover:no-underline mt-2`}>
              {toast.action.label}
            </button>
          )}
        </div>

        <button
          onClick={() => onRemove(toast.id)}
          className={`${config.iconColor} hover:opacity-75 flex-shrink-0`}>
          <X className='w-4 h-4' />
        </button>
      </div>
    </div>
  );
}

// Utility functions for common toast patterns
export const toastUtils = {
  // API-related toasts
  apiError: (error: unknown) => {
    let message = "حدث خطأ غير متوقع";

    if (error && typeof error === "object") {
      if (
        "response" in error &&
        error.response &&
        typeof error.response === "object" &&
        "data" in error.response &&
        error.response.data &&
        typeof error.response.data === "object" &&
        "error" in error.response.data
      ) {
        message = String(error.response.data.error);
      } else if ("message" in error && typeof error.message === "string") {
        message = error.message;
      }
    }

    return {
      type: "error" as ToastType,
      title: "خطأ في العملية",
      message,
      duration: 8000,
    };
  },

  networkError: () => ({
    type: "error" as ToastType,
    title: "خطأ في الشبكة",
    message: "تحقق من اتصال الإنترنت وحاول مرة أخرى",
    duration: 8000,
  }),

  // Success patterns
  saveSuccess: (itemName: string = "البيانات") => ({
    type: "success" as ToastType,
    title: "تم الحفظ بنجاح",
    message: `تم حفظ ${itemName} بنجاح`,
    duration: 4000,
  }),

  deleteSuccess: (itemName: string = "العنصر") => ({
    type: "success" as ToastType,
    title: "تم الحذف بنجاح",
    message: `تم حذف ${itemName} بنجاح`,
    duration: 4000,
  }),

  createSuccess: (itemName: string = "العنصر") => ({
    type: "success" as ToastType,
    title: "تم الإنشاء بنجاح",
    message: `تم إنشاء ${itemName} بنجاح`,
    duration: 4000,
  }),

  updateSuccess: (itemName: string = "البيانات") => ({
    type: "success" as ToastType,
    title: "تم التحديث بنجاح",
    message: `تم تحديث ${itemName} بنجاح`,
    duration: 4000,
  }),

  // Form validation
  validationError: (field: string) => ({
    type: "error" as ToastType,
    title: "خطأ في البيانات المدخلة",
    message: `يرجى التحقق من ${field}`,
    duration: 6000,
  }),

  // Authentication
  loginSuccess: () => ({
    type: "success" as ToastType,
    title: "تم تسجيل الدخول بنجاح",
    message: "مرحباً بك في أكاديمية أندرينو",
    duration: 4000,
  }),

  loginError: () => ({
    type: "error" as ToastType,
    title: "فشل في تسجيل الدخول",
    message: "البريد الإلكتروني أو كلمة المرور غير صحيحة",
    duration: 6000,
  }),

  logoutSuccess: () => ({
    type: "success" as ToastType,
    title: "تم تسجيل الخروج بنجاح",
    message: "نراك قريباً!",
    duration: 3000,
  }),

  // Session management
  sessionStarted: (sessionName: string) => ({
    type: "success" as ToastType,
    title: "تم بدء الجلسة",
    message: `بدأت جلسة ${sessionName}`,
    duration: 4000,
  }),

  sessionCompleted: (sessionName: string) => ({
    type: "success" as ToastType,
    title: "انتهت الجلسة",
    message: `انتهت جلسة ${sessionName} بنجاح`,
    duration: 4000,
  }),

  attendanceMarked: (studentCount: number) => ({
    type: "success" as ToastType,
    title: "تم حفظ الحضور",
    message: `تم تحديث حضور ${studentCount} طالب`,
    duration: 4000,
  }),
};

// CSS for animations (add to globals.css)
export const toastAnimations = `
@keyframes slide-in-right {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.animate-slide-in-right {
  animation: slide-in-right 0.3s ease-out;
}
`;
