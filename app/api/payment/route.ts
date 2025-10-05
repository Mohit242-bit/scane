import { type NextRequest, NextResponse } from "next/server"
import { payment } from "@/lib/payment"
import { db, redis } from "@/lib/database"
import { notifications } from "@/lib/notifications"
import { analytics } from "@/lib/analytics"


// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'
export async function POST(req: NextRequest) {
  try {
    const { bookingId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json()

    // Find booking
    const booking = await db.bookings.findById(bookingId)
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    // Check if slot is still held
    const slotHold = await redis.get(`slot_hold:${booking.slot_id}`)
    if (!slotHold || slotHold !== bookingId) {
      return NextResponse.json({ error: "Slot hold expired" }, { status: 409 })
    }

    // Verify payment signature
    const isValidPayment = payment.verifyPayment(razorpay_order_id, razorpay_payment_id, razorpay_signature)

    if (!isValidPayment) {
      await analytics.trackPaymentFailed(booking.user_id, bookingId, "Invalid signature")
      return NextResponse.json({ error: "Payment verification failed" }, { status: 400 })
    }

    // Update booking with payment details
    const updatedBooking = await db.bookings.updatePayment(bookingId, {
      payment_id: razorpay_payment_id,
      razorpay_order_id,
      razorpay_payment_id,
    })

    // Release slot hold
    await redis.del(`slot_hold:${booking.slot_id}`)

    // Send confirmation notifications
    await notifications.sendNotification({
      userId: booking.user_id,
      bookingId: bookingId,
      type: "booking_confirmation",
      channels: ["whatsapp", "sms", "email"],
      content: {
        bookingId,
        serviceName: "MRI Brain", // Would come from service lookup
        centerName: "Precision Imaging", // Would come from center lookup
        dateTime: new Date().toLocaleString(),
        amount: booking.amount,
        patientName: "Patient", // Would come from user lookup
        prepInstructions: "Please arrive 15 minutes early and bring your ID.",
      },
    })

    // Track successful payment
    await analytics.trackBookingCompleted(booking.user_id, bookingId, booking.amount)

    return NextResponse.json({
      success: true,
      bookingId: updatedBooking.id,
      status: updatedBooking.status,
    })
  } catch (error) {
    console.error("Payment processing error:", error)
    return NextResponse.json({ error: "Payment processing failed" }, { status: 500 })
  }
}
