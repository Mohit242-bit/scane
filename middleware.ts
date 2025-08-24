import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createServerClient, type CookieOptions } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // Get the session
  const { data: { session } } = await supabase.auth.getSession()

  // Admin route protection
  if (pathname.startsWith("/admin")) {
    // Allow access to admin login page
    if (pathname === "/admin/login") {
      // Redirect to dashboard if already logged in as admin
      if (session) {
        return NextResponse.redirect(new URL("/admin/dashboard", request.url))
      }
      return response
    }
    
    // For other admin routes, check if user is authenticated
    if (pathname.startsWith("/admin/dashboard") || pathname.startsWith("/admin/")) {
      // Check for MVP admin cookie (fallback for existing JWT auth)
      const mvpAdminCookie = request.cookies.get("mvp_admin")
      if (!mvpAdminCookie && !session) {
        return NextResponse.redirect(new URL("/admin/login", request.url))
      }
    }
  }

  // Partner route protection
  if (pathname.startsWith("/partner")) {
    // Allow access to partner login page
    if (pathname === "/partner/login") {
      // Redirect to dashboard if already logged in as partner
      if (session?.user) {
        return NextResponse.redirect(new URL("/partner/dashboard", request.url))
      }
      return response
    }
    
    // Allow access to onboarding for authenticated users
    if (pathname === "/partner/onboarding") {
      if (!session?.user) {
        return NextResponse.redirect(new URL("/partner/login", request.url))
      }
      return response
    }
    
    // Protect all other partner routes
    if (!session?.user) {
      return NextResponse.redirect(new URL("/partner/login", request.url))
    }
  }

  // Admin API route protection
  if (pathname.startsWith("/api/admin")) {
    const mvpAdminCookie = request.cookies.get("mvp_admin")
    if (!mvpAdminCookie && !session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
  }

  return response
}

export const config = {
  matcher: [
    "/admin/:path*", 
    "/partner/:path*", 
    "/api/admin/:path*",
    "/((?!_next/static|_next/image|favicon.ico|api/auth).*)"],
}
