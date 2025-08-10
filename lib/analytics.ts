import { sql } from "./database"

export const analyticsSchema = `
  CREATE TABLE IF NOT EXISTS analytics (
    id SERIAL PRIMARY KEY,
    event_type VARCHAR(100) NOT NULL,
    event_data JSONB,
    user_agent TEXT,
    ip_address INET,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`

export async function trackEvent(eventType: string, eventData: any, userAgent?: string, ipAddress?: string) {
  try {
    await sql`
      INSERT INTO analytics (event_type, event_data, user_agent, ip_address)
      VALUES (${eventType}, ${JSON.stringify(eventData)}, ${userAgent}, ${ipAddress})
    `
  } catch (error) {
    console.error("Analytics tracking failed:", error)
  }
}

export async function getAnalytics(startDate?: Date, endDate?: Date) {
  try {
    let query = sql`SELECT * FROM analytics`

    if (startDate && endDate) {
      query = sql`
        SELECT * FROM analytics 
        WHERE created_at >= ${startDate.toISOString()} 
        AND created_at <= ${endDate.toISOString()}
        ORDER BY created_at DESC
      `
    } else {
      query = sql`SELECT * FROM analytics ORDER BY created_at DESC LIMIT 1000`
    }

    return await query
  } catch (error) {
    console.error("Failed to fetch analytics:", error)
    return []
  }
}
