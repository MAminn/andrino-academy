/**
 * Zustand Store for User Management
 * Andrino Academy - Centralized state for users, students, and instructors
 */

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { User, UserRole } from "@/types/api";

interface UserStore {
  // State
  users: User[];
  students: User[];
  instructors: User[];
  unassignedStudents: User[];
  selectedUser: User | null;
  loading: boolean;
  error: string | null;

  // Actions
  setUsers: (users: User[]) => void;
  setStudents: (students: User[]) => void;
  setInstructors: (instructors: User[]) => void;
  setUnassignedStudents: (students: User[]) => void;
  setSelectedUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // API Actions
  fetchUsers: (role?: UserRole) => Promise<void>;
  fetchStudents: (gradeId?: string) => Promise<void>;
  fetchInstructors: () => Promise<void>;
  fetchUnassignedStudents: () => Promise<void>;
  createUser: (userData: Partial<User>) => Promise<User | null>;
  updateUser: (id: string, updates: Partial<User>) => Promise<User | null>;
  deleteUser: (id: string) => Promise<boolean>;
  assignStudentToGrade: (
    studentId: string,
    gradeId: string
  ) => Promise<boolean>;

  // Computed selectors
  getUsersByRole: (role: UserRole) => User[];
  getStudentsByGrade: (gradeId: string) => User[];
  getInstructorsByTrack: (trackId: string) => User[];

  // Utility actions
  clearError: () => void;
  resetState: () => void;
}

const useUserStore = create<UserStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      users: [],
      students: [],
      instructors: [],
      unassignedStudents: [],
      selectedUser: null,
      loading: false,
      error: null,

      // Basic setters
      setUsers: (users) => set({ users }),
      setStudents: (students) => set({ students }),
      setInstructors: (instructors) => set({ instructors }),
      setUnassignedStudents: (unassignedStudents) =>
        set({ unassignedStudents }),
      setSelectedUser: (selectedUser) => set({ selectedUser }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),

      // API Actions
      fetchUsers: async (role) => {
        set({ loading: true, error: null });
        try {
          const queryParams = role ? `?role=${role}` : "";
          const response = await fetch(`/api/users${queryParams}`);

          if (!response.ok) {
            throw new Error("Failed to fetch users");
          }

          const { users } = await response.json();
          set({ users, loading: false });
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "حدث خطأ في تحميل المستخدمين",
            loading: false,
          });
        }
      },

      fetchStudents: async (gradeId) => {
        set({ loading: true, error: null });
        try {
          const queryParams = new URLSearchParams();
          queryParams.append("role", "student");
          if (gradeId) queryParams.append("gradeId", gradeId);

          const response = await fetch(
            `/api/students?${queryParams.toString()}`
          );

          if (!response.ok) {
            throw new Error("Failed to fetch students");
          }

          const { students } = await response.json();
          set({ students, loading: false });
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "حدث خطأ في تحميل الطلاب",
            loading: false,
          });
        }
      },

      fetchInstructors: async () => {
        set({ loading: true, error: null });
        try {
          const response = await fetch("/api/users?role=instructor");

          if (!response.ok) {
            throw new Error("Failed to fetch instructors");
          }

          const { users } = await response.json();
          set({ instructors: users, loading: false });
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "حدث خطأ في تحميل المدربين",
            loading: false,
          });
        }
      },

      fetchUnassignedStudents: async () => {
        set({ loading: true, error: null });
        try {
          const response = await fetch("/api/students?unassigned=true");

          if (!response.ok) {
            throw new Error("Failed to fetch unassigned students");
          }

          const { students } = await response.json();
          set({ unassignedStudents: students, loading: false });
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "حدث خطأ في تحميل الطلاب غير المسجلين",
            loading: false,
          });
        }
      },

      createUser: async (userData) => {
        set({ loading: true, error: null });
        try {
          const response = await fetch("/api/users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(userData),
          });

          if (!response.ok) {
            throw new Error("Failed to create user");
          }

          const { user } = await response.json();

          // Update local state based on user role
          set((state) => {
            const newState = { ...state, loading: false };

            if (user.role === "student") {
              newState.students = [...state.students, user];
              if (!user.gradeId) {
                newState.unassignedStudents = [
                  ...state.unassignedStudents,
                  user,
                ];
              }
            } else if (user.role === "instructor") {
              newState.instructors = [...state.instructors, user];
            }

            newState.users = [...state.users, user];
            return newState;
          });

          return user;
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "حدث خطأ في إنشاء المستخدم",
            loading: false,
          });
          return null;
        }
      },

      updateUser: async (id, updates) => {
        set({ loading: true, error: null });
        try {
          const response = await fetch(`/api/users/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updates),
          });

          if (!response.ok) {
            throw new Error("Failed to update user");
          }

          const { user } = await response.json();

          // Update local state
          set((state) => ({
            users: state.users.map((u) => (u.id === id ? user : u)),
            students: state.students.map((u) => (u.id === id ? user : u)),
            instructors: state.instructors.map((u) => (u.id === id ? user : u)),
            unassignedStudents: state.unassignedStudents.map((u) =>
              u.id === id ? user : u
            ),
            selectedUser:
              state.selectedUser?.id === id ? user : state.selectedUser,
            loading: false,
          }));

          return user;
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "حدث خطأ في تحديث المستخدم",
            loading: false,
          });
          return null;
        }
      },

      deleteUser: async (id) => {
        set({ loading: true, error: null });
        try {
          const response = await fetch(`/api/users/${id}`, {
            method: "DELETE",
          });

          if (!response.ok) {
            throw new Error("Failed to delete user");
          }

          // Update local state
          set((state) => ({
            users: state.users.filter((u) => u.id !== id),
            students: state.students.filter((u) => u.id !== id),
            instructors: state.instructors.filter((u) => u.id !== id),
            unassignedStudents: state.unassignedStudents.filter(
              (u) => u.id !== id
            ),
            selectedUser:
              state.selectedUser?.id === id ? null : state.selectedUser,
            loading: false,
          }));

          return true;
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "حدث خطأ في حذف المستخدم",
            loading: false,
          });
          return false;
        }
      },

      assignStudentToGrade: async (studentId, gradeId) => {
        set({ loading: true, error: null });
        try {
          const response = await fetch("/api/students/assign-grade", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ studentId, gradeId }),
          });

          if (!response.ok) {
            throw new Error("Failed to assign student to grade");
          }

          // Update local state
          set((state) => {
            const updatedStudents = state.students.map((student) =>
              student.id === studentId ? { ...student, gradeId } : student
            );

            const updatedUnassigned = state.unassignedStudents.filter(
              (student) => student.id !== studentId
            );

            return {
              ...state,
              students: updatedStudents,
              unassignedStudents: updatedUnassigned,
              loading: false,
            };
          });

          return true;
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "حدث خطأ في تسجيل الطالب",
            loading: false,
          });
          return false;
        }
      },

      // Computed selectors
      getUsersByRole: (role) => {
        return get().users.filter((user) => user.role === role);
      },

      getStudentsByGrade: (gradeId) => {
        return get().students.filter((student) => student.gradeId === gradeId);
      },

      getInstructorsByTrack: () => {
        // This would need track data to filter instructors
        // For now, return all instructors
        return get().instructors;
      },

      // Utility actions
      clearError: () => set({ error: null }),

      resetState: () =>
        set({
          users: [],
          students: [],
          instructors: [],
          unassignedStudents: [],
          selectedUser: null,
          loading: false,
          error: null,
        }),
    }),
    {
      name: "user-store", // Devtools identifier
    }
  )
);

export default useUserStore;
