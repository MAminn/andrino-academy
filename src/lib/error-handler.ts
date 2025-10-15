import { NextResponse } from "next/server";

export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
  statusCode: number;
}

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: unknown;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = "INTERNAL_ERROR",
    details?: unknown
  ) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

// Predefined error types
export const ErrorTypes = {
  // Authentication & Authorization
  UNAUTHORIZED: (message = "غير مصرح لك بالوصول") =>
    new AppError(message, 401, "UNAUTHORIZED"),
  FORBIDDEN: (message = "ليس لديك صلاحية للوصول لهذا المورد") =>
    new AppError(message, 403, "FORBIDDEN"),
  INVALID_CREDENTIALS: (
    message = "البريد الإلكتروني أو كلمة المرور غير صحيحة"
  ) => new AppError(message, 401, "INVALID_CREDENTIALS"),
  SESSION_EXPIRED: (message = "انتهت جلسة العمل، يرجى تسجيل الدخول مرة أخرى") =>
    new AppError(message, 401, "SESSION_EXPIRED"),

  // Validation
  VALIDATION_ERROR: (
    message = "البيانات المدخلة غير صحيحة",
    details?: unknown
  ) => new AppError(message, 400, "VALIDATION_ERROR", details),
  MISSING_REQUIRED_FIELD: (field: string) =>
    new AppError(`الحقل مطلوب: ${field}`, 400, "MISSING_REQUIRED_FIELD", {
      field,
    }),
  INVALID_FORMAT: (field: string, format: string) =>
    new AppError(
      `تنسيق غير صحيح لـ ${field}. المطلوب: ${format}`,
      400,
      "INVALID_FORMAT",
      { field, format }
    ),

  // Resource Management
  NOT_FOUND: (resource = "المورد المطلوب") =>
    new AppError(`${resource} غير موجود`, 404, "NOT_FOUND"),
  ALREADY_EXISTS: (resource = "العنصر") =>
    new AppError(`${resource} موجود بالفعل`, 409, "ALREADY_EXISTS"),
  RESOURCE_CONFLICT: (message = "تعارض في البيانات") =>
    new AppError(message, 409, "RESOURCE_CONFLICT"),

  // Business Logic
  INSUFFICIENT_PERMISSIONS: (action = "هذا الإجراء") =>
    new AppError(
      `ليس لديك صلاحية لتنفيذ ${action}`,
      403,
      "INSUFFICIENT_PERMISSIONS"
    ),
  OPERATION_NOT_ALLOWED: (message = "العملية غير مسموحة في الوقت الحالي") =>
    new AppError(message, 400, "OPERATION_NOT_ALLOWED"),
  QUOTA_EXCEEDED: (resource = "الحد المسموح") =>
    new AppError(`تم تجاوز ${resource}`, 429, "QUOTA_EXCEEDED"),

  // External Services
  EXTERNAL_SERVICE_ERROR: (service = "الخدمة الخارجية") =>
    new AppError(`خطأ في ${service}`, 502, "EXTERNAL_SERVICE_ERROR"),
  NETWORK_ERROR: (message = "خطأ في الشبكة") =>
    new AppError(message, 503, "NETWORK_ERROR"),

  // Database
  DATABASE_ERROR: (message = "خطأ في قاعدة البيانات") =>
    new AppError(message, 500, "DATABASE_ERROR"),
  TRANSACTION_FAILED: (message = "فشل في تنفيذ العملية") =>
    new AppError(message, 500, "TRANSACTION_FAILED"),

  // File Operations
  FILE_NOT_FOUND: (filename = "الملف") =>
    new AppError(`${filename} غير موجود`, 404, "FILE_NOT_FOUND"),
  FILE_TOO_LARGE: (maxSize = "الحد المسموح") =>
    new AppError(`حجم الملف يتجاوز ${maxSize}`, 413, "FILE_TOO_LARGE"),
  UNSUPPORTED_FILE_TYPE: (supportedTypes = "الأنواع المدعومة") =>
    new AppError(
      `نوع الملف غير مدعوم. ${supportedTypes}`,
      415,
      "UNSUPPORTED_FILE_TYPE"
    ),
};

