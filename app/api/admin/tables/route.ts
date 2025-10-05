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

// GET: Fetch all tables data for admin
export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    try {
      verifyAdminAuth(request)
    } catch (error) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const url = new URL(request.url)
    const table = url.searchParams.get("table")
    const limit = url.searchParams.get("limit")
    const offset = url.searchParams.get("offset")

    if (!table) {
      return NextResponse.json({ error: "Table parameter is required" }, { status: 400 })
    }

    // Define allowed tables for security
    const allowedTables = [
      "users", "bookings", "services", "centers", "partners", 
      "slots", "reviews", "documents", "notifications"
    ]

    if (!allowedTables.includes(table)) {
      return NextResponse.json({ error: "Invalid table name" }, { status: 400 })
    }

    let query = supabase.from(table).select("*").order("created_at", { ascending: false })

    if (limit) {
      query = query.limit(parseInt(limit))
    }

    if (offset) {
      query = query.range(parseInt(offset), parseInt(offset) + parseInt(limit || "50") - 1)
    }

    // Add joins for related data based on table
    if (table === "bookings") {
      query = supabase
        .from("bookings")
        .select(`
          *,
          services(name, modality),
          centers(name, city, area_hint),
          users(full_name, email)
        `)
        .order("created_at", { ascending: false })
    } else if (table === "services") {
      query = supabase
        .from("services")
        .select(`
          *,
          partners(business_name)
        `)
        .order("created_at", { ascending: false })
    } else if (table === "centers") {
      query = supabase
        .from("centers")
        .select(`
          *,
          partners(business_name)
        `)
        .order("created_at", { ascending: false })
    } else if (table === "partners") {
      query = supabase
        .from("partners")
        .select(`
          *,
          users(full_name, email)
        `)
        .order("created_at", { ascending: false })
    }

    if (limit) {
      query = query.limit(parseInt(limit))
    }

    if (offset) {
      query = query.range(parseInt(offset), parseInt(offset) + parseInt(limit || "50") - 1)
    }

    const { data, error } = await query

    if (error) {
      console.error(`Error fetching ${table}:`, error)
      return NextResponse.json({ error: `Failed to fetch ${table}` }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Admin tables error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PATCH: Update record in any table
export async function PATCH(request: NextRequest) {
  try {
    // Check admin authentication
    try {
      verifyAdminAuth(request)
    } catch (error) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { table, id, ...updateData } = body

    if (!table || !id) {
      return NextResponse.json({ error: "Table and ID are required" }, { status: 400 })
    }

    // Define allowed tables for security
    const allowedTables = [
      "users", "bookings", "services", "centers", "partners", 
      "slots", "reviews", "documents", "notifications"
    ]

    if (!allowedTables.includes(table)) {
      return NextResponse.json({ error: "Invalid table name" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from(table)
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error(`Error updating ${table}:`, error)
      return NextResponse.json({ error: `Failed to update ${table}` }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Admin update error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE: Delete record from any table
export async function DELETE(request: NextRequest) {
  try {
    // Check admin authentication
    try {
      verifyAdminAuth(request)
    } catch (error) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const url = new URL(request.url)
    const table = url.searchParams.get("table")
    const id = url.searchParams.get("id")

    if (!table || !id) {
      return NextResponse.json({ error: "Table and ID are required" }, { status: 400 })
    }

    // Define allowed tables for security
    const allowedTables = [
      "users", "bookings", "services", "centers", "partners", 
      "slots", "reviews", "documents", "notifications"
    ]

    if (!allowedTables.includes(table)) {
      return NextResponse.json({ error: "Invalid table name" }, { status: 400 })
    }

    const { error } = await supabase
      .from(table)
      .delete()
      .eq("id", id)

    if (error) {
      console.error(`Error deleting from ${table}:`, error)
      return NextResponse.json({ error: `Failed to delete from ${table}` }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Admin delete error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
