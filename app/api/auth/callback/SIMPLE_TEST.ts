import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin
  
  console.log(' OAuth callback hit:', { hasCode: !!code, url: requestUrl.toString() })

  if (code) {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    console.log(' Exchanging code for session...')
    await supabase.auth.exchangeCodeForSession(code)
    console.log(' Session established!')
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(\/)
}
