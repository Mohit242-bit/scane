import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Get partner's centers
export async function GET(req: NextRequest) {
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

    // Get centers
    const { data: centers, error } = await supabase
      .from("centers")
      .select(`
        *,
        center_services (
          id,
          price,
          special_price,
          is_available,
          services (id, name, category, description)
        )
      `)
      .eq("partner_id", partnerProfile.id)

    if (error) {
      throw error
    }

    return NextResponse.json({ centers: centers || [] })
  } catch (error: any) {
    console.error("Get centers error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// Create new center
export async function POST(req: NextRequest) {
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

    const body = await req.json()
    const {
      name,
      address,
      city,
      area_hint,
      phone,
      email,
      operating_hours,
      amenities
    } = body

    // Create center
    const { data: center, error } = await supabase
      .from("centers")
      .insert({
        partner_id: partnerProfile.id,
        name,
        address,
        city,
        area_hint,
        phone,
        email,
        operating_hours,
        amenities,
        is_active: true,
        rating: 4.5
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      center
    })
  } catch (error: any) {
    console.error("Create center error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
