import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { v4 as uuidv4 } from "uuid"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const bookingId = searchParams.get("bookingId")
  const centerId = searchParams.get("centerId")

  let reviews = db.reviews || []

  if (bookingId) {
    reviews = reviews.filter((r) => r.booking_id === bookingId)
  }

  if (centerId) {
    // Would need to join with bookings to filter by center
    const centerBookings = db.bookings.filter((b) => b.center_id === centerId)
    const centerBookingIds = centerBookings.map((b) => b.id)
    reviews = reviews.filter((r) => centerBookingIds.includes(r.booking_id))
  }

  return NextResponse.json({ reviews })
}

export async function POST(req: NextRequest) {
  const { bookingId, rating, comment } = await req.json()

  if (!bookingId || !rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Invalid review data" }, { status: 400 })
  }

  const booking = db.bookings.find((b) => b.id === bookingId)
  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 })
  }

  if (!db.reviews) db.reviews = []

  const review = {
    id: uuidv4(),
    booking_id: bookingId,
    rating,
    comment: comment || "",
    created_ts: Date.now(),
  }

  db.reviews.push(review)

  return NextResponse.json({ review })
}
