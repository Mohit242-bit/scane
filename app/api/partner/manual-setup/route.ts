import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      email,
      userId,
      fullName,
      businessName,
      phone
    } = body

    if (!email || !userId || !fullName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    console.log("Creating manual partner setup for:", { email, userId, fullName })

    // Step 1: Create/update user in public.users table
    const { data: existingUser, error: checkError } = await supabase
      .from("users")
      .select("id")
      .eq("id", userId)
      .single()

    if (checkError && checkError.code !== "PGRST116") {
      console.error("Error checking existing user:", checkError)
      return NextResponse.json({ error: "Database error" }, { status: 500 })
    }

    if (!existingUser) {
      // Create user
      const { error: userError } = await supabase
        .from("users")
        .insert({
          id: userId,
          email: email,
          full_name: fullName,
          phone: phone,
          role: "partner",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      if (userError) {
        console.error("Error creating user:", userError)
        return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
      }
      console.log("User created successfully")
    } else {
      // Update existing user to partner role
      const { error: updateError } = await supabase
        .from("users")
        .update({ 
          role: "partner",
          full_name: fullName,
          phone: phone,
          updated_at: new Date().toISOString()
        })
        .eq("id", userId)

      if (updateError) {
        console.error("Error updating user:", updateError)
        return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
      }
      console.log("User updated successfully")
    }

    // Step 2: Create partner profile
    const { data: existingProfile, error: profileCheckError } = await supabase
      .from("partners")
      .select("id")
      .eq("user_id", userId)
      .single()

    if (profileCheckError && profileCheckError.code !== "PGRST116") {
      console.error("Error checking existing profile:", profileCheckError)
      return NextResponse.json({ error: "Profile check error" }, { status: 500 })
    }

    if (!existingProfile) {
      // Create partner profile
      const { error: profileError } = await supabase
        .from("partners")
        .insert({
          user_id: userId,
          business_name: businessName || `${fullName}'s Practice`,
          business_email: email,
          business_phone: phone,
          address: null,
          city: null,
          status: "pending",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      if (profileError) {
        console.error("Error creating partner profile:", profileError)
        return NextResponse.json({ error: "Failed to create partner profile" }, { status: 500 })
      }
      console.log("Partner profile created successfully")
    } else {
      // Update existing profile
      const { error: updateProfileError } = await supabase
        .from("partners")
        .update({
          business_name: businessName || `${fullName}'s Practice`,
          business_phone: phone,
          updated_at: new Date().toISOString()
        })
        .eq("user_id", userId)

      if (updateProfileError) {
        console.error("Error updating partner profile:", updateProfileError)
        return NextResponse.json({ error: "Failed to update partner profile" }, { status: 500 })
      }
      console.log("Partner profile updated successfully")
    }

    return NextResponse.json({
      success: true,
      message: "Partner account created/updated successfully",
      userId: userId,
      email: email
    })
  } catch (error: any) {
    console.error("Manual partner setup error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
