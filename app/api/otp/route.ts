import { type NextRequest, NextResponse } from "next/server";


// Force dynamic rendering for this API route
export const dynamic = "force-dynamic";
export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json();

    if (!phone) {
      return NextResponse.json({ error: "Phone number is required" }, { status: 400 });
    }

    // For demo purposes, always return success
    // In production, integrate with SMS service
    console.log(`Sending OTP to ${phone}: 123456`);

    return NextResponse.json({
      success: true,
      message: "OTP sent successfully. Use 123456 for demo.",
    });
  } catch (error) {
    console.error("OTP error:", error);
    return NextResponse.json({ error: "Failed to send OTP" }, { status: 500 });
  }
}
