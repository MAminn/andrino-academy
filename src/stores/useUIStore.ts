/**
 * Zustand Store for UI State Management
 * Andrino Academy - Centralized state for modal states, loading, and UI interactions
 */

import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface UIStore {
  // Modal states
  modals: {
    // Session modals
    sessionModal: boolean;
    sessionLinkModal: boolean;
    attendanceModal: boolean;
    sessionControlModal: boolean;

    // Track modals
    trackModal: boolean;
    trackAssignmentModal: boolean;

    // Grade modals
    gradeModal: boolean;
    gradeAssignmentModal: boolean;

    // User modals
    studentModal: boolean;
    instructorModal: boolean;
    userProfileModal: boolean;

    // Reports and analytics
    reportsModal: boolean;
    analyticsModal: boolean;

    // Student-specific modals
    progressModal: boolean;
    scheduleModal: boolean;
    achievementsModal: boolean;
    assessmentsModal: boolean;

    // Generic modals
    confirmModal: boolean;
    bulkAssignmentModal: boolean;
  };

  // Modal data and context
  modalData: {
    selectedSessionId: string | null;
    selectedTrackId: string | null;
    selectedGradeId: string | null;
    selectedUserId: string | null;
    confirmAction: (() => void) | null;
    confirmMessage: string | null;
  };

  // Global UI states
  globalLoading: boolean;
  sidebarCollapsed: boolean;
  notifications: Array<{
    id: string;
    type: "success" | "error" | "warning" | "info";
    message: string;
    timestamp: Date;
  }>;

  // Actions
  openModal: (
    modalName: keyof UIStore["modals"],
    data?: Partial<UIStore["modalData"]>
  ) => void;
  closeModal: (modalName: keyof UIStore["modals"]) => void;
  closeAllModals: () => void;

  // Modal data actions
  setModalData: (data: Partial<UIStore["modalData"]>) => void;
  clearModalData: () => void;

  // Global UI actions
  setGlobalLoading: (loading: boolean) => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;

  // Notification actions
  addNotification: (
    notification: Omit<UIStore["notifications"][0], "id" | "timestamp">
  ) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;

  // Utility actions
  resetState: () => void;
}

const useUIStore = create<UIStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      modals: {
        sessionModal: false,
        sessionLinkModal: false,
        attendanceModal: false,
        sessionControlModal: false,
        trackModal: false,
        trackAssignmentModal: false,
        gradeModal: false,
        gradeAssignmentModal: false,
        studentModal: false,
        instructorModal: false,
        userProfileModal: false,
        reportsModal: false,
        analyticsModal: false,
        progressModal: false,
        scheduleModal: false,
        achievementsModal: false,
        assessmentsModal: false,
        confirmModal: false,
        bulkAssignmentModal: false,
      },

      modalData: {
        selectedSessionId: null,
        selectedTrackId: null,
        selectedGradeId: null,
        selectedUserId: null,
        confirmAction: null,
        confirmMessage: null,
      },

      globalLoading: false,
      sidebarCollapsed: false,
      notifications: [],

      // Modal actions
      openModal: (modalName, data = {}) => {
        set((state) => ({
          modals: {
            ...state.modals,
            [modalName]: true,
          },
          modalData: {
            ...state.modalData,
            ...data,
          },
        }));
      },

      closeModal: (modalName) => {
        set((state) => ({
          modals: {
            ...state.modals,
            [modalName]: false,
          },
        }));
      },

      closeAllModals: () => {
        set((state) => ({
          modals: Object.fromEntries(
            Object.keys(state.modals).map((key) => [key, false])
          ) as UIStore["modals"],
        }));
      },

      // Modal data actions
      setModalData: (data) => {
        set((state) => ({
          modalData: {
            ...state.modalData,
            ...data,
          },
        }));
      },

      clearModalData: () => {
        set({
          modalData: {
            selectedSessionId: null,
            selectedTrackId: null,
            selectedGradeId: null,
            selectedUserId: null,
            confirmAction: null,
            confirmMessage: null,
          },
        });
      },

      // Global UI actions
      setGlobalLoading: (globalLoading) => set({ globalLoading }),

      toggleSidebar: () => {
        set((state) => ({
          sidebarCollapsed: !state.sidebarCollapsed,
        }));
      },

      setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),

      // Notification actions
      addNotification: (notification) => {
        const id = Math.random().toString(36).substr(2, 9);
        const timestamp = new Date();

        set((state) => ({
          notifications: [
            ...state.notifications,
            { ...notification, id, timestamp },
          ],
        }));

        // Auto-remove notification after 5 seconds
        setTimeout(() => {
          get().removeNotification(id);
        }, 5000);
      },

      removeNotification: (id) => {
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        }));
      },

      clearNotifications: () => set({ notifications: [] }),

      // Reset state
      resetState: () =>
        set({
          modals: {
            sessionModal: false,
            sessionLinkModal: false,
            attendanceModal: false,
            sessionControlModal: false,
            trackModal: false,
            trackAssignmentModal: false,
            gradeModal: false,
            gradeAssignmentModal: false,
            studentModal: false,
            instructorModal: false,
            userProfileModal: false,
            reportsModal: false,
            analyticsModal: false,
            progressModal: false,
            scheduleModal: false,
            achievementsModal: false,
            assessmentsModal: false,
            confirmModal: false,
            bulkAssignmentModal: false,
          },
          modalData: {
            selectedSessionId: null,
            selectedTrackId: null,
            selectedGradeId: null,
            selectedUserId: null,
            confirmAction: null,
            confirmMessage: null,
          },
          globalLoading: false,
          sidebarCollapsed: false,
          notifications: [],
        }),
    }),
    {
      name: "ui-store", // Devtools identifier
    }
  )
);

export default useUIStore;
