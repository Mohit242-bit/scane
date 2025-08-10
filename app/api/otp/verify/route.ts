import { type NextRequest, NextResponse } from "next/server"
import { redis, db } from "@/lib/database"
import { phoneSchema, otpSchema } from "@/lib/validation"

export async function POST(req: NextRequest) {
  try {
    const { phone, code } = await req.json()

    // Validate input
    const phoneValidation = phoneSchema.safeParse(phone)
    const otpValidation = otpSchema.safeParse(code)

    if (!phoneValidation.success || !otpValidation.success) {
      return NextResponse.json({ error: "Invalid phone number or OTP" }, { status: 400 })
    }

    // Check OTP from Redis
    const storedOtp = await redis.get(`otp:${phone}`)
    if (!storedOtp || storedOtp !== code) {
      return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 400 })
    }

    // Find or create user
    let user = await db.users.findByPhone(phone)
    if (!user) {
      user = await db.users.create({ phone })
    }

    // Clean up OTP
    await redis.del(`otp:${phone}`)

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
