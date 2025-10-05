import { type NextRequest, NextResponse } from "next/server"


// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'
export async function POST(req: NextRequest) {
  // Document upload feature is disabled in current build
  return NextResponse.json({ 
    error: "Document upload feature is currently disabled" 
  }, { status: 503 })
}
