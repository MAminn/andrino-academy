/**
 * Standardized API Response Utilities
 * Ensures consistent response format across all Andrino Academy APIs
 */

import { NextResponse } from "next/server";

export interface APIResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  details?: Record<string, unknown>;
  timestamp: string;
}

export interface PaginatedResponse<T = unknown> extends APIResponse<T> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Creates a successful API response
 */
export function createSuccessResponse<T>(
  data: T,
  message?: string,
  status: number = 200
): NextResponse {
  const response: APIResponse<T> = {
    success: true,
    data,
    message,
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(response, { status });
}

/**
 * Creates a paginated success response
 */
export function createPaginatedResponse<T>(
  data: T[],
  pagination: {
    page: number;
    limit: number;
    total: number;
  },
  message?: string,
  status: number = 200
): NextResponse {
  const response: PaginatedResponse<T[]> = {
    success: true,
    data,
    message,
    pagination: {
      ...pagination,
      totalPages: Math.ceil(pagination.total / pagination.limit),
    },
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(response, { status });
}

/**
 * Creates an error API response
 */
export function createErrorResponse(
  error: string,
  status: number = 400,
  details?: Record<string, unknown>
): NextResponse {
  const response: APIResponse = {
    success: false,
    error,
    details,
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(response, { status });
}

/**
 * Common error responses
 */
export const ErrorResponses = {
  unauthorized: () => createErrorResponse("غير مصرح للوصول", 401),
  forbidden: () => createErrorResponse("ممنوع الوصول", 403),
  notFound: (resource: string = "المورد") =>
    createErrorResponse(`${resource} غير موجود`, 404),
  badRequest: (message: string = "طلب غير صحيح") =>
    createErrorResponse(message, 400),
  internalError: () => createErrorResponse("خطأ داخلي في الخادم", 500),
  validationError: (details: Record<string, unknown>) =>
    createErrorResponse("خطأ في التحقق من البيانات", 400, details),
};

/**
 * Wrapper for database operations with error handling
 */
export async function withDatabaseErrorHandling<T>(
  operation: () => Promise<T>
): Promise<T | NextResponse> {
  try {
    return await operation();
  } catch (error) {
    console.error("Database operation failed:", error);
    return ErrorResponses.internalError();
  }
}

/**
 * Validates request body and returns typed data or error response
 */
export function validateRequestBody<T>(
  body: Record<string, unknown>,
  requiredFields: string[]
): { isValid: true; data: T } | { isValid: false; response: NextResponse } {
  const missingFields = requiredFields.filter(
    (field) =>
      body[field] === undefined || body[field] === null || body[field] === ""
  );

  if (missingFields.length > 0) {
    return {
      isValid: false,
      response: createErrorResponse(
        `الحقول المطلوبة مفقودة: ${missingFields.join(", ")}`,
        400,
        { missingFields }
      ),
    };
  }

  return { isValid: true, data: body as T };
}

/**
 * Standard permission check wrapper
 */
export function checkPermissions(
  userRole: string,
  allowedRoles: string[]
): NextResponse | null {
  if (!allowedRoles.includes(userRole)) {
    return ErrorResponses.forbidden();
  }
  return null;
}
