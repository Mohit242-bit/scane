import { NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import supabase from "@/lib/supabaseClient"

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Helper function to verify admin auth
function verifyAdminAuth(request: NextRequest) {
  const token = request.cookies.get("mvp_admin")?.value
  
  if (!token) {
    throw new Error("No admin token")
  }

  try {
    const decoded = jwt.verify(token, process.env.ADMIN_MVP_SECRET!) as any
    if (decoded.role !== "admin") {
      throw new Error("Not admin role")
    }
    return decoded
  } catch (error) {
    throw new Error("Invalid token")
  }
}

// GET: Fetch admin dashboard stats
export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    try {
      verifyAdminAuth(request)
    } catch (error) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Fetch various stats in parallel
    const [
      { data: bookings, error: bookingsError },
      { data: users, error: usersError },
      { data: partners, error: partnersError },
      { data: services, error: servicesError },
      { data: centers, error: centersError }
    ] = await Promise.all([
      supabase.from("bookings").select("id, status, total_amount, created_at"),
      supabase.from("users").select("id, role, created_at"),
      supabase.from("partners").select("id, status, created_at"),
      supabase.from("services").select("id, is_active, price"),
      supabase.from("centers").select("id, is_active")
    ])

    if (bookingsError || usersError || partnersError || servicesError || centersError) {
      console.error("Error fetching stats:", { bookingsError, usersError, partnersError, servicesError, centersError })
      return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
    }

    // Calculate stats
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const stats = {
      totalBookings: bookings?.length || 0,
      todayBookings: bookings?.filter(b => new Date(b.created_at) >= today).length || 0,
      pendingBookings: bookings?.filter(b => b.status === "pending").length || 0,
      completedBookings: bookings?.filter(b => b.status === "completed").length || 0,
      
      totalUsers: users?.length || 0,
      customerUsers: users?.filter(u => u.role === "customer").length || 0,
      partnerUsers: users?.filter(u => u.role === "partner").length || 0,
      
      totalPartners: partners?.length || 0,
      activePartners: partners?.filter(p => p.status === "approved").length || 0,
      pendingPartners: partners?.filter(p => p.status === "pending").length || 0,
      
      totalServices: services?.length || 0,
      activeServices: services?.filter(s => s.is_active).length || 0,
      
      totalCenters: centers?.length || 0,
      activeCenters: centers?.filter(c => c.is_active).length || 0,
      
      totalRevenue: bookings?.reduce((sum, b) => sum + (b.total_amount || 0), 0) || 0,
      avgBookingValue: bookings?.length ? 
        (bookings.reduce((sum, b) => sum + (b.total_amount || 0), 0) / bookings.length) : 0
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Admin stats error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
