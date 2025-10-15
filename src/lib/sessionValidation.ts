/**
 * External Meeting Link Validation Utility
 * For Andrino Academy External Coordination Platform
 *
 * Validates and manages external meeting URLs (Zoom, Google Meet, Teams)
 * and handles session status transitions based on link availability.
 */

export interface SessionValidationResult {
  isValid: boolean;
  platform?: "zoom" | "google-meet" | "teams" | "other";
  error?: string;
  suggestedStatus?: "READY" | "DRAFT" | "SCHEDULED";
}

/**
 * Validates if a URL is a valid external meeting link
 */
export function validateExternalMeetingLink(
  url: string | null | undefined
): SessionValidationResult {
  // Handle empty/null URLs
  if (!url || !url.trim()) {
    return {
      isValid: false,
      error: "External meeting link is required to start the session",
      suggestedStatus: "DRAFT",
    };
  }

  const trimmedUrl = url.trim();

  try {
    const parsedUrl = new URL(trimmedUrl);
    const hostname = parsedUrl.hostname.toLowerCase();

    // Zoom validation
    if (hostname.includes("zoom.us") || hostname.includes("zoom.com")) {
      // Validate Zoom URL patterns
      if (
        parsedUrl.pathname.includes("/j/") ||
        parsedUrl.pathname.includes("/meeting/")
      ) {
        return {
          isValid: true,
          platform: "zoom",
          suggestedStatus: "READY",
        };
      }
      return {
        isValid: false,
        error:
          "Invalid Zoom meeting URL format. Please use a valid Zoom meeting link.",
        suggestedStatus: "SCHEDULED",
      };
    }

    // Google Meet validation
    if (
      hostname.includes("meet.google.com") ||
      hostname === "meet.google.com"
    ) {
      // Google Meet URLs should have meeting ID
      if (parsedUrl.pathname.length > 1) {
        return {
          isValid: true,
          platform: "google-meet",
          suggestedStatus: "READY",
        };
      }
      return {
        isValid: false,
        error:
          "Invalid Google Meet URL format. Please use a valid Google Meet link.",
        suggestedStatus: "SCHEDULED",
      };
    }

    // Microsoft Teams validation
    if (
      hostname.includes("teams.microsoft.com") ||
      hostname.includes("teams.live.com")
    ) {
      // Teams URLs should have meeting parameters
      if (
        parsedUrl.searchParams.has("meetingId") ||
        parsedUrl.pathname.includes("/meet-now/")
      ) {
        return {
          isValid: true,
          platform: "teams",
          suggestedStatus: "READY",
        };
      }
      return {
        isValid: false,
        error:
          "Invalid Microsoft Teams URL format. Please use a valid Teams meeting link.",
        suggestedStatus: "SCHEDULED",
      };
    }

    // Other valid URLs (generic validation)
    if (parsedUrl.protocol === "https:" || parsedUrl.protocol === "http:") {
      return {
        isValid: true,
        platform: "other",
        suggestedStatus: "READY",
      };
    }

    return {
      isValid: false,
      error: "Please use a secure HTTPS URL for the meeting link.",
      suggestedStatus: "SCHEDULED",
    };
  } catch {
    return {
      isValid: false,
      error: "Invalid URL format. Please provide a valid meeting link.",
      suggestedStatus: "SCHEDULED",
    };
  }
}

/**
 * Determines if a session can be started based on its external link
 */
export function canStartSession(
  externalLink: string | null | undefined
): boolean {
  const validation = validateExternalMeetingLink(externalLink);
  return validation.isValid;
}

/**
 * Determines if a student can join a session
 */
export function canJoinSession(
  externalLink: string | null | undefined,
  sessionStatus: string
): boolean {
  const hasValidLink = validateExternalMeetingLink(externalLink).isValid;
  const isActiveSession = sessionStatus === "ACTIVE";

  return hasValidLink && isActiveSession;
}

/**
 * Gets the appropriate session status based on external link availability
 */
export function getSessionStatusFromLink(
  externalLink: string | null | undefined,
  currentStatus: string,
  hasScheduledTime: boolean = true
): string {
  const validation = validateExternalMeetingLink(externalLink);

  // If no link, determine between DRAFT and SCHEDULED
  if (!validation.isValid) {
    return hasScheduledTime ? "SCHEDULED" : "DRAFT";
  }

  // If valid link exists, session is READY (unless it's already ACTIVE/COMPLETED/CANCELLED)
  const terminalStates = ["ACTIVE", "COMPLETED", "CANCELLED"];
  if (terminalStates.includes(currentStatus)) {
    return currentStatus;
  }

  return "READY";
}

/**
 * Gets user-friendly status messages in Arabic
 */
export function getSessionStatusMessage(
  externalLink: string | null | undefined,
  sessionStatus: string
): {
  message: string;
  type: "error" | "warning" | "success" | "info";
  canStart: boolean;
  canJoin: boolean;
} {
  const validation = validateExternalMeetingLink(externalLink);

  switch (sessionStatus) {
    case "DRAFT":
      return {
        message: "يتطلب إضافة رابط اجتماع لبدء الجلسة",
        type: "warning",
        canStart: false,
        canJoin: false,
      };

    case "SCHEDULED":
      if (!validation.isValid) {
        return {
          message: "يتطلب إضافة رابط اجتماع صالح لبدء الجلسة",
          type: "warning",
          canStart: false,
          canJoin: false,
        };
      }
      return {
        message: "الجلسة جاهزة للبدء",
        type: "success",
        canStart: true,
        canJoin: false,
      };

    case "READY":
      return {
        message: "الجلسة جاهزة للبدء - الرابط متوفر",
        type: "success",
        canStart: true,
        canJoin: false,
      };

    case "ACTIVE":
      return {
        message: "الجلسة جارية - يمكن للطلاب الانضمام",
        type: "success",
        canStart: false,
        canJoin: validation.isValid,
      };

    case "COMPLETED":
      return {
        message: "الجلسة مكتملة",
        type: "info",
        canStart: false,
        canJoin: false,
      };

    case "CANCELLED":
      return {
        message: "الجلسة ملغية",
        type: "error",
        canStart: false,
        canJoin: false,
      };

    default:
      return {
        message: "حالة الجلسة غير معروفة",
        type: "error",
        canStart: false,
        canJoin: false,
      };
  }
}

/**
 * Platform-specific examples for UI display
 */
export const PLATFORM_EXAMPLES = {
  zoom: {
    name: "Zoom",
    example: "https://zoom.us/j/1234567890",
    description: "رابط اجتماع Zoom",
  },
  "google-meet": {
    name: "Google Meet",
    example: "https://meet.google.com/abc-defg-hij",
    description: "رابط Google Meet",
  },
  teams: {
    name: "Microsoft Teams",
    example: "https://teams.microsoft.com/l/meetup-join/...",
    description: "رابط Microsoft Teams",
  },
  other: {
    name: "رابط آخر",
    example: "https://example.com/meeting-room",
    description: "رابط اجتماع آخر",
  },
} as const;

/**
 * Opens external meeting link in new tab/window
 */
export function joinExternalMeeting(externalLink: string): void {
  const validation = validateExternalMeetingLink(externalLink);

  if (!validation.isValid) {
    console.error("Cannot join meeting: Invalid external link");
    return;
  }

  // Open in new tab with security measures
  const newWindow = window.open(externalLink, "_blank", "noopener,noreferrer");

  if (!newWindow) {
    console.error(
      "Failed to open meeting link. Please check popup blocker settings."
    );
    // Fallback: try to navigate directly
    window.location.href = externalLink;
  }
}
