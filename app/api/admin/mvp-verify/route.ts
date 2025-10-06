import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";


// Force dynamic rendering for this API route
export const dynamic = "force-dynamic";
export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("mvp_admin")?.value;
    
    if (!token) {
      return NextResponse.json({ isAdmin: false }, { status: 401 });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.ADMIN_MVP_SECRET!) as any;
    
    if (decoded.role === "admin") {
      return NextResponse.json({ isAdmin: true, user: decoded.sub });
    }
    
    return NextResponse.json({ isAdmin: false }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ isAdmin: false }, { status: 401 });
  }
}

export async function DELETE(req: NextRequest) {
  // Logout endpoint
  const response = NextResponse.json({ success: true });
  response.cookies.delete("mvp_admin");
  return response;
}
