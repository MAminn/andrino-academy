/**
 * Zustand Store for Grade Management
 * Andrino Academy - Centralized state for academic grades
 */

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { Grade } from "@/types/api";

interface GradeStore {
  // State
  grades: Grade[];
  selectedGrade: Grade | null;
  loading: boolean;
  error: string | null;

  // Actions
  setGrades: (grades: Grade[]) => void;
  setSelectedGrade: (grade: Grade | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // API Actions
  fetchGrades: () => Promise<void>;
  createGrade: (gradeData: Partial<Grade>) => Promise<Grade | null>;
  updateGrade: (id: string, updates: Partial<Grade>) => Promise<Grade | null>;
  deleteGrade: (id: string) => Promise<boolean>;

  // Computed selectors
  getActiveGrades: () => Grade[];
  getGradeById: (id: string) => Grade | undefined;
  getGradeByOrder: (order: number) => Grade | undefined;

  // Utility actions
  clearError: () => void;
  resetState: () => void;
}

const useGradeStore = create<GradeStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      grades: [],
      selectedGrade: null,
      loading: false,
      error: null,

      // Basic setters
      setGrades: (grades) => set({ grades }),
      setSelectedGrade: (selectedGrade) => set({ selectedGrade }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),

      // API Actions
      fetchGrades: async () => {
        set({ loading: true, error: null });
        try {
          const response = await fetch("/api/grades");

          if (!response.ok) {
            throw new Error("Failed to fetch grades");
          }

          const { grades } = await response.json();
          set({ grades, loading: false });
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "حدث خطأ في تحميل المستويات",
            loading: false,
          });
        }
      },

      createGrade: async (gradeData) => {
        set({ loading: true, error: null });
        try {
          const response = await fetch("/api/grades", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(gradeData),
          });

          if (!response.ok) {
            throw new Error("Failed to create grade");
          }

          const { grade } = await response.json();

          // Update local state
          set((state) => ({
            grades: [...state.grades, grade].sort(
              (a, b) => (a.order || 0) - (b.order || 0)
            ),
            loading: false,
          }));

          return grade;
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "حدث خطأ في إنشاء المستوى",
            loading: false,
          });
          return null;
        }
      },

      updateGrade: async (id, updates) => {
        set({ loading: true, error: null });
        try {
          const response = await fetch(`/api/grades/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updates),
          });

          if (!response.ok) {
            throw new Error("Failed to update grade");
          }

          const { grade } = await response.json();

          // Update local state
          set((state) => ({
            grades: state.grades
              .map((g) => (g.id === id ? grade : g))
              .sort((a, b) => (a.order || 0) - (b.order || 0)),
            selectedGrade:
              state.selectedGrade?.id === id ? grade : state.selectedGrade,
            loading: false,
          }));

          return grade;
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "حدث خطأ في تحديث المستوى",
            loading: false,
          });
          return null;
        }
      },

      deleteGrade: async (id) => {
        set({ loading: true, error: null });
        try {
          const response = await fetch(`/api/grades/${id}`, {
            method: "DELETE",
          });

          if (!response.ok) {
            throw new Error("Failed to delete grade");
          }

          // Update local state
          set((state) => ({
            grades: state.grades.filter((g) => g.id !== id),
            selectedGrade:
              state.selectedGrade?.id === id ? null : state.selectedGrade,
            loading: false,
          }));

          return true;
        } catch (error) {
          set({
            error:
              error instanceof Error ? error.message : "حدث خطأ في حذف المستوى",
            loading: false,
          });
          return false;
        }
      },

      // Computed selectors
      getActiveGrades: () => {
        return get().grades.filter((grade) => grade.isActive);
      },

      getGradeById: (id) => {
        return get().grades.find((grade) => grade.id === id);
      },

      getGradeByOrder: (order) => {
        return get().grades.find((grade) => grade.order === order);
      },

      // Utility actions
      clearError: () => set({ error: null }),

      resetState: () =>
        set({
          grades: [],
          selectedGrade: null,
          loading: false,
          error: null,
        }),
    }),
    {
      name: "grade-store", // Devtools identifier
    }
  )
);

export default useGradeStore;
