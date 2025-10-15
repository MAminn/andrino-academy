"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw, Home, Bug } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });

    // Call optional onError callback
    this.props.onError?.(error, errorInfo);

    // Log to external service in production
    if (process.env.NODE_ENV === "production") {
      this.logErrorToService(error, errorInfo);
    }
  }

  private logErrorToService = (error: Error, errorInfo: ErrorInfo) => {
    // Here you would integrate with error logging services like:
    // - Sentry
    // - LogRocket
    // - Bugsnag
    // For now, we'll just log to console in production
    console.error("Production Error:", {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
    });
  };

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  private handleGoHome = () => {
    window.location.href = "/";
  };

  private handleReportBug = () => {
    const { error, errorInfo } = this.state;
    const emailBody = `
خطأ في النظام:

الرسالة: ${error?.message || "غير معروف"}
الوقت: ${new Date().toLocaleString("ar-SA")}
المتصفح: ${navigator.userAgent}

تفاصيل تقنية:
${error?.stack || "غير متوفر"}

مكان الخطأ:
${errorInfo?.componentStack || "غير متوفر"}
    `.trim();

    const mailtoLink = `mailto:support@andrino-academy.com?subject=خطأ في النظام&body=${encodeURIComponent(
      emailBody
    )}`;
    window.open(mailtoLink);
  };

  public render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className='min-h-screen bg-gray-50 flex items-center justify-center p-4'>
          <div className='max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center'>
            <div className='mb-6'>
              <AlertTriangle className='w-16 h-16 text-red-500 mx-auto mb-4' />
              <h1 className='text-2xl font-bold text-gray-900 mb-2'>
                حدث خطأ غير متوقع
              </h1>
              <p className='text-gray-600'>
                نعتذر عن هذا الإزعاج. حدث خطأ في النظام ونحن نعمل على إصلاحه.
              </p>
            </div>

            {/* Error Details (Development only) */}
            {process.env.NODE_ENV === "development" && this.state.error && (
              <div className='mb-6 p-4 bg-red-50 rounded-lg text-left'>
                <h3 className='text-sm font-semibold text-red-800 mb-2'>
                  تفاصيل الخطأ (للتطوير فقط):
                </h3>
                <p className='text-xs text-red-700 font-mono break-all'>
                  {this.state.error.message}
                </p>
                {this.state.error.stack && (
                  <details className='mt-2'>
                    <summary className='text-xs text-red-600 cursor-pointer'>
                      عرض التفاصيل الكاملة
                    </summary>
                    <pre className='text-xs text-red-600 mt-2 whitespace-pre-wrap'>
                      {this.state.error.stack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className='space-y-3'>
              <button
                onClick={this.handleRetry}
                className='w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'>
                <RefreshCw className='w-4 h-4' />
                إعادة المحاولة
              </button>

              <button
                onClick={this.handleGoHome}
                className='w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors'>
                <Home className='w-4 h-4' />
                العودة للصفحة الرئيسية
              </button>

              <button
                onClick={this.handleReportBug}
                className='w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors'>
                <Bug className='w-4 h-4' />
                إبلاغ عن المشكلة
              </button>
            </div>

            <p className='text-xs text-gray-500 mt-4'>
              إذا استمرت المشكلة، يرجى التواصل مع الدعم الفني
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Higher-order component for easier usage
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, "children">
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${
    Component.displayName || Component.name
  })`;
  return WrappedComponent;
}

// Specialized error boundaries for different sections
export function DashboardErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      fallback={
        <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
          <div className='text-center p-8'>
            <AlertTriangle className='w-16 h-16 text-red-500 mx-auto mb-4' />
            <h2 className='text-xl font-semibold text-gray-900 mb-2'>
              خطأ في لوحة التحكم
            </h2>
            <p className='text-gray-600 mb-4'>
              حدث خطأ أثناء تحميل لوحة التحكم
            </p>
            <button
              onClick={() => window.location.reload()}
              className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700'>
              إعادة تحميل الصفحة
            </button>
          </div>
        </div>
      }>
      {children}
    </ErrorBoundary>
  );
}

export function FormErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      fallback={
        <div className='p-4 bg-red-50 border border-red-200 rounded-lg'>
          <div className='flex items-center gap-2 text-red-800'>
            <AlertTriangle className='w-5 h-5' />
            <span className='font-medium'>خطأ في النموذج</span>
          </div>
          <p className='text-red-700 text-sm mt-1'>
            حدث خطأ أثناء معالجة النموذج. يرجى إعادة تحميل الصفحة.
          </p>
        </div>
      }>
      {children}
    </ErrorBoundary>
  );
}

export function ModalErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      fallback={
        <div className='p-6 text-center'>
          <AlertTriangle className='w-12 h-12 text-red-500 mx-auto mb-3' />
          <h3 className='text-lg font-semibold text-gray-900 mb-2'>
            خطأ في النافذة المنبثقة
          </h3>
          <p className='text-gray-600 text-sm'>حدث خطأ أثناء تحميل المحتوى</p>
        </div>
      }>
      {children}
    </ErrorBoundary>
  );
}
