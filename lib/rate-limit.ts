import { redis } from "./database";

interface RateLimitOptions {
  windowMs: number
  maxRequests: number
  keyGenerator?: (identifier: string) => string
}

interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetTime: number
}

class RateLimiter {
  async checkLimit(identifier: string, options: RateLimitOptions): Promise<RateLimitResult> {
    const { windowMs, maxRequests, keyGenerator } = options;
    const key = keyGenerator ? keyGenerator(identifier) : `rate_limit:${identifier}`;

    try {
      // Get current count
      const current = await redis.get(key);
      const count = current ? Number.parseInt(current) : 0;

      if (count >= maxRequests) {
        return {
          allowed: false,
          remaining: 0,
          resetTime: Date.now() + windowMs,
        };
      }

      // Increment counter
      await redis.incr(key);

      // Set expiry if this is the first request
      if (count === 0) {
        await redis.expire(key, Math.ceil(windowMs / 1000));
      }

      return {
        allowed: true,
        remaining: maxRequests - count - 1,
        resetTime: Date.now() + windowMs,
      };
    } catch (error) {
      console.error("Rate limiting error:", error);
      // Allow request if rate limiting fails
      return {
        allowed: true,
        remaining: maxRequests - 1,
        resetTime: Date.now() + windowMs,
      };
    }
  }
}

export const rateLimiter = new RateLimiter();
