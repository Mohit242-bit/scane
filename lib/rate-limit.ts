import { redis } from "./database"

interface RateLimitOptions {
  windowMs: number
  maxRequests: number
  keyGenerator?: (identifier: string) => string
}

class RateLimiter {
  async checkLimit(
    identifier: string,
    options: RateLimitOptions,
  ): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    const key = options.keyGenerator ? options.keyGenerator(identifier) : `rate_limit:${identifier}`
    const window = Math.floor(Date.now() / options.windowMs)
    const windowKey = `${key}:${window}`

    try {
      const current = await redis.incr(windowKey)

      if (current === 1) {
        // Set expiration for the first request in this window
        await redis.expire(windowKey, Math.ceil(options.windowMs / 1000))
      }

      const allowed = current <= options.maxRequests
      const remaining = Math.max(0, options.maxRequests - current)
      const resetTime = (window + 1) * options.windowMs

      return { allowed, remaining, resetTime }
    } catch (error) {
      console.error("Rate limiting error:", error)
      // Fail open - allow the request if Redis is down
      return { allowed: true, remaining: options.maxRequests - 1, resetTime: Date.now() + options.windowMs }
    }
  }

  // Predefined rate limiters
  async checkOTPLimit(phone: string): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    return this.checkLimit(phone, {
      windowMs: 60 * 60 * 1000, // 1 hour
      maxRequests: 5, // 5 OTP requests per hour
      keyGenerator: (phone) => `otp_limit:${phone}`,
    })
  }

  async checkAPILimit(ip: string): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    return this.checkLimit(ip, {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 100, // 100 requests per 15 minutes
      keyGenerator: (ip) => `api_limit:${ip}`,
    })
  }

  async checkBookingLimit(userId: string): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    return this.checkLimit(userId, {
      windowMs: 24 * 60 * 60 * 1000, // 24 hours
      maxRequests: 10, // 10 bookings per day
      keyGenerator: (userId) => `booking_limit:${userId}`,
    })
  }
}

export const rateLimiter = new RateLimiter()
