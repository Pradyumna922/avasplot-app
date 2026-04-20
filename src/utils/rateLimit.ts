// ============================================================================
// 🛡️ CLIENT-SIDE RATE LIMITING & CACHING
// ============================================================================

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

// ============================================================================
// 💨 RATE LIMITING
// ============================================================================

class RateLimiter {
  private limits: Map<string, RateLimitEntry> = new Map();

  /**
   * Check if action is allowed and record it
   * @param key Unique identifier (e.g., "search", "login")
   * @param maxRequests Maximum requests allowed
   * @param windowMs Time window in milliseconds
   */
  check(key: string, maxRequests: number = 10, windowMs: number = 60000): boolean {
    const now = Date.now();
    const entry = this.limits.get(key);

    if (!entry || now > entry.resetAt) {
      // New window
      this.limits.set(key, {
        count: 1,
        resetAt: now + windowMs,
      });
      return true;
    }

    if (entry.count >= maxRequests) {
      // Rate limited
      return false;
    }

    entry.count++;
    return true;
  }

  /**
   * Get time until rate limit resets
   */
  getResetTime(key: string): number {
    const entry = this.limits.get(key);
    if (!entry) return 0;
    return Math.max(0, entry.resetAt - Date.now());
  }

  /**
   * Clear rate limit for a key
   */
  clear(key: string): void {
    this.limits.delete(key);
  }

  /**
   * Clear all rate limits
   */
  clearAll(): void {
    this.limits.clear();
  }
}

// Export singleton instance
export const rateLimiter = new RateLimiter();

// Pre-configured limiters for common operations
export const limits = {
  search: { max: 30, windowMs: 60000 },      // 30 searches per minute
  propertyCreate: { max: 10, windowMs: 60000 }, // 10 creates per minute
  leadCreate: { max: 20, windowMs: 60000 },    // 20 leads per minute
  login: { max: 5, windowMs: 60000 },          // 5 login attempts per minute
  imageUpload: { max: 5, windowMs: 60000 },    // 5 uploads per minute
} as const;

// ============================================================================
// 🗄️ SIMPLE CACHE
// ============================================================================

class SimpleCache {
  private cache: Map<string, CacheEntry<unknown>> = new Map();
  private cleanupInterval: ReturnType<typeof setInterval> | null = null;

  constructor() {
    // Clean up expired entries every 5 minutes
    if (typeof setInterval !== "undefined") {
      this.cleanupInterval = setInterval(() => this.cleanup(), 300000);
    }
  }

  /**
   * Set a value in cache
   */
  set<T>(key: string, data: T, ttlMs: number = 300000): void {
    this.cache.set(key, {
      data,
      expiresAt: Date.now() + ttlMs,
    });
  }

  /**
   * Get a value from cache
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Check if key exists and is valid
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return false;
    }
    return true;
  }

  /**
   * Delete a specific key
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Destroy the cache (cleanup interval)
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }
}

// Export singleton instance
export const cache = new SimpleCache();

// ============================================================================
// 🚦 GUARD FUNCTION
// ============================================================================

/**
 * Guard a function with rate limiting
 * Returns true if allowed, throws error if rate limited
 */
export function rateGuarded(
  key: string,
  limitConfig: { max: number; windowMs: number },
  operation: string = "this action"
): void {
  const allowed = rateLimiter.check(key, limitConfig.max, limitConfig.windowMs);

  if (!allowed) {
    const waitSeconds = Math.ceil(rateLimiter.getResetTime(key) / 1000);
    throw new Error(
      `Too many ${operation} requests. Please wait ${waitSeconds} seconds.`
    );
  }
}

/**
 * Cache wrapper - returns cached data or executes function
 */
export async function cached<T>(
  key: string,
  fn: () => Promise<T>,
  ttlMs: number = 60000
): Promise<T> {
  const cached = cache.get<T>(key);
  if (cached !== null) {
    return cached;
  }

  const data = await fn();
  cache.set(key, data, ttlMs);
  return data;
}