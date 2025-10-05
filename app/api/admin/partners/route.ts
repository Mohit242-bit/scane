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

// GET: Fetch enhanced partner data with statistics
export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    try {
      verifyAdminAuth(request)
    } catch (error) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const url = new URL(request.url)
    const partnerId = url.searchParams.get("id")
    
    if (partnerId) {
      // Fetch specific partner details with related data
      const [
        { data: partner, error: partnerError },
        { data: centers },
        { data: services },
        { data: bookings }
      ] = await Promise.all([
        supabase
          .from("partners")
          .select(`
            *,
            users(full_name, email, phone, created_at)
          `)
          .eq("id", partnerId)
          .single(),
        supabase
          .from("centers")
          .select("id, name, city, is_active, rating, created_at")
          .eq("partner_id", partnerId),
        supabase
          .from("services")
          .select("id, name, modality, price, is_active, created_at")
          .eq("partner_id", partnerId),
        supabase
          .from("bookings")
          .select(`
            id, 
            total_amount, 
            status, 
            appointment_date,
            created_at,
            centers!inner(partner_id)
          `)
          .eq("centers.partner_id", partnerId)
      ])

      if (partnerError) {
        return NextResponse.json({ error: "Partner not found" }, { status: 404 })
      }

      // Calculate partner statistics
      const totalRevenue = bookings?.reduce((sum, b) => sum + (b.total_amount || 0), 0) || 0
      const completedBookings = bookings?.filter(b => b.status === 'completed').length || 0
      const avgRating = centers?.length ? centers.reduce((sum, c) => sum + c.rating, 0) / centers.length : 0

      const partnerDetails = {
        ...partner,
        centers: centers || [],
        services: services || [],
        bookings: bookings || [],
        stats: {
          totalCenters: centers?.length || 0,
          activeCenters: centers?.filter(c => c.is_active).length || 0,
          totalServices: services?.length || 0,
          activeServices: services?.filter(s => s.is_active).length || 0,
          totalBookings: bookings?.length || 0,
          completedBookings,
          totalRevenue,
          avgRating: Math.round(avgRating * 10) / 10
        }
      }

      return NextResponse.json(partnerDetails)
    } else {
      // Fetch all partners with enhanced data and statistics
      const [
        { data: partners, error: partnersError },
        { data: centers },
        { data: services },
        { data: bookings }
      ] = await Promise.all([
        supabase
          .from("partners")
          .select(`
            *,
            users(full_name, email, phone, created_at)
          `)
          .order("created_at", { ascending: false }),
        supabase
          .from("centers")
          .select("id, partner_id, name, city, is_active, rating"),
        supabase
          .from("services")
          .select("id, partner_id, name, price, is_active"),
        supabase
          .from("bookings")
          .select(`
            id, 
            total_amount, 
            status, 
            appointment_date,
            centers!inner(partner_id)
          `)
      ])

      if (partnersError) {
        return NextResponse.json({ error: "Failed to fetch partners" }, { status: 500 })
      }

      // Enhance partners with statistics
      const enhancedPartners = (partners || []).map(partner => {
        const partnerCenters = centers?.filter(c => c.partner_id === partner.id) || []
        const partnerServices = services?.filter(s => s.partner_id === partner.id) || []
        const partnerBookings = bookings?.filter(b => 
          partnerCenters.some(c => c.id === (b.centers as any)?.partner_id)
        ) || []

        const totalRevenue = partnerBookings.reduce((sum, b) => sum + (b.total_amount || 0), 0)
        const completedBookings = partnerBookings.filter(b => b.status === 'completed').length
        const avgRating = partnerCenters.length ? 
          partnerCenters.reduce((sum, c) => sum + c.rating, 0) / partnerCenters.length : 0

        // Get cities where partner operates
        const cities = [...new Set(partnerCenters.map(c => c.city))].join(', ')

        return {
          ...partner,
          cities,
          stats: {
            totalCenters: partnerCenters.length,
            activeCenters: partnerCenters.filter(c => c.is_active).length,
            totalServices: partnerServices.length,
            activeServices: partnerServices.filter(s => s.is_active).length,
            totalBookings: partnerBookings.length,
            completedBookings,
            totalRevenue,
            avgRating: Math.round(avgRating * 10) / 10
          }
        }
      })

      // Calculate overall statistics
      const overallStats = {
        totalPartners: enhancedPartners.length,
        activePartners: enhancedPartners.filter(p => p.status === 'approved').length,
        pendingPartners: enhancedPartners.filter(p => p.status === 'pending').length,
        rejectedPartners: enhancedPartners.filter(p => p.status === 'rejected').length,
        suspendedPartners: enhancedPartners.filter(p => p.status === 'suspended').length,
        totalRevenue: enhancedPartners.reduce((sum, p) => sum + p.stats.totalRevenue, 0),
        totalCenters: enhancedPartners.reduce((sum, p) => sum + p.stats.totalCenters, 0),
        totalServices: enhancedPartners.reduce((sum, p) => sum + p.stats.totalServices, 0),
        avgRating: enhancedPartners.length ? 
          enhancedPartners.reduce((sum, p) => sum + p.stats.avgRating, 0) / enhancedPartners.length : 0,
        citiesCount: new Set(enhancedPartners.map(p => p.city).filter(Boolean)).size,
        topCities: Array.from(
          enhancedPartners
            .reduce((acc, p) => {
              if (p.city) {
                acc.set(p.city, (acc.get(p.city) || 0) + 1)
              }
              return acc
            }, new Map<string, number>())
        )
          .sort(([,a], [,b]): number => (b as number) - (a as number))
          .slice(0, 5)
          .map(([city, count]): { city: string; count: number } => ({ city: city as string, count: count as number }))
      }

      return NextResponse.json({
        partners: enhancedPartners,
        stats: overallStats
      })
    }
  } catch (error) {
    console.error("Admin partners API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PATCH: Update partner status or details
export async function PATCH(request: NextRequest) {
  try {
    // Check admin authentication
    try {
      verifyAdminAuth(request)
    } catch (error) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json({ error: "Partner ID is required" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("partners")
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq("id", id)
      .select(`
        *,
        users(full_name, email, phone)
      `)
      .single()

    if (error) {
      console.error("Error updating partner:", error)
      return NextResponse.json({ error: "Failed to update partner" }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Admin partner update error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}