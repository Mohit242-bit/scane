import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"


// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'
// Service role client for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Helper to create cookie-based client for session management
function createSupabaseClient(_request: NextRequest) {
  const cookieStore = cookies()
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // Handle cookie setting errors in middleware
          }
        },
        remove(name: string, options: any) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // Handle cookie removal errors in middleware
          }
        },
      },
    }
  )
}

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
  
  // Create cookie-based Supabase client to check user session
  const supabase = createSupabaseClient(request)
  
  // IMPORTANT: If no code and no error, check if user is already authenticated
  // This handles the case where callback is hit after successful OAuth
  if (!code && !error) {
    console.log("No code present - checking for existing session")
    const { data: { session } } = await supabase.auth.getSession()
    
    if (session) {
      console.log("✅ Session exists - user already authenticated, redirecting gracefully")
      
      // User is already logged in, redirect based on redirectTo or referrer
      if (redirectTo && redirectTo !== '/') {
        console.log("Redirecting authenticated user to:", redirectTo)
        return NextResponse.redirect(`${origin}${redirectTo}`)
      }
      
      const referrer = request.headers.get('referer')
      if (referrer?.includes('/partner')) {
        console.log("Redirecting authenticated partner to dashboard")
        return NextResponse.redirect(`${origin}/partner/dashboard`)
      }
      
      console.log("Redirecting authenticated user to home")
      return NextResponse.redirect(origin)
    }
    
    // If truly no code and no session, this might be a direct access - redirect to signin
    console.log("⚠️ No code and no session - redirecting to sign in page")
    return NextResponse.redirect(`${origin}/auth/signin?error=invalid_callback`)
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
        const { error: userError } = await supabaseAdmin
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
          
          const { error: insertError } = await supabaseAdmin
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
          // User exists, update last login
          console.log("User exists in database, updating last login")
          await supabaseAdmin
            .from("users")
            .update({ 
              updated_at: new Date().toISOString()
            })
            .eq("id", user.id)
        }
      } catch (userTableError) {
        console.error("Error handling user table:", userTableError)
      }
      
      // Determine final redirect destination based on role and redirectTo
      let finalRedirect = redirectTo
      
      // For admin users
      if (redirectTo.includes("/admin")) {
        finalRedirect = "/admin/dashboard"
      }
      // For partner users
      else if (redirectTo.includes("/partner")) {
        // Check if partner profile exists
        try {
          const { data: partnerProfile, error: profileError } = await supabaseAdmin
            .from("partners")
            .select("*")
            .eq("user_id", user.id)
            .single()
          
          console.log("Partner profile check:", { hasProfile: !!partnerProfile, error: profileError?.code })
          
          if (profileError && profileError.code === "PGRST116") {
            // No partner profile exists - redirect to onboarding
            console.log("No partner profile found, redirecting to onboarding")
            finalRedirect = "/partner/onboarding"
          } else if (!profileError && partnerProfile) {
            // Partner profile exists - check status
            if (partnerProfile.status === 'approved') {
              console.log("Partner approved, redirecting to dashboard")
              finalRedirect = "/partner/dashboard"
            } else {
              console.log("Partner not approved, redirecting to onboarding")
              finalRedirect = "/partner/onboarding"
            }
          } else {
            // Error checking profile, go to onboarding
            console.log("Error checking partner profile, redirecting to onboarding")
            finalRedirect = "/partner/onboarding"
          }
        } catch (profileError) {
          console.error('Error checking partner profile:', profileError)
          finalRedirect = "/partner/onboarding"
        }
      }
      
      // Redirect to final destination
      console.log("Final redirect:", finalRedirect)
      return NextResponse.redirect(`${origin}${finalRedirect}`)
      
    } catch (error) {
      console.error("Callback error:", error)
      return NextResponse.redirect(`${origin}/auth/error?message=${encodeURIComponent('Authentication failed')}`)
    }
  }

  console.log("No code provided, redirecting to error")
  // If there's no code and no error, this might be a direct access
  return NextResponse.redirect(`${origin}/auth/error?message=${encodeURIComponent('No authorization code provided. This URL should only be accessed via OAuth redirect.')}`)
}