// Error handler for API routes
export function handleApiError(error: unknown): NextResponse {
  console.error("API Error:", error);

  // Log error in production
  if (process.env.NODE_ENV === "production") {
    logErrorToService(error);
  }

  // Handle known AppError instances
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
        details: error.details,
      },
      { status: error.statusCode }
    );
  }

  // Handle validation errors (if using Zod or similar)
  if (
    error &&
    typeof error === "object" &&
    "errors" in error &&
    Array.isArray((error as { errors: unknown[] }).errors)
  ) {
    const validationError = error as {
      errors: Array<{
        path: (string | number)[];
        code: string;
        message: string;
      }>;
    };
    const details = validationError.errors.map((err) => ({
      field: err.path.join("."),
      message: getArabicValidationMessage(err),
    }));

    return NextResponse.json(
      {
        error: "البيانات المدخلة غير صحيحة",
        code: "VALIDATION_ERROR",
        details,
      },
      { status: 400 }
    );
  }

  // Handle Prisma errors
  if (error && typeof error === "object" && "code" in error) {
    const prismaError = error as { code: string; message: string };

    switch (prismaError.code) {
      case "P2002":
        return NextResponse.json(
          {
            error: "البيانات موجودة بالفعل",
            code: "DUPLICATE_ERROR",
          },
          { status: 409 }
        );
      case "P2025":
        return NextResponse.json(
          {
            error: "السجل غير موجود",
            code: "NOT_FOUND",
          },
          { status: 404 }
        );
      case "P2003":
        return NextResponse.json(
          {
            error: "لا يمكن حذف هذا السجل لوجود بيانات مرتبطة به",
            code: "FOREIGN_KEY_CONSTRAINT",
          },
          { status: 400 }
        );
      default:
        return NextResponse.json(
          {
            error: "خطأ في قاعدة البيانات",
            code: "DATABASE_ERROR",
          },
          { status: 500 }
        );
    }
  }

  // Handle generic JavaScript errors
  if (error instanceof Error) {
    return NextResponse.json(
      {
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "حدث خطأ داخلي في الخادم",
        code: "INTERNAL_ERROR",
      },
      { status: 500 }
    );
  }

  // Handle unknown errors
  return NextResponse.json(
    {
      error: "حدث خطأ غير متوقع",
      code: "UNKNOWN_ERROR",
    },
    { status: 500 }
  );
}

// Convert Zod error messages to Arabic
function getArabicValidationMessage(error: {
  code: string;
  message: string;
  path: (string | number)[];
}): string {
  const field = error.path.join(".");

  switch (error.code) {
    case "too_small":
      return `${field} قصير جداً`;
    case "too_big":
      return `${field} طويل جداً`;
    case "invalid_email":
      return `${field} ليس بريد إلكتروني صحيح`;
    case "invalid_url":
      return `${field} ليس رابط صحيح`;
    case "invalid_date":
      return `${field} ليس تاريخ صحيح`;
    case "required":
      return `${field} مطلوب`;
    case "invalid_type":
      return `نوع البيانات غير صحيح لـ ${field}`;
    default:
      return error.message;
  }
}

// Error logging service (implement based on your needs)
function logErrorToService(error: unknown) {
  // Example implementation for different services:

  // Sentry
  // Sentry.captureException(error);

  // Custom logging service
  const errorData = {
    message: error instanceof Error ? error.message : "Unknown error",
    stack: error instanceof Error ? error.stack : undefined,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    url: process.env.VERCEL_URL || "localhost",
  };

  console.error("Production Error Logged:", errorData);

  // You could also send to external logging service here
  // Example: POST to logging endpoint
  // fetch('/api/logs', { method: 'POST', body: JSON.stringify(errorData) });
}

// Async error wrapper for API routes
export function asyncErrorHandler(
  handler: (
    req: Request,
    context?: { params: Record<string, string> }
  ) => Promise<NextResponse>
) {
  return async (
    req: Request,
    context?: { params: Record<string, string> }
  ): Promise<NextResponse> => {
    try {
      return await handler(req, context);
    } catch (error) {
      return handleApiError(error);
    }
  };
}

// Client-side error utilities
export const clientErrorUtils = {
  // Handle fetch errors
  handleFetchError: async (response: Response) => {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new AppError(
        errorData.error || "خطأ في الشبكة",
        response.status,
        errorData.code || "FETCH_ERROR",
        errorData.details
      );
    }
    return response;
  },

  // Retry logic for network errors
  retryRequest: async <T>(
    requestFn: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T> => {
    let lastError: Error;

    for (let i = 0; i < maxRetries; i++) {
      try {
        return await requestFn();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error("Unknown error");

        if (i < maxRetries - 1) {
          await new Promise((resolve) =>
            setTimeout(resolve, delay * Math.pow(2, i))
          );
        }
      }
    }

    throw lastError!;
  },

  // Check if error is network-related
  isNetworkError: (error: unknown): boolean => {
    if (error instanceof AppError) {
      return error.code === "NETWORK_ERROR" || error.statusCode >= 500;
    }
    if (error instanceof Error) {
      return (
        error.message.includes("fetch") || error.message.includes("network")
      );
    }
    return false;
  },
};

// Error boundary hook for React components
export function useErrorHandler() {
  const handleError = (error: unknown, context?: string) => {
    console.error(`Error in ${context || "component"}:`, error);

    // You could integrate with error tracking here
    if (process.env.NODE_ENV === "production") {
      logErrorToService(error);
    }
  };

  return { handleError };
}
