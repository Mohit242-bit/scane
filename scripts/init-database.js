import { initializeDatabase } from "../lib/database.js"
import { sql } from "../lib/database.js"
import { analyticsSchema } from "../lib/analytics.js"

async function initDB() {
  try {
    console.log("🚀 Initializing ScanEzy database...")

    // Initialize main tables
    await initializeDatabase()

    // Add analytics table
    await sql(analyticsSchema)
    console.log("✅ Analytics table initialized")

    // Add indexes for performance
    await sql`CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status)`
    await sql`CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON bookings(created_at)`
    await sql`CREATE INDEX IF NOT EXISTS idx_slots_start_ts ON slots(start_ts)`
    await sql`CREATE INDEX IF NOT EXISTS idx_slots_center_service ON slots(center_id, service_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_documents_booking_id ON documents(booking_id)`

    console.log("✅ Database indexes created")
    console.log("🎉 Database initialization complete!")
  } catch (error) {
    console.error("❌ Database initialization failed:", error)
    process.exit(1)
  }
}

initDB()
