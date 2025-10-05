import { NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"


// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'
// Dummy admin credentials (in production, these should be in environment variables)
const ADMIN_CREDENTIALS = {
  email: 'admin@scanezy.com',
  password: 'admin123'
}

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json()
    
    // Simple credential validation
    if (username === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
      // Create JWT token
      const token = jwt.sign(
        { 
          sub: ADMIN_CREDENTIALS.email,
          role: 'admin',
          iat: Math.floor(Date.now() / 1000)
        },
        process.env.ADMIN_MVP_SECRET || 'fallback-secret',
        { expiresIn: '7d' }
      )
      
      // Set HTTP-only cookie
      const response = NextResponse.json({ success: true, user: ADMIN_CREDENTIALS.email })
      response.cookies.set('mvp_admin', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 // 7 days
      })
      
      return response
    } else {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }
  } catch (error) {
    console.error('Admin login error:', error)
    return NextResponse.json({ error: 'Login failed' }, { status: 500 })
  }
}

// Keep the Google OAuth flow as backup (in case it's needed later)
export async function GET(req: NextRequest) {
  // For now, redirect to the simple login form
  return NextResponse.redirect(new URL('/admin/login', req.url))
}
