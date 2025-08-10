import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { v4 as uuidv4 } from "uuid"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const bookingId = searchParams.get("bookingId")

  if (!db.documents) db.documents = []

  let documents = db.documents
  if (bookingId) {
    documents = documents.filter((d) => d.booking_id === bookingId)
  }

  return NextResponse.json({ documents })
}

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const bookingId = formData.get("bookingId") as string
  const type = formData.get("type") as string
  const file = formData.get("file") as File

  if (!bookingId || !type || !file) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  const booking = db.bookings.find((b) => b.id === bookingId)
  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 })
  }

  // In production: upload to S3/R2 and get URL
  const mockUrl = `/uploads/${uuidv4()}-${file.name}`

  if (!db.documents) db.documents = []

  const document = {
    id: uuidv4(),
    booking_id: bookingId,
    type: type as "PRESCRIPTION" | "REPORT" | "INVOICE",
    url: mockUrl,
    filename: file.name,
    size: file.size,
    uploaded_by: "user",
    uploaded_ts: Date.now(),
  }

  db.documents.push(document)

  return NextResponse.json({ document })
}
