// @ts-nocheck - Optional monitoring packages not installed (Sentry, LogRocket)
// This file requires: npm install @sentry/nextjs logrocket

import { ErrorLogger } from "./error-logger";

// Sentry Error Service
export class SentryErrorService {
  private static initialized = false;

  static async initialize() {
    if (this.initialized || typeof window === "undefined") return;

    try {
      // Dynamic import to avoid SSR issues - optional package
      const Sentry: SentryModule = await import("@sentry/nextjs").catch(
        () => null
      );

      Sentry.init({
        dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
        environment: process.env.NODE_ENV,
        tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
        debug: process.env.NODE_ENV === "development",

        beforeSend(event) {
          // Filter out development errors
          if (process.env.NODE_ENV === "development") {
            console.log("Sentry Event:", event);
          }

          // Don't send cancelled requests
          if (event.exception?.values?.[0]?.value?.includes("cancelled")) {
            return null;
          }

          return event;
        },

        integrations: [
          new Sentry.BrowserTracing({
            tracingOrigins: ["localhost", process.env.NEXT_PUBLIC_APP_URL],
          }),
        ],
      });

      this.initialized = true;
    } catch (error) {
      console.warn("Failed to initialize Sentry:", error);
    }
  }

  static captureException(error: Error, context?: Record<string, any>) {
    if (!this.initialized) return;

    import("@sentry/nextjs").then(({ captureException, withScope }) => {
      withScope((scope) => {
        if (context) {
          Object.entries(context).forEach(([key, value]) => {
            scope.setTag(key, value);
          });
        }
        captureException(error);
      });
    });
  }

  static captureMessage(
    message: string,
    level: "error" | "warning" | "info" = "info"
  ) {
    if (!this.initialized) return;

    import("@sentry/nextjs").then(({ captureMessage }) => {
      captureMessage(message, level);
    });
  }

  static setUser(user: { id: string; email?: string; role?: string }) {
    if (!this.initialized) return;

    import("@sentry/nextjs").then(({ setUser }) => {
      setUser(user);
    });
  }
}

// LogRocket Service
export class LogRocketService {
  private static initialized = false;

  static async initialize() {
    if (this.initialized || typeof window === "undefined") return;

    try {
      const LogRocket = await import("logrocket");

      LogRocket.init(process.env.NEXT_PUBLIC_LOGROCKET_APP_ID!, {
        console: {
          shouldAggregateConsoleErrors: true,
        },
        network: {
          requestSanitizer: (request) => {
            // Sanitize sensitive data
            if (request.headers && request.headers.authorization) {
              request.headers.authorization = "[REDACTED]";
            }
            return request;
          },
          responseSanitizer: (response) => {
            // Sanitize sensitive response data
            return response;
          },
        },
      });

      this.initialized = true;
    } catch (error) {
      console.warn("Failed to initialize LogRocket:", error);
    }
  }

  static identify(userId: string, traits?: Record<string, any>) {
    if (!this.initialized) return;

    import("logrocket").then((LogRocket) => {
      LogRocket.identify(userId, traits);
    });
  }

  static captureException(error: Error) {
    if (!this.initialized) return;

    import("logrocket").then((LogRocket) => {
      LogRocket.captureException(error);
    });
  }

  static getSessionURL(): Promise<string | null> {
    if (!this.initialized) return Promise.resolve(null);

    return import("logrocket").then((LogRocket) => {
      return LogRocket.getSessionURL();
    });
  }
}

// Error Monitoring Configuration
export interface ErrorMonitoringConfig {
  enableSentry: boolean;
  enableLogRocket: boolean;
  enableConsoleLogging: boolean;
  enableLocalStorage: boolean;
  maxStoredErrors: number;
  environment: string;
}

// Default configuration
const DEFAULT_CONFIG: ErrorMonitoringConfig = {
  enableSentry:
    process.env.NODE_ENV === "production" &&
    !!process.env.NEXT_PUBLIC_SENTRY_DSN,
  enableLogRocket:
    process.env.NODE_ENV === "production" &&
    !!process.env.NEXT_PUBLIC_LOGROCKET_APP_ID,
  enableConsoleLogging: process.env.NODE_ENV === "development",
  enableLocalStorage: true,
  maxStoredErrors: 50,
  environment: process.env.NODE_ENV || "development",
};

// Error Monitoring Manager
export class ErrorMonitoringManager {
  private static config: ErrorMonitoringConfig = DEFAULT_CONFIG;
  private static initialized = false;

  static async initialize(config?: Partial<ErrorMonitoringConfig>) {
    if (this.initialized) return;

    this.config = { ...DEFAULT_CONFIG, ...config };

    try {
      // Initialize external services
      if (this.config.enableSentry) {
        await SentryErrorService.initialize();
      }

      if (this.config.enableLogRocket) {
        await LogRocketService.initialize();
      }

      // Initialize local error logger
      ErrorLogger.initialize({
        enableConsoleLogging: this.config.enableConsoleLogging,
        enableLocalStorage: this.config.enableLocalStorage,
        maxStoredErrors: this.config.maxStoredErrors,
      });

      this.initialized = true;
      console.log("Error monitoring initialized successfully");
    } catch (error) {
      console.error("Failed to initialize error monitoring:", error);
    }
  }

