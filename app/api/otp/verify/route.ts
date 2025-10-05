import { type NextRequest, NextResponse } from "next/server"
import { databaseOperations } from "@/lib/database"


// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'
const phoneSchema = {
  safeParse: (phone: string) => ({
    success: /^[6-9]\d{9}$/.test(phone),
    data: phone,
  }),
}

const otpSchema = {
  safeParse: (otp: string) => ({
    success: /^\d{6}$/.test(otp),
    data: otp,
  }),
}

export async function POST(req: NextRequest) {
  try {
    const { phone, code } = await req.json()

    // Validate input
    const phoneValidation = phoneSchema.safeParse(phone)
    const otpValidation = otpSchema.safeParse(code)

    if (!phoneValidation.success || !otpValidation.success) {
      return NextResponse.json({ error: "Invalid phone number or OTP" }, { status: 400 })
    }

    // Check OTP from Redis (mock - always accept 123456 for demo)
    if (code !== "123456") {
      return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 400 })
    }

    // Find or create user
    let user = await databaseOperations.users.findByPhone(phone)
    if (!user) {
      user = await databaseOperations.users.create({
        phone,
        name: `User ${phone.slice(-4)}`,
      })
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
      },
    })
  } catch (error) {
    console.error("OTP verification error:", error)
    return NextResponse.json({ error: "Failed to verify OTP" }, { status: 500 })
  }
}
