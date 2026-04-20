// ============================================================================
// 🛡️ ERROR HANDLING - Prevents crashes, logs errors
// ============================================================================

import { router } from "expo-router";

// ============================================================================
// 📋 ERROR TYPES
// ============================================================================

export class AppError extends Error {
  constructor(
    message: string,
    public code: string = "UNKNOWN_ERROR",
    public statusCode: number = 500,
    public isRetryable: boolean = false
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class NetworkError extends AppError {
  constructor(message: string = "Network error occurred") {
    super(message, "NETWORK_ERROR", 0, true);
    this.name = "NetworkError";
  }
}

export class AuthError extends AppError {
  constructor(message: string = "Authentication failed") {
    super(message, "AUTH_ERROR", 401);
    this.name = "AuthError";
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, "VALIDATION_ERROR", 400);
    this.name = "ValidationError";
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = "Too many requests", public retryAfter?: number) {
    super(message, "RATE_LIMIT_ERROR", 429, true);
    this.name = "RateLimitError";
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = "Resource not found") {
    super(message, "NOT_FOUND", 404);
    this.name = "NotFoundError";
  }
}

// ============================================================================
// 🛠️ ERROR HANDLERS
// ============================================================================

/**
 * Handle Appwrite errors with user-friendly messages
 */
export function handleAppwriteError(error: unknown): AppError {
  if (error instanceof AppError) return error;

  const errorStr = String(error).toLowerCase();

  // Network errors
  if (errorStr.includes("network") || errorStr.includes("fetch")) {
    return new NetworkError("Unable to connect. Please check your internet connection.");
  }

  // Auth errors
  if (errorStr.includes("unauthorized") || errorStr.includes("session")) {
    return new AuthError("Session expired. Please login again.");
  }

  // Rate limit
  if (errorStr.includes("rate limit") || errorStr.includes("too many")) {
    return new RateLimitError("Too many requests. Please wait a moment.");
  }

  // Not found
  if (errorStr.includes("not found") || errorStr.includes("404")) {
    return new NotFoundError("The requested resource was not found.");
  }

  // Generic server error
  return new AppError(
    "Something went wrong. Please try again.",
    "SERVER_ERROR",
    500,
    true
  );
}

/**
 * Log error (use Sentry in production)
 */
export function logError(error: unknown, context?: string): void {
  const errorInfo = {
    name: error instanceof Error ? error.name : "Unknown",
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    context,
    timestamp: new Date().toISOString(),
  };

  // In development, log to console
  if (__DEV__) {
    console.error("[ERROR]", context, errorInfo);
  }

  // In production, send to error tracking service
  // await Sentry.captureException(error, { extra: { context } });
}

/**
 * Show error to user with toast/alert
 */
export function showError(message: string): void {
  // Use your preferred toast/alert mechanism
  // For example: Toast.show(message, { type: "error" });
  // Or: Alert.alert("Error", message);
  console.error("[USER ERROR]", message);
}

// ============================================================================
// 🔄 SAFE ASYNC WRAPPER
// ============================================================================

/**
 * Execute async function with error handling
 */
export async function safeAsync<T>(
  fn: () => Promise<T>,
  options?: {
    onError?: (error: AppError) => void;
    showError?: boolean;
    returnNullOnError?: boolean;
  }
): Promise<T | null> {
  try {
    return await fn();
  } catch (error) {
    const appError = handleAppwriteError(error);
    logError(error, fn.name);

    if (options?.showError !== false) {
      showError(appError.message);
    }

    options?.onError?.(appError);

    if (options?.returnNullOnError !== false) {
      return null;
    }
    throw appError;
  }
}

/**
 * Execute sync function with error handling
 */
export function safeSync<T>(
  fn: () => T,
  options?: {
    onError?: (error: Error) => void;
    showError?: boolean;
    returnNullOnError?: boolean;
  }
): T | null {
  try {
    return fn();
  } catch (error) {
    logError(error, fn.name);

    if (options?.showError !== false) {
      showError(error instanceof Error ? error.message : "An error occurred");
    }

    options?.onError?.(error as Error);

    if (options?.returnNullOnError !== false) {
      return null;
    }
    throw error;
  }
}

// ============================================================================
// 🔄 SAFE PROMISIFY
// ============================================================================

/**
 * Convert callback-based function to Promise-based
 */
export function promisify<T>(
  fn: (callback: (error: Error | null, result?: T) => void) => void
): Promise<T> {
  return new Promise((resolve, reject) => {
    fn((error, result) => {
      if (error) reject(error);
      else if (result !== undefined) resolve(result);
      else reject(new Error("No result returned"));
    });
  });
}



// ============================================================================
// 📤 EXPORT DEFAULT CONFIG
// ============================================================================

export const errorConfig = {
  // Show detailed errors in development
  showStack: __DEV__,

  // Retry automatically for retryable errors
  autoRetry: true,
  maxRetries: 3,
  retryDelay: 1000,

  // Report errors (enable in production)
  reportErrors: !__DEV__,
} as const;