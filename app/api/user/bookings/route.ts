import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Mark this route as dynamic
export const dynamic = 'force-dynamic'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  try {
    // Get user from Authorization header
    const authHeader = req.headers.get("authorization")
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.replace("Bearer ", "")
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Fetch user's bookings with service and center details
    const { data: bookings, error: fetchError } = await supabase
      .from("bookings")
      .select(`
        id,
        status,
        amount,
        created_at,
        services (name),
        centers (name, area_hint),
        slots (start_ts)
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (fetchError) {
      throw fetchError
    }

    return NextResponse.json({
      bookings: (bookings || []).map((booking: any) => ({
        id: booking.id,
        status: booking.status,
        amount: booking.amount,
        created_at: new Date(booking.created_at).toISOString(),
        service_name: booking.services?.name,
        center_name: booking.centers?.name,
        center_area: booking.centers?.area_hint,
        date_time: booking.slots?.start_ts ? new Date(booking.slots.start_ts).toISOString() : null,
      })),
    })
  } catch (error: any) {
    console.error("Fetch bookings error:", error)
    return NextResponse.json({ error: error.message || "Failed to fetch bookings" }, { status: 500 })
  }
}
