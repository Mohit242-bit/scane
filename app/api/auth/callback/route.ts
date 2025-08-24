import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const redirectTo = searchParams.get("redirectTo") || "/"

  console.log("Auth callback received:", { code: !!code, redirectTo })

  if (code) {
    try {
      // Exchange code for session
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      console.log("Code exchange result:", { 
        hasUser: !!data?.user, 
        hasSession: !!data?.session, 
        error: error?.message 
      })
      
      if (error) {
        console.error("Code exchange error:", error)
        return NextResponse.redirect(`${origin}/auth/error?message=${encodeURIComponent(error.message)}`)
      }
      
      if (!data?.user) {
        console.error("No user data after code exchange")
        return NextResponse.redirect(`${origin}/auth/error?message=No user data`)
      }

      const user = data.user
      console.log("User authenticated:", { id: user.id, email: user.email })
      
      // Ensure user exists in public.users table
      try {
        const { data: existingUser, error: userError } = await supabase
          .from("users")
          .select("id, role")
          .eq("id", user.id)
          .single()

        if (userError && userError.code === "PGRST116") {
          // User doesn't exist in public.users table, create them
          console.log("Creating user in public.users table")
          const { error: insertError } = await supabase
            .from("users")
            .insert({
              id: user.id,
              email: user.email!,
              full_name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0],
              phone: user.user_metadata?.phone || null,
              role: redirectTo.includes("/admin") ? "admin" : redirectTo.includes("/partner") ? "partner" : "customer",
              avatar_url: user.user_metadata?.avatar_url || null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })

          if (insertError) {
            console.error("Failed to create user:", insertError)
          } else {
            console.log("User created successfully in public.users table")
          }
        } else if (!userError) {
          // User exists, update role if needed
          const newRole = redirectTo.includes("/admin") ? "admin" : redirectTo.includes("/partner") ? "partner" : existingUser.role
          
          if (existingUser.role !== newRole) {
            console.log(`Updating user role from ${existingUser.role} to ${newRole}`)
            await supabase
              .from("users")
              .update({ 
                role: newRole,
                updated_at: new Date().toISOString()
              })
              .eq("id", user.id)
          }
        }
      } catch (userTableError) {
        console.error("Error handling user table:", userTableError)
      }
      
      // For admin users
      if (redirectTo.includes("/admin")) {
        return NextResponse.redirect(`${origin}/admin/dashboard`)
      }
      
      // For partner users
      if (redirectTo.includes("/partner")) {
        
        // Check if partner profile exists
        try {
          const profileResponse = await fetch(`${origin}/api/partner/profile`, {
            headers: {
              'Authorization': `Bearer ${data.session?.access_token}`
            }
          })
          
          console.log("Profile check response:", profileResponse.status)
          
          if (profileResponse.status === 404) {
            // First-time partner - redirect to onboarding
            console.log("Redirecting to onboarding")
            return NextResponse.redirect(`${origin}/partner/onboarding`)
          } else if (profileResponse.ok) {
            // Existing partner - redirect to dashboard
            console.log("Redirecting to dashboard")
            return NextResponse.redirect(`${origin}/partner/dashboard`)
          } else {
            // Some other error, go to onboarding
            console.log("Profile check failed, redirecting to onboarding")
            return NextResponse.redirect(`${origin}/partner/onboarding`)
          }
        } catch (profileError) {
          console.error('Error checking partner profile:', profileError)
          // Fallback to onboarding
          return NextResponse.redirect(`${origin}/partner/onboarding`)
        }
      }
      
      // Default redirect
      return NextResponse.redirect(`${origin}${redirectTo}`)
      
    } catch (error) {
      console.error("Callback error:", error)
      return NextResponse.redirect(`${origin}/auth/error?message=${encodeURIComponent('Authentication failed')}`)
    }
  }

  console.log("No code provided, redirecting to error")
  // If there's an error or no code, redirect to login
  return NextResponse.redirect(`${origin}/auth/error?message=No authorization code`)
}