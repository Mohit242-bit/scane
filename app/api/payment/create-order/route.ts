import { type NextRequest, NextResponse } from "next/server";
import { payment } from "@/lib/payment";
import { db } from "@/lib/database";


// Force dynamic rendering for this API route
export const dynamic = "force-dynamic";
export async function POST(req: NextRequest) {
  try {
    const { bookingId } = await req.json();

    // Find booking
    const booking = await db.bookings.findById(bookingId);
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (booking.status !== "PENDING") {
      return NextResponse.json({ error: "Booking is not pending payment" }, { status: 400 });
    }

    // Create Razorpay order
    const order = await payment.createOrder(booking.amount + booking.fee, bookingId);

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json({ error: "Failed to create payment order" }, { status: 500 });
  }
}
