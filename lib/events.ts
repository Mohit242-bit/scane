// Event tracking system for analytics
type EventData = {
  user_id?: string
  booking_id?: string
  service_id?: string
  center_id?: string
  city?: string
  amount?: number
  [key: string]: any
}

type EventType =
  | "user_signed_up"
  | "service_viewed"
  | "slot_checked"
  | "booking_initiated"
  | "payment_succeeded"
  | "booking_confirmed"
  | "document_uploaded"
  | "booking_completed"
  | "nps_submitted"
  | "refund_initiated"
  | "refund_processed"

export function trackEvent(event: EventType, data: EventData = {}) {
  const eventPayload = {
    event,
    timestamp: Date.now(),
    session_id: getSessionId(),
    ...data,
  }

  // In production: send to GA4, Mixpanel, etc.
  console.log("Event tracked:", eventPayload)

  // Store in memory for demo
  if (typeof window !== "undefined") {
    const events = JSON.parse(localStorage.getItem("scanezy_events") || "[]")
    events.push(eventPayload)
    localStorage.setItem("scanezy_events", JSON.stringify(events.slice(-100))) // Keep last 100
  }
}

function getSessionId(): string {
  if (typeof window === "undefined") return "server"

  let sessionId = sessionStorage.getItem("scanezy_session_id")
  if (!sessionId) {
    sessionId = Math.random().toString(36).substr(2, 16)
    sessionStorage.setItem("scanezy_session_id", sessionId)
  }
  return sessionId
}

export function getStoredEvents(): any[] {
  if (typeof window === "undefined") return []
  return JSON.parse(localStorage.getItem("scanezy_events") || "[]")
}
