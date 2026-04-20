// ============================================================================
// 🛡️ CLOUDFLARE WORKER - FREE TIER RATE LIMITING
// ============================================================================
//
// Deploy with: wrangler deploy cloudflare/worker-rate-limit.ts
// Requires: wrangler CLI + Cloudflare account (free)
//
// This provides rate limiting without paid Cloudflare Pro
// ============================================================================

export interface Env {
  // KV Namespace for rate limiting (free tier includes 1 namespace)
  RATE_LIMIT_KV: KVNamespace;
}

const RATE_LIMITS = {
  "/api/auth/login": { limit: 5, window: 60 },
  "/api/auth/signup": { limit: 3, window: 3600 },
  "/api/properties": { limit: 60, window: 60 },
  "/api/properties/create": { limit: 10, window: 60 },
  "/api/leads": { limit: 20, window: 60 },
  "/api/images": { limit: 10, window: 60 },
} as const;

type RouteKey = keyof typeof RATE_LIMITS;

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const ip = request.headers.get("CF-Connecting-IP") || "unknown";
    const path = url.pathname;

    // Find matching rate limit rule
    let matchedRoute: RouteKey | null = null;
    for (const route of Object.keys(RATE_LIMITS) as RouteKey[]) {
      if (path.startsWith(route)) {
        matchedRoute = route;
        break;
      }
    }

    // Default rate limit for unmatched routes
    const limitConfig = matchedRoute
      ? RATE_LIMITS[matchedRoute]
      : { limit: 100, window: 60 };

    const cacheKey = `ratelimit:${ip}:${matchedRoute || "default"}`;

    try {
      // Get current count from KV
      const current = await env.RATE_LIMIT_KV.get(cacheKey, "number") || 0;
      const windowStart = await env.RATE_LIMIT_KV.get(`${cacheKey}:window`, "number") || 0;
      const now = Date.now();

      // Check if window has expired
      if (now - windowStart > limitConfig.window * 1000) {
        // Reset for new window
        await env.RATE_LIMIT_KV.put(cacheKey, "1");
        await env.RATE_LIMIT_KV.put(`${cacheKey}:window`, now.toString());
      } else if (current >= limitConfig.limit) {
        // Rate limited!
        return new Response(
          JSON.stringify({
            error: "Rate limit exceeded",
            retryAfter: Math.ceil((windowStart + limitConfig.window * 1000 - now) / 1000),
          }),
          {
            status: 429,
            headers: {
              "Content-Type": "application/json",
              "Retry-After": Math.ceil(limitConfig.window).toString(),
              "X-RateLimit-Limit": limitConfig.limit.toString(),
              "X-RateLimit-Remaining": "0",
            },
          }
        );
      } else {
        // Increment counter
        await env.RATE_LIMIT_KV.put(cacheKey, (current + 1).toString());
      }

      // Get updated remaining count
      const remaining = await env.RATE_LIMIT_KV.get(cacheKey, "number") || current + 1;

      // Add rate limit headers to response
      const response = await fetch(request);

      const headers = new Headers(response.headers);
      headers.set("X-RateLimit-Limit", limitConfig.limit.toString());
      headers.set("X-RateLimit-Remaining", String(Math.max(0, limitConfig.limit - remaining)));

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
      });
    } catch (err) {
      // If KV fails, allow request (fail open)
      console.error("Rate limit error:", err);
      return fetch(request);
    }
  },
} satisfies ExportedHandler<Env>;