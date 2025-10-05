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

// GET: Fetch all users
export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    try {
      verifyAdminAuth(request)
    } catch (error) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const url = new URL(request.url)
    const role = url.searchParams.get("role")
    const limit = url.searchParams.get("limit")

    let query = supabase
      .from("users")
      .select("*")
      .order("created_at", { ascending: false })

    if (role) {
      query = query.eq("role", role)
    }

    if (limit) {
      query = query.limit(parseInt(limit))
    }

    const { data, error } = await query

    if (error) {
      console.error("Error fetching users:", error)
      return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Users API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PATCH: Update user
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
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("users")
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Error updating user:", error)
      return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("User update error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE: Delete user
export async function DELETE(request: NextRequest) {
  try {
    // Check admin authentication
    try {
      verifyAdminAuth(request)
    } catch (error) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const url = new URL(request.url)
    const id = url.searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const { error } = await supabase
      .from("users")
      .delete()
      .eq("id", id)

    if (error) {
      console.error("Error deleting user:", error)
      return NextResponse.json({ error: "Failed to delete user" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("User delete error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
