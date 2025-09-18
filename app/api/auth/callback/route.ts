import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const error = searchParams.get("error")
  const errorDescription = searchParams.get("error_description") 
  
  // Check for redirectTo in query params first
  let redirectTo = searchParams.get("redirectTo") || "/"
  
  console.log("Auth callback received:", { 
    hasCode: !!code,
    redirectTo, 
    error, 
    errorDescription,
    allParams: Object.fromEntries(searchParams.entries()),
    url: request.url,
    timestamp: new Date().toISOString()
  })
  
  // IMPORTANT: If no code and no error, check if user is already authenticated
  // This handles the case where callback is hit after successful OAuth
  if (!code && !error) {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (session) {
      console.log("No code but session exists - user already authenticated, redirecting home")
      // User is already logged in, just redirect them home or to partner page
      const referrer = request.headers.get('referer')
      if (referrer?.includes('/partner')) {
        return NextResponse.redirect(`${origin}/partner-us`)
      }
      return NextResponse.redirect(origin)
    }
    
    // If truly no code and no session, show error
    console.log("No code and no session - showing error")
    return NextResponse.redirect(`${origin}/auth/error?message=${encodeURIComponent('No authorization code provided. This URL should only be accessed via OAuth redirect.')}`)
  }

  // Handle OAuth errors from the provider
  if (error) {
    console.error("OAuth provider error:", { error, errorDescription })
    const errorMessage = errorDescription || error || 'OAuth authentication failed'
    return NextResponse.redirect(`${origin}/auth/error?message=${encodeURIComponent(errorMessage)}`)
  }

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
          
          // Check if this is a partner signup by checking referrer or session data
          const referrer = request.headers.get('referer')
          const isPartnerSignup = referrer?.includes('/partner-us') || referrer?.includes('/partner')
          const userRole = redirectTo.includes("/admin") ? "admin" : 
                          (isPartnerSignup || redirectTo.includes("/partner")) ? "partner" : 
                          "customer"
          
          console.log("Assigning role:", userRole, "(referrer:", referrer, ")")
          
          const { error: insertError } = await supabase
            .from("users")
            .insert({
              id: user.id,
              email: user.email!,
              full_name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0],
              phone: user.user_metadata?.phone || null,
              role: userRole,
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
        
        // Check if partner profile exists by querying database directly
        try {
          const { data: partnerProfile, error: profileError } = await supabase
            .from("partners")
            .select("*")
            .eq("user_id", user.id)
            .single()
          
          console.log("Partner profile check:", { hasProfile: !!partnerProfile, error: profileError?.code })
          
          if (profileError && profileError.code === "PGRST116") {
            // No partner profile exists - redirect to onboarding
            console.log("No partner profile found, redirecting to onboarding")
            
            // Simple redirect to onboarding
            return NextResponse.redirect(`${origin}/partner/onboarding`)
          } else if (!profileError && partnerProfile) {
            // Partner profile exists - check if ready for dashboard
            if (partnerProfile.status === 'approved') {
              console.log("Partner approved, redirecting to dashboard")
              return NextResponse.redirect(`${origin}/partner/dashboard`)
            } else {
              console.log("Partner profile exists but not approved, redirecting to onboarding")
              return NextResponse.redirect(`${origin}/partner/onboarding`)
            }
          } else {
            // Some other error, go to onboarding
            console.log("Partner profile check failed, redirecting to onboarding")
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
  // If there's no code and no error, this might be a direct access
  return NextResponse.redirect(`${origin}/auth/error?message=${encodeURIComponent('No authorization code provided. This URL should only be accessed via OAuth redirect.')}`)
}