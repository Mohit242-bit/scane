import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"


// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Check if partner profile exists
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

    // Check if partner profile exists
    const { data: partnerProfile, error } = await supabase
      .from("partners")
      .select("*")
      .eq("user_id", user.id)
      .single()

    if (error && error.code !== "PGRST116") {
      throw error
    }

    if (!partnerProfile) {
      return NextResponse.json({ error: "Partner profile not found" }, { status: 404 })
    }

    return NextResponse.json({
      exists: true,
      profile: partnerProfile,
      needsOnboarding: partnerProfile.status === 'pending'
    })
  } catch (error: any) {
    console.error("Partner profile check error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// Create/Update partner profile
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

    const body = await req.json()
    const {
      business_name,
      business_email,
      business_phone,
      address,
      city
    } = body

    // Create or update partner profile in the partners table
    const { data: partnerProfile, error } = await supabase
      .from("partners")
      .upsert({
        user_id: user.id,
        business_name,
        business_email,
        business_phone,
        address,
        city,
        status: "pending",
        updated_at: new Date().toISOString()
      }, { onConflict: "user_id" })
      .select()
      .single()

    if (error) {
      throw error
    }

    // Update user role to partner
    await supabase
      .from("users")
      .update({ role: "partner" })
      .eq("id", user.id)

    return NextResponse.json({
      success: true,
      profile: partnerProfile
    })
  } catch (error: any) {
    console.error("Partner profile creation error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
