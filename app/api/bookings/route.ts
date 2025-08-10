import { NextResponse } from "next/server"
import { db } from "@/lib/database"
import type { Booking } from "@/lib/types"

export async function POST(request: Request) {
  try {
    const bookingData = await request.json()

    const booking: Booking = {
      id: `booking_${Date.now()}`,
      serviceId: bookingData.serviceId,
      centerId: bookingData.centerId,
      date: bookingData.date,
      time: bookingData.time,
      status: "confirmed",
      patientName: bookingData.patientName,
      patientAge: bookingData.patientAge,
      patientGender: bookingData.patientGender,
      patientPhone: bookingData.patientPhone,
      patientEmail: bookingData.patientEmail || "",
      notes: bookingData.notes || "",
      totalAmount: bookingData.totalAmount,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    db.bookings.push(booking)

    return NextResponse.json(booking)
  } catch (error) {
    console.error("Booking creation error:", error)
    return NextResponse.json({ error: "Failed to create booking" }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json(db.bookings)
}
