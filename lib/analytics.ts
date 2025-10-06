// Analytics disabled for Supabase-only build
// Mock implementation to prevent build errors

export const analyticsSchema = "-- Analytics disabled in Supabase build";

export async function trackEvent(eventType: string, eventData: any, userAgent?: string, ipAddress?: string) {
  // Mock implementation - analytics disabled
  if (process.env.NODE_ENV === "development") {
    console.log(`Analytics Event: ${eventType}`, eventData);
  }
}

export async function getAnalytics(startDate?: Date, endDate?: Date) {
  // Mock implementation - analytics disabled
  return [];
}

// Mock analytics export for build compatibility
export const analytics = {
  track: trackEvent,
  getAnalytics: getAnalytics
};
