/**
 * Zustand Stores Index
 * Andrino Academy - Centralized store exports
 */

// Data stores
export { default as useSessionStore } from "./useSessionStore";
export { default as useTrackStore } from "./useTrackStore";
export { default as useUserStore } from "./useUserStore";
export { default as useGradeStore } from "./useGradeStore";

// UI store
export { default as useUIStore } from "./useUIStore";

// Type exports for store interfaces
export type { default as SessionStore } from "./useSessionStore";
export type { default as TrackStore } from "./useTrackStore";
export type { default as UserStore } from "./useUserStore";
export type { default as GradeStore } from "./useGradeStore";
export type { default as UIStore } from "./useUIStore";
