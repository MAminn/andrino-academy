/**
 * Zustand Store for Module Management
 * Andrino Academy - Centralized state for Course Content Modules
 */

import { create } from "zustand";
import { devtools } from "zustand/middleware";

export type ModuleType = "VIDEO" | "PDF" | "DOCUMENT" | "IMAGE";
export type ModuleCategory =
  | "LECTURE"
  | "TUTORIAL"
  | "EXERCISE"
  | "REFERENCE"
  | "SLIDES"
  | "HANDOUT"
  | "ASSIGNMENT"
  | "SOLUTION"
  | "SUPPLEMENTARY"
  | "UNCATEGORIZED";

export interface Module {
  id: string;
  title: string;
  description: string | null;
  type: ModuleType;
  category: ModuleCategory;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  duration: number | null;
  order: number;
  isPublished: boolean;
  trackId: string;
  sessionId: string | null;
  uploadedBy: string;
  createdAt: string;
  updatedAt: string;
  weekNumber?: number | null;  // Week number for scheduled content
  startDate?: string | null;   // Start date for week visibility
  track?: {
    id: string;
    name: string;
    gradeId: string;
  };
  session?: {
    id: string;
    title: string;
    date: string;
  };
}

interface ModuleStore {
  // State
  modules: Module[];
  selectedModule: Module | null;
  loading: boolean;
  uploading: boolean;
  uploadProgress: number;
  error: string | null;

  // Actions
  setModules: (modules: Module[]) => void;
  setSelectedModule: (module: Module | null) => void;
  setLoading: (loading: boolean) => void;
  setUploading: (uploading: boolean) => void;
  setUploadProgress: (progress: number) => void;
  setError: (error: string | null) => void;

  // API Actions
  fetchModules: (filters?: {
    trackId?: string;
    sessionId?: string;
    type?: ModuleType;
    category?: ModuleCategory;
    isPublished?: boolean;
    skipDateFilter?: boolean; // For managers to see all weeks including future
  }) => Promise<void>;
  createModule: (formData: FormData) => Promise<Module | null>;
  updateModule: (id: string, updates: Partial<Module>) => Promise<Module | null>;
  deleteModule: (id: string) => Promise<boolean>;
  togglePublish: (id: string) => Promise<Module | null>;

  // Computed selectors
  getModulesByTrack: (trackId: string) => Module[];
  getModulesBySession: (sessionId: string) => Module[];
  getModulesByType: (type: ModuleType) => Module[];
  getModulesByCategory: (category: ModuleCategory) => Module[];
  getPublishedModules: () => Module[];
  getVideoModules: () => Module[];

  // Utility actions
  clearError: () => void;
  resetState: () => void;
}

const useModuleStore = create<ModuleStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      modules: [],
      selectedModule: null,
      loading: false,
      uploading: false,
      uploadProgress: 0,
      error: null,

      // Basic setters
      setModules: (modules) => set({ modules }),
      setSelectedModule: (selectedModule) => set({ selectedModule }),
      setLoading: (loading) => set({ loading }),
      setUploading: (uploading) => set({ uploading }),
      setUploadProgress: (uploadProgress) => set({ uploadProgress }),
      setError: (error) => set({ error }),

      // API Actions
      fetchModules: async (filters = {}) => {
        set({ loading: true, error: null });
        try {
          const queryParams = new URLSearchParams();
          if (filters.trackId) queryParams.append("trackId", filters.trackId);
          if (filters.sessionId) queryParams.append("sessionId", filters.sessionId);
          if (filters.type) queryParams.append("type", filters.type);
          if (filters.category) queryParams.append("category", filters.category);
          if (filters.isPublished !== undefined)
            queryParams.append("isPublished", String(filters.isPublished));

          const response = await fetch(`/api/modules?${queryParams}`);

          if (!response.ok) {
            throw new Error("Failed to fetch modules");
          }

          const data = await response.json();
          
          // Filter out future weeks (modules with startDate > now) UNLESS skipDateFilter is true (for managers)
          let availableModules = data.modules;
          if (!filters.skipDateFilter) {
            const now = new Date();
            availableModules = data.modules.filter((module: any) => 
              !module.startDate || new Date(module.startDate) <= now
            );
          }
          
          set({ modules: availableModules, loading: false });
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Unknown error";
          set({ error: errorMessage, loading: false });
          console.error("Error fetching modules:", error);
        }
      },

      createModule: async (formData: FormData) => {
        set({ uploading: true, uploadProgress: 0, error: null });
        try {
          const response = await fetch("/api/modules", {
            method: "POST",
            body: formData,
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to create module");
          }

          const data = await response.json();
          const newModule = data.module;

          // Add to modules list
          set((state) => ({
            modules: [...state.modules, newModule],
            uploading: false,
            uploadProgress: 100,
          }));

          return newModule;
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Unknown error";
          set({ error: errorMessage, uploading: false, uploadProgress: 0 });
          console.error("Error creating module:", error);
          return null;
        }
      },

      updateModule: async (id: string, updates: Partial<Module>) => {
        set({ loading: true, error: null });
        try {
          const response = await fetch(`/api/modules/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updates),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to update module");
          }

          const data = await response.json();
          const updatedModule = data.module;

          // Update in modules list
          set((state) => ({
            modules: state.modules.map((m) =>
              m.id === id ? updatedModule : m
            ),
            selectedModule:
              state.selectedModule?.id === id
                ? updatedModule
                : state.selectedModule,
            loading: false,
          }));

          return updatedModule;
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Unknown error";
          set({ error: errorMessage, loading: false });
          console.error("Error updating module:", error);
          return null;
        }
      },

      deleteModule: async (id: string) => {
        set({ loading: true, error: null });
        try {
          const response = await fetch(`/api/modules/${id}`, {
            method: "DELETE",
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to delete module");
          }

          // Remove from modules list
          set((state) => ({
            modules: state.modules.filter((m) => m.id !== id),
            selectedModule:
              state.selectedModule?.id === id ? null : state.selectedModule,
            loading: false,
          }));

          return true;
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Unknown error";
          set({ error: errorMessage, loading: false });
          console.error("Error deleting module:", error);
          return false;
        }
      },

      togglePublish: async (id: string) => {
        const module = get().modules.find((m) => m.id === id);
        if (!module) return null;

        return get().updateModule(id, { isPublished: !module.isPublished });
      },

      // Computed selectors
      getModulesByTrack: (trackId: string) => {
        return get().modules.filter((m) => m.trackId === trackId);
      },

      getModulesBySession: (sessionId: string) => {
        return get().modules.filter((m) => m.sessionId === sessionId);
      },

      getModulesByType: (type: ModuleType) => {
        return get().modules.filter((m) => m.type === type);
      },

      getModulesByCategory: (category: ModuleCategory) => {
        return get().modules.filter((m) => m.category === category);
      },

      getPublishedModules: () => {
        return get().modules.filter((m) => m.isPublished);
      },

      getVideoModules: () => {
        return get().modules.filter((m) => m.type === "VIDEO");
      },

      // Utility actions
      clearError: () => set({ error: null }),
      resetState: () =>
        set({
          modules: [],
          selectedModule: null,
          loading: false,
          uploading: false,
          uploadProgress: 0,
          error: null,
        }),
    }),
    { name: "ModuleStore" }
  )
);

export default useModuleStore;
