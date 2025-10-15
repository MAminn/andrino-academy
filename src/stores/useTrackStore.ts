/**
 * Zustand Store for Track Management
 * Andrino Academy - Centralized state for academic tracks
 */

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { Track } from "@/types/api";

interface TrackStore {
  // State
  tracks: Track[];
  selectedTrack: Track | null;
  loading: boolean;
  error: string | null;

  // Actions
  setTracks: (tracks: Track[]) => void;
  setSelectedTrack: (track: Track | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // API Actions
  fetchTracks: (gradeId?: string) => Promise<void>;
  createTrack: (trackData: Partial<Track>) => Promise<Track | null>;
  updateTrack: (id: string, updates: Partial<Track>) => Promise<Track | null>;
  deleteTrack: (id: string) => Promise<boolean>;

  // Computed selectors
  getTracksByGrade: (gradeId: string) => Track[];
  getTracksByInstructor: (instructorId: string) => Track[];
  getTracksByCoordinator: (coordinatorId: string) => Track[];
  getActiveTracks: () => Track[];

  // Utility actions
  clearError: () => void;
  resetState: () => void;
}

const useTrackStore = create<TrackStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      tracks: [],
      selectedTrack: null,
      loading: false,
      error: null,

      // Basic setters
      setTracks: (tracks) => set({ tracks }),
      setSelectedTrack: (selectedTrack) => set({ selectedTrack }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),

      // API Actions
      fetchTracks: async (gradeId) => {
        set({ loading: true, error: null });
        try {
          const queryParams = gradeId ? `?gradeId=${gradeId}` : "";
          const response = await fetch(`/api/tracks${queryParams}`);

          if (!response.ok) {
            throw new Error("Failed to fetch tracks");
          }

          const { tracks } = await response.json();
          set({ tracks, loading: false });
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "حدث خطأ في تحميل المسارات",
            loading: false,
          });
        }
      },

      createTrack: async (trackData) => {
        set({ loading: true, error: null });
        try {
          const response = await fetch("/api/tracks", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(trackData),
          });

          if (!response.ok) {
            throw new Error("Failed to create track");
          }

          const { track } = await response.json();

          // Update local state
          set((state) => ({
            tracks: [...state.tracks, track],
            loading: false,
          }));

          return track;
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "حدث خطأ في إنشاء المسار",
            loading: false,
          });
          return null;
        }
      },

      updateTrack: async (id, updates) => {
        set({ loading: true, error: null });
        try {
          const response = await fetch(`/api/tracks/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updates),
          });

          if (!response.ok) {
            throw new Error("Failed to update track");
          }

          const { track } = await response.json();

          // Update local state
          set((state) => ({
            tracks: state.tracks.map((t) => (t.id === id ? track : t)),
            selectedTrack:
              state.selectedTrack?.id === id ? track : state.selectedTrack,
            loading: false,
          }));

          return track;
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "حدث خطأ في تحديث المسار",
            loading: false,
          });
          return null;
        }
      },

      deleteTrack: async (id) => {
        set({ loading: true, error: null });
        try {
          const response = await fetch(`/api/tracks/${id}`, {
            method: "DELETE",
          });

          if (!response.ok) {
            throw new Error("Failed to delete track");
          }

          // Update local state
          set((state) => ({
            tracks: state.tracks.filter((t) => t.id !== id),
            selectedTrack:
              state.selectedTrack?.id === id ? null : state.selectedTrack,
            loading: false,
          }));

          return true;
        } catch (error) {
          set({
            error:
              error instanceof Error ? error.message : "حدث خطأ في حذف المسار",
            loading: false,
          });
          return false;
        }
      },

      // Computed selectors
      getTracksByGrade: (gradeId) => {
        return get().tracks.filter((track) => track.gradeId === gradeId);
      },

      getTracksByInstructor: (instructorId) => {
        return get().tracks.filter(
          (track) => track.instructorId === instructorId
        );
      },

      getTracksByCoordinator: (coordinatorId) => {
        return get().tracks.filter(
          (track) => track.coordinatorId === coordinatorId
        );
      },

      getActiveTracks: () => {
        return get().tracks.filter((track) => track.isActive);
      },

      // Utility actions
      clearError: () => set({ error: null }),

      resetState: () =>
        set({
          tracks: [],
          selectedTrack: null,
          loading: false,
          error: null,
        }),
    }),
    {
      name: "track-store", // Devtools identifier
    }
  )
);

export default useTrackStore;
