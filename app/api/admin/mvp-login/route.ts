
import { NextRequest, NextResponse } from "next/server"
import supabase from "@/lib/supabaseClient"

export async function GET(req: NextRequest) {
  // Get the redirect_to parameter from the query string
  const { searchParams } = new URL(req.url)
  const redirectTo = searchParams.get('redirect_to') || '/admin/dashboard'
  
  // Construct the callback URL with the redirect destination
  const callbackUrl = `${process.env.GOOGLE_OAUTH_CALLBACK_URL}?redirectTo=${encodeURIComponent(redirectTo)}`
  
  console.log("Redirect URI sent to Google:", callbackUrl);
  console.log("Final redirect destination:", redirectTo);
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: callbackUrl,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent'
      }
    }
  })
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  // Redirect user to Google OAuth URL
  return NextResponse.redirect(data.url)
}
