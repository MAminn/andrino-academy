/**
 * Zustand Store for Session Management
 * Andrino Academy - Centralized state for LiveSessions
 */

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { LiveSession, SessionStatus } from "@/types/api";

interface SessionStore {
  // State
  sessions: LiveSession[];
  todaySessions: LiveSession[];
  upcomingSessions: LiveSession[];
  selectedSession: LiveSession | null;
  loading: boolean;
  error: string | null;

  // Actions
  setSessions: (sessions: LiveSession[]) => void;
  setTodaySessions: (sessions: LiveSession[]) => void;
  setUpcomingSessions: (sessions: LiveSession[]) => void;
  setSelectedSession: (session: LiveSession | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // API Actions
  fetchSessions: (filters?: {
    trackId?: string;
    instructorId?: string;
    status?: SessionStatus;
  }) => Promise<void>;
  fetchTodaySessions: () => Promise<void>;
  fetchUpcomingSessions: () => Promise<void>;
  createSession: (
    sessionData: Partial<LiveSession>
  ) => Promise<LiveSession | null>;
  updateSession: (
    id: string,
    updates: Partial<LiveSession>
  ) => Promise<LiveSession | null>;
  deleteSession: (id: string) => Promise<boolean>;

  // Computed selectors
  getSessionsByTrack: (trackId: string) => LiveSession[];
  getSessionsByInstructor: (instructorId: string) => LiveSession[];
  getSessionsByStatus: (status: SessionStatus) => LiveSession[];

  // Utility actions
  clearError: () => void;
  resetState: () => void;
}

const useSessionStore = create<SessionStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      sessions: [],
      todaySessions: [],
      upcomingSessions: [],
      selectedSession: null,
      loading: false,
      error: null,

      // Basic setters
      setSessions: (sessions) => set({ sessions }),
      setTodaySessions: (todaySessions) => set({ todaySessions }),
      setUpcomingSessions: (upcomingSessions) => set({ upcomingSessions }),
      setSelectedSession: (selectedSession) => set({ selectedSession }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),

      // API Actions
      fetchSessions: async (filters = {}) => {
        set({ loading: true, error: null });
        try {
          const queryParams = new URLSearchParams();
          if (filters.trackId) queryParams.append("trackId", filters.trackId);
          if (filters.instructorId)
            queryParams.append("instructorId", filters.instructorId);
          if (filters.status) queryParams.append("status", filters.status);

          const response = await fetch(
            `/api/sessions?${queryParams.toString()}`
          );
          if (!response.ok) {
            throw new Error("Failed to fetch sessions");
          }

          const { sessions } = await response.json();
          set({ sessions, loading: false });
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "حدث خطأ في تحميل الجلسات",
            loading: false,
          });
        }
      },

      fetchTodaySessions: async () => {
        set({ loading: true, error: null });
        try {
          const response = await fetch("/api/sessions?today=true");
          if (!response.ok) {
            throw new Error("Failed to fetch today sessions");
          }

          const { sessions } = await response.json();
          set({ todaySessions: sessions, loading: false });
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "حدث خطأ في تحميل جلسات اليوم",
            loading: false,
          });
        }
      },

      fetchUpcomingSessions: async () => {
        set({ loading: true, error: null });
        try {
          const response = await fetch("/api/sessions?upcoming=true");
          if (!response.ok) {
            throw new Error("Failed to fetch upcoming sessions");
          }

          const { sessions } = await response.json();
          set({ upcomingSessions: sessions, loading: false });
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "حدث خطأ في تحميل الجلسات القادمة",
            loading: false,
          });
        }
      },

      createSession: async (sessionData) => {
        set({ loading: true, error: null });
        try {
          const response = await fetch("/api/sessions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(sessionData),
          });

          if (!response.ok) {
            throw new Error("Failed to create session");
          }

          const { session } = await response.json();

          // Update local state
          set((state) => ({
            sessions: [...state.sessions, session],
            loading: false,
          }));

          return session;
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "حدث خطأ في إنشاء الجلسة",
            loading: false,
          });
          return null;
        }
      },

      updateSession: async (id, updates) => {
        set({ loading: true, error: null });
        try {
          const response = await fetch(`/api/sessions/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updates),
          });

          if (!response.ok) {
            throw new Error("Failed to update session");
          }

          const { session } = await response.json();

          // Update local state
          set((state) => ({
            sessions: state.sessions.map((s) => (s.id === id ? session : s)),
            todaySessions: state.todaySessions.map((s) =>
              s.id === id ? session : s
            ),
            upcomingSessions: state.upcomingSessions.map((s) =>
              s.id === id ? session : s
            ),
            selectedSession:
              state.selectedSession?.id === id
                ? session
                : state.selectedSession,
            loading: false,
          }));

          return session;
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "حدث خطأ في تحديث الجلسة",
            loading: false,
          });
          return null;
        }
      },

      deleteSession: async (id) => {
        set({ loading: true, error: null });
        try {
          const response = await fetch(`/api/sessions/${id}`, {
            method: "DELETE",
          });

          if (!response.ok) {
            throw new Error("Failed to delete session");
          }

          // Update local state
          set((state) => ({
            sessions: state.sessions.filter((s) => s.id !== id),
            todaySessions: state.todaySessions.filter((s) => s.id !== id),
            upcomingSessions: state.upcomingSessions.filter((s) => s.id !== id),
            selectedSession:
              state.selectedSession?.id === id ? null : state.selectedSession,
            loading: false,
          }));

          return true;
        } catch (error) {
          set({
            error:
              error instanceof Error ? error.message : "حدث خطأ في حذف الجلسة",
            loading: false,
          });
          return false;
        }
      },

      // Computed selectors
      getSessionsByTrack: (trackId) => {
        return get().sessions.filter((session) => session.trackId === trackId);
      },

      getSessionsByInstructor: (instructorId) => {
        return get().sessions.filter(
          (session) => session.instructorId === instructorId
        );
      },

      getSessionsByStatus: (status) => {
        return get().sessions.filter((session) => session.status === status);
      },

      // Utility actions
      clearError: () => set({ error: null }),

      resetState: () =>
        set({
          sessions: [],
          todaySessions: [],
          upcomingSessions: [],
          selectedSession: null,
          loading: false,
          error: null,
        }),
    }),
    {
      name: "session-store", // Devtools identifier
    }
  )
);

export default useSessionStore;
