// Local Error Logger for client-side error storage and retrieval

export interface StoredError {
  id: string;
  timestamp: string;
  error: {
    message: string;
    stack?: string;
    name: string;
  };
  context?: Record<string, unknown>;
  userContext?: {
    id?: string;
    email?: string;
    role?: string;
    name?: string;
  };
  severity?: "low" | "medium" | "high" | "critical";
  resolved?: boolean;
}

export interface StoredMessage {
  id: string;
  timestamp: string;
  message: string;
  level: "info" | "warning" | "error";
  context?: Record<string, unknown>;
}

export interface ErrorLoggerConfig {
  enableConsoleLogging: boolean;
  enableLocalStorage: boolean;
  maxStoredErrors: number;
  maxStoredMessages: number;
}

export class ErrorLogger {
  private static config: ErrorLoggerConfig = {
    enableConsoleLogging: true,
    enableLocalStorage: true,
    maxStoredErrors: 50,
    maxStoredMessages: 100,
  };

  private static userContext: StoredError["userContext"] = {};
  private static readonly ERRORS_KEY = "andrino_academy_errors";
  private static readonly MESSAGES_KEY = "andrino_academy_messages";

  static initialize(config?: Partial<ErrorLoggerConfig>) {
    this.config = { ...this.config, ...config };

    // Clean up old entries on initialization
    this.cleanupOldEntries();
  }

