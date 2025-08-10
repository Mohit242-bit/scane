import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { sql } from "@/lib/database"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Fetch user's bookings with service and center details
    const bookings = await sql`
      SELECT 
        b.id,
        b.status,
        b.amount,
        b.created_at,
        s.name as service_name,
        c.name as center_name,
        c.area_hint as center_area,
        sl.start_ts as date_time
      FROM bookings b
      JOIN services s ON b.service_id = s.id
      JOIN centers c ON b.center_id = c.id
      JOIN slots sl ON b.slot_id = sl.id
      WHERE b.user_id = ${session.user.id}
      ORDER BY b.created_at DESC
    `

    return NextResponse.json({
      bookings: bookings.map((booking) => ({
        ...booking,
        date_time: new Date(booking.date_time).toISOString(),
        created_at: new Date(booking.created_at).toISOString(),
      })),
    })
  } catch (error) {
    console.error("Fetch bookings error:", error)
    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 })
  }
}
