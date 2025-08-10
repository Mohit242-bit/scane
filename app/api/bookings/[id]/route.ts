import { NextResponse } from "next/server"
import { getBookingById } from "@/lib/database"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const booking = getBookingById(params.id)

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    return NextResponse.json(booking)
  } catch (error) {
    console.error("Fetch booking error:", error)
    return NextResponse.json({ error: "Failed to fetch booking" }, { status: 500 })
  }
}
