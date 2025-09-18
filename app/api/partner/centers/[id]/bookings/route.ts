import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Get bookings for specific center
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = req.headers.get("authorization")
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.replace("Bearer ", "")
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get partner profile
    const { data: partnerProfile } = await supabase
      .from("partners")
      .select("id")
      .eq("user_id", user.id)
      .single()

    if (!partnerProfile) {
      return NextResponse.json({ error: "Partner profile not found" }, { status: 404 })
    }

    // Verify center belongs to partner
    const { data: center } = await supabase
      .from("centers")
      .select("id")
      .eq("id", params.id)
      .eq("partner_id", partnerProfile.id)
      .single()

    if (!center) {
      return NextResponse.json({ error: "Center not found or unauthorized" }, { status: 404 })
    }

    // Get URL parameters
    const url = new URL(req.url)
    const status = url.searchParams.get("status")
    const date = url.searchParams.get("date")
    const limit = parseInt(url.searchParams.get("limit") || "50")
    const offset = parseInt(url.searchParams.get("offset") || "0")

    // Build query
    let query = supabase
      .from("bookings")
      .select(`
        *,
        users!bookings_user_id_fkey (
          id,
          full_name,
          email,
          phone
        ),
        services (
          id,
          name,
          category,
          duration_minutes
        ),
        centers!bookings_center_id_fkey (
          id,
          name,
          address,
          city
        )
      `)
      .eq("center_id", params.id)
      .order("appointment_date", { ascending: false })
      .range(offset, offset + limit - 1)

    if (status) {
      query = query.eq("status", status)
    }

    if (date) {
      // Filter by specific date
      const startDate = new Date(date)
      const endDate = new Date(date)
      endDate.setDate(endDate.getDate() + 1)
      
      query = query
        .gte("appointment_date", startDate.toISOString())
        .lt("appointment_date", endDate.toISOString())
    }

    const { data: bookings, error, count } = await query

    if (error) {
      throw error
    }

    // Get summary statistics
    const { data: statsData } = await supabase
      .from("bookings")
      .select("status, total_amount, appointment_date")
      .eq("center_id", params.id)

    const stats = {
      total: count || 0,
      confirmed: statsData?.filter(b => b.status === 'confirmed').length || 0,
      pending: statsData?.filter(b => b.status === 'pending').length || 0,
      completed: statsData?.filter(b => b.status === 'completed').length || 0,
      cancelled: statsData?.filter(b => b.status === 'cancelled').length || 0,
      totalRevenue: statsData?.filter(b => b.status === 'completed')
        .reduce((sum, b) => sum + (b.total_amount || 0), 0) || 0,
      todayBookings: statsData?.filter(b => {
        const today = new Date().toDateString()
        return new Date(b.appointment_date).toDateString() === today
      }).length || 0
    }

    return NextResponse.json({
      bookings: bookings || [],
      stats,
      pagination: {
        limit,
        offset,
        total: count || 0,
        hasMore: (offset + limit) < (count || 0)
      }
    })
  } catch (error: any) {
    console.error("Get center bookings error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// Update booking status (confirm/cancel/reschedule)
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = req.headers.get("authorization")
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.replace("Bearer ", "")
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get partner profile
    const { data: partnerProfile } = await supabase
      .from("partners")
      .select("id")
      .eq("user_id", user.id)
      .single()

    if (!partnerProfile) {
      return NextResponse.json({ error: "Partner profile not found" }, { status: 404 })
    }

    // Verify center belongs to partner
    const { data: center } = await supabase
      .from("centers")
      .select("id")
      .eq("id", params.id)
      .eq("partner_id", partnerProfile.id)
      .single()

    if (!center) {
      return NextResponse.json({ error: "Center not found or unauthorized" }, { status: 404 })
    }

    const body = await req.json()
    const { booking_id, status, notes, new_appointment_date } = body

    if (!booking_id || !status) {
      return NextResponse.json({ error: "Booking ID and status are required" }, { status: 400 })
    }

    // Validate status
    const validStatuses = ['confirmed', 'cancelled', 'completed', 'rescheduled']
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    // Update booking
    const updateData: any = {
      status,
      updated_at: new Date().toISOString()
    }

    if (notes) {
      updateData.partner_notes = notes
    }

    if (status === 'rescheduled' && new_appointment_date) {
      updateData.appointment_date = new_appointment_date
    }

    const { data: booking, error } = await supabase
      .from("bookings")
      .update(updateData)
      .eq("id", booking_id)
      .eq("center_id", params.id)
      .select(`
        *,
        users!bookings_user_id_fkey (full_name, email, phone),
        services (name),
        centers!bookings_center_id_fkey (name)
      `)
      .single()

    if (error) {
      throw error
    }

    // TODO: Send notification to customer about status change
    // This would integrate with your notification system

    return NextResponse.json({
      success: true,
      booking,
      message: `Booking ${status} successfully`
    })
  } catch (error: any) {
    console.error("Update booking error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}