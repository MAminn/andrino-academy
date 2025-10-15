/**
 * TypeScript interfaces for Andrino Academy API data types
 * Provides type safety for all API responses and requests
 */

// Session related types
export interface LiveSession {
  id: string;
  title: string;
  description?: string;
  trackId: string;
  instructorId: string;
  date: string; // ISO date string
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  externalLink?: string;
  status: SessionStatus;
  materials?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;

  // Relations (when included)
  track?: Track;
  instructor?: User;
  attendances?: SessionAttendance[];
  _count?: {
    attendances: number;
  };
}

export interface SessionCreateData {
  title: string;
  description?: string;
  trackId: string;
  instructorId: string;
  date: string;
  startTime: string;
  endTime: string;
  materials?: string;
  notes?: string;
}

export interface SessionUpdateData {
  title?: string;
  description?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  externalLink?: string;
  materials?: string;
  notes?: string;
  status?: SessionStatus;
}

export type SessionStatus =
  | "DRAFT"
  | "SCHEDULED"
  | "READY"
  | "ACTIVE"
  | "PAUSED"
  | "COMPLETED"
  | "CANCELLED";

// Track related types
export interface Track {
  id: string;
  name: string;
  description?: string;
  gradeId: string;
  instructorId: string;
  coordinatorId: string;
  isActive: boolean;
  order?: number;
  createdAt: string;
  updatedAt: string;

  // Relations (when included)
  grade?: Grade;
  instructor?: User;
  coordinator?: User;
  liveSessions?: LiveSession[];
  _count?: {
    liveSessions: number;
  };
}

export interface TrackCreateData {
  name: string;
  description?: string;
  gradeId: string;
  instructorId: string;
  coordinatorId: string;
  order?: number;
}

export interface TrackUpdateData {
  name?: string;
  description?: string;
  gradeId?: string;
  instructorId?: string;
  coordinatorId?: string;
  isActive?: boolean;
  order?: number;
}

// Grade related types
export interface Grade {
  id: string;
  name: string;
  description?: string;
  order?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;

  // Relations (when included)
  students?: User[];
  tracks?: Track[];
  _count?: {
    students: number;
    tracks: number;
  };
}

export interface GradeCreateData {
  name: string;
  description?: string;
  order?: number;
}

export interface GradeUpdateData {
  name?: string;
  description?: string;
  order?: number;
  isActive?: boolean;
}

// User related types
export interface User {
  id: string;
  name?: string;
  email: string;
  role: UserRole;
  image?: string;

  // Student specific fields
  age?: number;
  parentEmail?: string;
  parentPhone?: string;
  parentName?: string;
  priorExperience?: string;
  gradeLevel?: string;
  gradeId?: string;

  // Profile fields
  phone?: string;
  address?: string;
  emergencyContact?: string;

  createdAt: string;
  updatedAt: string;

  // Relations (when included)
  assignedGrade?: Grade;
}

export type UserRole =
  | "student"
  | "instructor"
  | "coordinator"
  | "manager"
  | "ceo";

// Attendance related types
export interface SessionAttendance {
  id: string;
  sessionId: string;
  studentId: string;
  status: AttendanceStatus;
  markedAt: string;
  markedBy?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;

  // Relations (when included)
  session?: LiveSession;
  student?: User;
}

export type AttendanceStatus = "present" | "absent" | "late" | "excused";

// API Filter types
export interface SessionFilters {
  date?: string;
  gradeId?: string;
  trackId?: string;
  instructorId?: string;
  status?: SessionStatus;
}

export interface TrackFilters {
  gradeId?: string;
  instructorId?: string;
  coordinatorId?: string;
  isActive?: boolean;
}

export interface UserFilters {
  role?: UserRole;
  gradeId?: string;
  unassigned?: boolean;
}

// API Response wrapper types
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

// Common operation results
export interface DeleteResult {
  success: boolean;
  message: string;
}

export interface BulkOperationResult {
  success: boolean;
  processed: number;
  errors?: string[];
}
