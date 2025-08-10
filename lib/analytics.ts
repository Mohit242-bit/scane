import { config } from "./config"
import { sql } from "your-sql-library" // Declare the sql variable here

interface AnalyticsEvent {
  event: string
  properties: Record<string, any>
  userId?: string
  timestamp?: number
}

class AnalyticsService {
  private mixpanelToken = config.analytics.mixpanelToken

  async track(event: AnalyticsEvent): Promise<void> {
    // Track to multiple services
    await Promise.allSettled([this.trackMixpanel(event), this.trackGA4(event), this.trackInternal(event)])
  }

  private async trackMixpanel(event: AnalyticsEvent): Promise<void> {
    if (!this.mixpanelToken) return

    try {
      const data = {
        event: event.event,
        properties: {
          ...event.properties,
          time: event.timestamp || Date.now(),
          distinct_id: event.userId || "anonymous",
          token: this.mixpanelToken,
        },
      }

      await fetch("https://api.mixpanel.com/track", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify([data]),
      })
    } catch (error) {
      console.error("Mixpanel tracking error:", error)
    }
  }

  private async trackGA4(event: AnalyticsEvent): Promise<void> {
    // GA4 tracking would be implemented client-side via gtag
    // This is a placeholder for server-side tracking if needed
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", event.event, {
        ...event.properties,
        user_id: event.userId,
      })
    }
  }

  private async trackInternal(event: AnalyticsEvent): Promise<void> {
    // Store events in our own database for analysis
    try {
      await sql`
        INSERT INTO analytics_events (event, properties, user_id, timestamp)
        VALUES (${event.event}, ${JSON.stringify(event.properties)}, ${event.userId || null}, ${new Date(event.timestamp || Date.now())})
      `
    } catch (error) {
      console.error("Internal analytics error:", error)
    }
  }

  // Convenience methods for common events
  async trackBookingStarted(userId: string, serviceId: string, citySlug: string): Promise<void> {
    await this.track({
      event: "booking_started",
      userId,
      properties: {
        service_id: serviceId,
        city: citySlug,
      },
    })
  }

  async trackBookingCompleted(userId: string, bookingId: string, amount: number): Promise<void> {
    await this.track({
      event: "booking_completed",
      userId,
      properties: {
        booking_id: bookingId,
        amount,
        currency: "INR",
      },
    })
  }

  async trackPaymentFailed(userId: string, bookingId: string, error: string): Promise<void> {
    await this.track({
      event: "payment_failed",
      userId,
      properties: {
        booking_id: bookingId,
        error,
      },
    })
  }
}

export const analytics = new AnalyticsService()

// Add analytics_events table to schema
export const analyticsSchema = `
  CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event VARCHAR(100) NOT NULL,
    properties JSONB,
    user_id UUID,
    timestamp TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
  )
`
