import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { z } from "zod"


// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const updateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  email: z.string().email("Invalid email address").optional(),
})

export async function PATCH(req: NextRequest) {
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

    const body = await req.json()
    const validation = updateProfileSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({ error: "Invalid data", details: validation.error.errors }, { status: 400 })
    }

    const { name, email } = validation.data

    // Update user in database
    const { data: updatedUser, error: updateError } = await supabase
      .from("users")
      .update({
        ...(name && { full_name: name }),
        ...(email && { email }),
        updated_at: new Date().toISOString()
      })
      .eq("id", user.id)
      .select()
      .single()

    if (updateError) {
      throw updateError
    }

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        name: updatedUser.full_name,
        email: updatedUser.email,
        phone: updatedUser.phone,
      },
    })
  } catch (error: any) {
    console.error("Profile update error:", error)
    return NextResponse.json({ error: error.message || "Failed to update profile" }, { status: 500 })
  }
}