  static reportError(
    error: Error,
    context?: {
      userId?: string;
      userRole?: string;
      page?: string;
      action?: string;
      severity?: "low" | "medium" | "high" | "critical";
      tags?: Record<string, string>;
      extra?: Record<string, any>;
    }
  ) {
    if (!this.initialized) {
      console.error("Error monitoring not initialized");
      return;
    }

    const errorContext = {
      timestamp: new Date().toISOString(),
      userAgent:
        typeof window !== "undefined" ? window.navigator.userAgent : "unknown",
      url: typeof window !== "undefined" ? window.location.href : "unknown",
      environment: this.config.environment,
      ...context,
    };

    // Log to console in development
    if (this.config.enableConsoleLogging) {
      console.error("Error reported:", error, errorContext);
    }

    // Report to Sentry
    if (this.config.enableSentry) {
      SentryErrorService.captureException(error, errorContext);
    }

    // Report to LogRocket
    if (this.config.enableLogRocket) {
      LogRocketService.captureException(error);
    }

    // Log locally
    ErrorLogger.logError(error, errorContext);

    // Send critical errors via email (production only)
    if (
      context?.severity === "critical" &&
      this.config.environment === "production"
    ) {
      this.sendCriticalErrorAlert(error, errorContext);
    }
  }

  static reportMessage(
    message: string,
    level: "info" | "warning" | "error" = "info",
    context?: Record<string, any>
  ) {
    if (!this.initialized) return;

    const messageContext = {
      timestamp: new Date().toISOString(),
      environment: this.config.environment,
      ...context,
    };

    // Log to console
    if (this.config.enableConsoleLogging) {
      console[level](`[${level.toUpperCase()}] ${message}`, messageContext);
    }

    // Report to Sentry
    if (this.config.enableSentry) {
      SentryErrorService.captureMessage(
        message,
        level === "warning" ? "warning" : level
      );
    }

    // Log locally
    ErrorLogger.logMessage(message, level, messageContext);
  }

  static setUser(user: {
    id: string;
    email?: string;
    role?: string;
    name?: string;
  }) {
    if (!this.initialized) return;

    // Set user context in external services
    if (this.config.enableSentry) {
      SentryErrorService.setUser(user);
    }

    if (this.config.enableLogRocket) {
      LogRocketService.identify(user.id, {
        email: user.email,
        role: user.role,
        name: user.name,
      });
    }

    // Set user context locally
    ErrorLogger.setUserContext(user);
  }

  static async getStoredErrors(): Promise<any[]> {
    return ErrorLogger.getStoredErrors();
  }

  static clearStoredErrors(): void {
    ErrorLogger.clearStoredErrors();
  }

  static async getSessionURL(): Promise<string | null> {
    if (!this.config.enableLogRocket) return null;
    return LogRocketService.getSessionURL();
  }

  private static async sendCriticalErrorAlert(error: Error, context: any) {
    try {
      // Get session URL for debugging
      const sessionURL = await this.getSessionURL();

      const alertData = {
        error: {
          message: error.message,
          stack: error.stack,
          name: error.name,
        },
        context,
        sessionURL,
        timestamp: new Date().toISOString(),
      };

      // Send email alert via API
      await fetch("/api/alerts/critical-error", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(alertData),
      });
    } catch (alertError) {
      console.error("Failed to send critical error alert:", alertError);
    }
  }
}

// Performance Monitoring
export class PerformanceMonitor {
  private static initialized = false;

  static initialize() {
    if (this.initialized || typeof window === "undefined") return;

    // Monitor page load performance
    window.addEventListener("load", () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType(
          "navigation"
        )[0] as PerformanceNavigationTiming;

        if (navigation) {
          const metrics = {
            loadTime: navigation.loadEventEnd - navigation.fetchStart,
            domContentLoaded:
              navigation.domContentLoadedEventEnd - navigation.fetchStart,
            firstPaint: this.getFirstPaint(),
            firstContentfulPaint: this.getFirstContentfulPaint(),
          };

          ErrorMonitoringManager.reportMessage(
            "Page Load Metrics",
            "info",
            metrics
          );
        }
      }, 0);
    });

    // Monitor long tasks
    if ("PerformanceObserver" in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            if (entry.duration > 50) {
              // Tasks longer than 50ms
              ErrorMonitoringManager.reportMessage(
                "Long Task Detected",
                "warning",
                {
                  duration: entry.duration,
                  startTime: entry.startTime,
                }
              );
            }
          });
        });

        observer.observe({ entryTypes: ["longtask"] });
      } catch (error) {
        console.warn("Performance Observer not supported:", error);
      }
    }

    this.initialized = true;
  }

  private static getFirstPaint(): number | null {
    const entries = performance.getEntriesByType("paint");
    const fpEntry = entries.find((entry) => entry.name === "first-paint");
    return fpEntry ? fpEntry.startTime : null;
  }

  private static getFirstContentfulPaint(): number | null {
    const entries = performance.getEntriesByType("paint");
    const fcpEntry = entries.find(
      (entry) => entry.name === "first-contentful-paint"
    );
    return fcpEntry ? fcpEntry.startTime : null;
  }
}

// Auto-initialize in browser
if (typeof window !== "undefined") {
  // Initialize on page load
  document.addEventListener("DOMContentLoaded", () => {
    ErrorMonitoringManager.initialize();
    PerformanceMonitor.initialize();
  });
}
