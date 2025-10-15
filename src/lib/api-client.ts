/**
 * Frontend API Client Utilities
 * Handles standardized API response format from Andrino Academy APIs
 */

import { useState } from "react";
import {
  APIResponse,
  PaginatedResponse,
  LiveSession,
  SessionUpdateData,
  SessionFilters,
  Track,
  TrackCreateData,
  TrackUpdateData,
  TrackFilters,
  Grade,
  GradeCreateData,
  DeleteResult,
} from "@/types/api";

export class APIError extends Error {
  public status: number;
  public details?: Record<string, unknown>;

  constructor(
    message: string,
    status: number,
    details?: Record<string, unknown>
  ) {
    super(message);
    this.name = "APIError";
    this.status = status;
    this.details = details;
  }
}

/**
 * Enhanced fetch wrapper that handles standardized API responses
 */
export async function apiCall<T = unknown>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  try {
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    const data: APIResponse<T> = await response.json();

    if (!response.ok || !data.success) {
      throw new APIError(
        data.error || "خطأ في الطلب",
        response.status,
        data.details
      );
    }

    return data.data as T;
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }

    // Network or parsing error
    throw new APIError("خطأ في الاتصال بالخادم", 0, { originalError: error });
  }
}

/**
 * Handles paginated API responses
 */
export async function apiCallPaginated<T = unknown>(
  url: string,
  options: RequestInit = {}
): Promise<{ data: T[]; pagination: PaginatedResponse["pagination"] }> {
  try {
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    const result: PaginatedResponse<T[]> = await response.json();

    if (!response.ok || !result.success) {
      throw new APIError(
        result.error || "خطأ في الطلب",
        response.status,
        result.details
      );
    }

    return {
      data: result.data || [],
      pagination: result.pagination,
    };
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }

    throw new APIError("خطأ في الاتصال بالخادم", 0, { originalError: error });
  }
}

/**
 * Session Management API calls
 */
export const sessionAPI = {
  async getSession(sessionId: string) {
    return apiCall<LiveSession>(`/api/sessions/${sessionId}`);
  },

  async updateSession(sessionId: string, data: SessionUpdateData) {
    return apiCall<LiveSession>(`/api/sessions/${sessionId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  async updateSessionLink(sessionId: string, externalLink: string) {
    return apiCall<LiveSession>(`/api/sessions/${sessionId}`, {
      method: "PATCH",
      body: JSON.stringify({ externalLink }),
    });
  },

  async deleteSession(sessionId: string) {
    return apiCall<DeleteResult>(`/api/sessions/${sessionId}`, {
      method: "DELETE",
    });
  },

  async getSessions(filters?: SessionFilters) {
    const params = new URLSearchParams();
    if (filters?.date) params.append("date", filters.date);
    if (filters?.gradeId) params.append("gradeId", filters.gradeId);
    if (filters?.trackId) params.append("trackId", filters.trackId);
    if (filters?.instructorId)
      params.append("instructorId", filters.instructorId);
    if (filters?.status) params.append("status", filters.status);

    const url = `/api/sessions${
      params.toString() ? `?${params.toString()}` : ""
    }`;
    return apiCall<LiveSession[]>(url);
  },
};

/**
 * Track Management API calls
 */
export const trackAPI = {
  async getTracks(filters?: TrackFilters) {
    const params = new URLSearchParams();
    if (filters?.gradeId) params.append("gradeId", filters.gradeId);
    if (filters?.instructorId)
      params.append("instructorId", filters.instructorId);
    if (filters?.coordinatorId)
      params.append("coordinatorId", filters.coordinatorId);
    if (filters?.isActive !== undefined)
      params.append("isActive", filters.isActive.toString());

    const url = `/api/tracks${
      params.toString() ? `?${params.toString()}` : ""
    }`;
    return apiCall<Track[]>(url);
  },

  async getTrack(trackId: string) {
    return apiCall<Track>(`/api/tracks/${trackId}`);
  },

  async createTrack(data: TrackCreateData) {
    return apiCall<Track>("/api/tracks", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async updateTrack(trackId: string, data: TrackUpdateData) {
    return apiCall<Track>(`/api/tracks/${trackId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  async deleteTrack(trackId: string) {
    return apiCall<DeleteResult>(`/api/tracks/${trackId}`, {
      method: "DELETE",
    });
  },
};

/**
 * Grade Management API calls
 */
export const gradeAPI = {
  async getGrades() {
    return apiCall<Grade[]>("/api/grades");
  },

  async createGrade(data: GradeCreateData) {
    return apiCall<Grade>("/api/grades", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};

/**
 * React hook for API calls with loading and error states
 */
export function useAPICall<T = unknown>() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = async (apiFunction: () => Promise<T>): Promise<T | null> => {
    setLoading(true);
    setError(null);

    try {
      const result = await apiFunction();
      return result;
    } catch (err) {
      const apiError = err as APIError;
      setError(apiError.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { execute, loading, error };
}