  static logError(
    error: Error,
    context?: Record<string, unknown>,
    severity: StoredError["severity"] = "medium"
  ) {
    const storedError: StoredError = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name,
      },
      context,
      userContext: this.userContext,
      severity,
      resolved: false,
    };

    // Console logging
    if (this.config.enableConsoleLogging) {
      console.error("Error logged:", storedError);
    }

    // Local storage
    if (this.config.enableLocalStorage && typeof window !== "undefined") {
      this.storeError(storedError);
    }

    return storedError.id;
  }

  static logMessage(
    message: string,
    level: StoredMessage["level"],
    context?: Record<string, unknown>
  ) {
    const storedMessage: StoredMessage = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      message,
      level,
      context,
    };

    // Console logging
    if (this.config.enableConsoleLogging) {
      const consoleMethod =
        level === "error" ? "error" : level === "warning" ? "warn" : "info";
      console[consoleMethod]("Message logged:", storedMessage);
    }

    // Local storage
    if (this.config.enableLocalStorage && typeof window !== "undefined") {
      this.storeMessage(storedMessage);
    }

    return storedMessage.id;
  }

  static setUserContext(user: StoredError["userContext"]) {
    this.userContext = user;
  }

  static getStoredErrors(): StoredError[] {
    if (typeof window === "undefined") return [];

    try {
      const stored = localStorage.getItem(this.ERRORS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("Failed to retrieve stored errors:", error);
      return [];
    }
  }

  static getStoredMessages(): StoredMessage[] {
    if (typeof window === "undefined") return [];

    try {
      const stored = localStorage.getItem(this.MESSAGES_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("Failed to retrieve stored messages:", error);
      return [];
    }
  }

  static getErrorById(id: string): StoredError | null {
    const errors = this.getStoredErrors();
    return errors.find((error) => error.id === id) || null;
  }

  static markErrorAsResolved(id: string): boolean {
    const errors = this.getStoredErrors();
    const errorIndex = errors.findIndex((error) => error.id === id);

    if (errorIndex === -1) return false;

    errors[errorIndex].resolved = true;
    this.saveErrors(errors);
    return true;
  }

  static deleteError(id: string): boolean {
    const errors = this.getStoredErrors();
    const filteredErrors = errors.filter((error) => error.id !== id);

    if (filteredErrors.length === errors.length) return false;

    this.saveErrors(filteredErrors);
    return true;
  }

  static clearStoredErrors(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem(this.ERRORS_KEY);
    }
  }

  static clearStoredMessages(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem(this.MESSAGES_KEY);
    }
  }

  static getErrorStats(): {
    total: number;
    resolved: number;
    unresolved: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
    last24Hours: number;
  } {
    const errors = this.getStoredErrors();
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;

    return {
      total: errors.length,
      resolved: errors.filter((e) => e.resolved).length,
      unresolved: errors.filter((e) => !e.resolved).length,
      critical: errors.filter((e) => e.severity === "critical").length,
      high: errors.filter((e) => e.severity === "high").length,
      medium: errors.filter((e) => e.severity === "medium").length,
      low: errors.filter((e) => e.severity === "low").length,
      last24Hours: errors.filter(
        (e) => now - new Date(e.timestamp).getTime() < dayMs
      ).length,
    };
  }

  static exportErrors(): string {
    const errors = this.getStoredErrors();
    const messages = this.getStoredMessages();

    const exportData = {
      timestamp: new Date().toISOString(),
      userContext: this.userContext,
      errors,
      messages,
      stats: this.getErrorStats(),
    };

    return JSON.stringify(exportData, null, 2);
  }

  static importErrors(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);

      if (data.errors && Array.isArray(data.errors)) {
        this.saveErrors(data.errors);
      }

      if (data.messages && Array.isArray(data.messages)) {
        this.saveMessages(data.messages);
      }

      return true;
    } catch (error) {
      console.error("Failed to import error data:", error);
      return false;
    }
  }

  // Search and filter functionality
  static searchErrors(query: string): StoredError[] {
    const errors = this.getStoredErrors();
    const lowercaseQuery = query.toLowerCase();

    return errors.filter(
      (error) =>
        error.error.message.toLowerCase().includes(lowercaseQuery) ||
        error.error.name.toLowerCase().includes(lowercaseQuery) ||
        (error.context &&
          JSON.stringify(error.context).toLowerCase().includes(lowercaseQuery))
    );
  }

  static filterErrors(filters: {
    severity?: StoredError["severity"][];
    resolved?: boolean;
    dateFrom?: string;
    dateTo?: string;
    userId?: string;
  }): StoredError[] {
    const errors = this.getStoredErrors();

    return errors.filter((error) => {
      // Severity filter
      if (filters.severity && filters.severity.length > 0) {
        if (!filters.severity.includes(error.severity || "medium")) {
          return false;
        }
      }

      // Resolved filter
      if (filters.resolved !== undefined) {
        if (error.resolved !== filters.resolved) {
          return false;
        }
      }

      // Date range filter
      if (filters.dateFrom) {
        if (new Date(error.timestamp) < new Date(filters.dateFrom)) {
          return false;
        }
      }

      if (filters.dateTo) {
        if (new Date(error.timestamp) > new Date(filters.dateTo)) {
          return false;
        }
      }

      // User filter
      if (filters.userId) {
        if (error.userContext?.id !== filters.userId) {
          return false;
        }
      }

      return true;
    });
  }

  // Private methods
  private static storeError(error: StoredError): void {
    const errors = this.getStoredErrors();
    errors.unshift(error); // Add to beginning

    // Limit storage size
    if (errors.length > this.config.maxStoredErrors) {
      errors.splice(this.config.maxStoredErrors);
    }

    this.saveErrors(errors);
  }

  private static storeMessage(message: StoredMessage): void {
    const messages = this.getStoredMessages();
    messages.unshift(message); // Add to beginning

    // Limit storage size
    if (messages.length > this.config.maxStoredMessages) {
      messages.splice(this.config.maxStoredMessages);
    }

    this.saveMessages(messages);
  }

  private static saveErrors(errors: StoredError[]): void {
    try {
      localStorage.setItem(this.ERRORS_KEY, JSON.stringify(errors));
    } catch (error) {
      console.error("Failed to save errors to localStorage:", error);
    }
  }

  private static saveMessages(messages: StoredMessage[]): void {
    try {
      localStorage.setItem(this.MESSAGES_KEY, JSON.stringify(messages));
    } catch (error) {
      console.error("Failed to save messages to localStorage:", error);
    }
  }

  private static cleanupOldEntries(): void {
    const errors = this.getStoredErrors();
    const messages = this.getStoredMessages();

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 30); // Keep only last 30 days

    const filteredErrors = errors.filter(
      (error) => new Date(error.timestamp) > cutoffDate
    );

    const filteredMessages = messages.filter(
      (message) => new Date(message.timestamp) > cutoffDate
    );

    if (filteredErrors.length !== errors.length) {
      this.saveErrors(filteredErrors);
    }

    if (filteredMessages.length !== messages.length) {
      this.saveMessages(filteredMessages);
    }
  }

  private static generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
